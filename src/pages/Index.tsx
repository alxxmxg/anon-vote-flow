import { VoteProvider, useVote } from "@/context/VoteContext";
import AvisoPrivacidad from "@/components/AvisoPrivacidad";
import LoginForm from "@/components/LoginForm";
import OTPForm from "@/components/OTPForm";
import BoletaVotacion from "@/components/BoletaVotacion";
import PantallaExito from "@/components/PantallaExito";
import ArcoModule from "@/components/ArcoModule";
import StepIndicator from "@/components/StepIndicator";
import ThemeToggle from "@/components/ThemeToggle";
import { isConsultaActive, getConsultaConfig } from "@/lib/mockDB";
import { CalendarX } from "lucide-react";

function ConsultaClosed() {
  const cfg = getConsultaConfig();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-background text-center">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <CalendarX className="w-14 h-14 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold text-foreground mb-2">{cfg.titulo}</h1>
      <p className="text-muted-foreground text-sm mb-1">La consulta no está disponible en este momento.</p>
      {cfg.startDate && new Date() < new Date(cfg.startDate) && (
        <p className="text-xs text-muted-foreground mt-2">
          Comienza el {new Date(cfg.startDate).toLocaleString("es-MX")}
        </p>
      )}
      {cfg.endDate && new Date() > new Date(cfg.endDate) && (
        <p className="text-xs text-muted-foreground mt-2">
          La votación cerró el {new Date(cfg.endDate).toLocaleString("es-MX")}
        </p>
      )}
      <div className="flex gap-4 mt-8 text-xs text-muted-foreground">
        <a href="/resultados" className="hover:text-primary transition-colors">Ver resultados →</a>
        <a href="/verificar"  className="hover:text-primary transition-colors">Verificar folio →</a>
      </div>
    </div>
  );
}

function ConsultaFlow() {
  const { step } = useVote();

  if (!isConsultaActive() && step === "privacy") return <ConsultaClosed />;

  return (
    <div className="relative">
      <div className="absolute top-2 right-3 z-20"><ThemeToggle /></div>
      {step !== "arco" && <StepIndicator step={step} />}
      {step === "privacy"  && <AvisoPrivacidad />}
      {step === "login"    && <LoginForm />}
      {step === "otp"      && <OTPForm />}
      {step === "ballot"   && <BoletaVotacion />}
      {step === "success"  && <PantallaExito />}
      {step === "arco"     && <ArcoModule />}
    </div>
  );
}

const Index = () => (
  <VoteProvider>
    <ConsultaFlow />
  </VoteProvider>
);

export default Index;
