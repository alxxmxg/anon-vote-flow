import { VoteProvider, useVote } from "@/context/VoteContext";
import IntroPage from "@/components/IntroPage";
import AvisoPrivacidad from "@/components/AvisoPrivacidad";
import LoginForm from "@/components/LoginForm";
import OTPForm from "@/components/OTPForm";
import BoletaVotacion from "@/components/BoletaVotacion";
import PantallaExito from "@/components/PantallaExito";
import ArcoModule from "@/components/ArcoModule";
import StepIndicator from "@/components/StepIndicator";
import ThemeToggle from "@/components/ThemeToggle";
import { useConsultaConfig } from "@/lib/supabaseHooks";
import { CalendarX, Loader2 } from "lucide-react";
import TutorialButton from "@/components/TutorialButton";
import { useEffect } from "react";
import { startTutorial, TutorialStep } from "@/lib/tutorialConfig";

function ConsultaClosed({ cfg }: { cfg: any }) {
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
  const { data: cfg, isLoading } = useConsultaConfig();

  useEffect(() => {
    // Only fire tutorial for standard steps
    if (isLoading || !cfg) return; // Wait until loaded
    
    const validSteps = ["intro", "privacy", "login", "otp", "ballot"];
    if (validSteps.includes(step)) {
      const tm = setTimeout(() => {
        startTutorial(step as TutorialStep, false);
      }, 300); // give DOM time to paint
      return () => clearTimeout(tm);
    }
  }, [step, isLoading, cfg]);

  if (isLoading || !cfg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isConsultaActive = cfg.active && 
    (!cfg.startDate || new Date() >= new Date(cfg.startDate)) && 
    (!cfg.endDate || new Date() <= new Date(cfg.endDate));

  if (!isConsultaActive && (step === "privacy" || step === "intro")) return <ConsultaClosed cfg={cfg} />;

  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="absolute top-2 right-3 z-20"><ThemeToggle /></div>
      {step !== "arco" && step !== "intro" && <StepIndicator step={step} />}
      {step === "intro"    && <IntroPage />}
      {step === "privacy"  && <AvisoPrivacidad />}
      {step === "login"    && <LoginForm />}
      {step === "otp"      && <OTPForm />}
      {step === "ballot"   && <BoletaVotacion />}
      {step === "success"  && <PantallaExito />}
      {step === "arco"     && <ArcoModule />}
      <TutorialButton currentStep={step} />
    </div>
  );
}

const Index = () => (
  <VoteProvider>
    <ConsultaFlow />
  </VoteProvider>
);

export default Index;
