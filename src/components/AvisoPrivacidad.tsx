import { Shield, FileText, Clock, Lock } from "lucide-react";
import { useVote } from "@/context/VoteContext";
import { Button } from "@/components/ui/button";

export default function AvisoPrivacidad() {
  const { setStep, setPrivacyAccepted } = useVote();

  const handleAccept = () => {
    setPrivacyAccepted(true);
    setStep("login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-8 bg-background">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-foreground mb-2">
          Aviso de Privacidad
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Sistema de Consulta Universitaria
        </p>

        <div id="tour-privacy-content" className="bg-card rounded-xl border border-border p-5 mb-6 space-y-4">
          <div className="flex gap-3">
            <FileText className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Datos recopilados</p>
              <p className="text-xs text-muted-foreground mt-1">
                Solo se solicitan tu correo institucional y número de control para verificar tu identidad como miembro de la comunidad.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Lock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Voto anónimo garantizado</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tu voto se desvincula completamente de tu identidad mediante un sistema de token ciego. Nadie puede saber qué votaste.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Retención limitada</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tus datos de registro serán eliminados de forma segura 30 días después de finalizada la consulta (RNF05/RNF06).
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mb-6">
          Tienes derecho a Acceder, Rectificar, Cancelar y Oponerte al tratamiento de tus datos (Derechos ARCO). Al continuar, aceptas este aviso.
        </p>

        <Button
          id="tour-privacy-btn"
          onClick={handleAccept}
          className="w-full h-12 text-base font-semibold rounded-xl"
        >
          Entendido y Aceptar
        </Button>
      </div>
    </div>
  );
}
