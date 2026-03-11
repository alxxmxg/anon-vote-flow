import { useVote } from "@/context/VoteContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Edit, UserCheck } from "lucide-react";

export default function ArcoModule() {
  const { setStep, email, numeroControl } = useVote();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-4">
        <button
          onClick={() => setStep("login")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <h1 className="text-lg font-bold text-foreground">Privacidad y Derechos ARCO</h1>
      </div>

      <div className="flex-1 px-5 py-6 space-y-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Tus datos registrados</p>
              <p className="text-xs text-muted-foreground">Información almacenada en el sistema</p>
            </div>
          </div>

          <div className="space-y-3 bg-muted rounded-lg p-4">
            <div>
              <p className="text-xs text-muted-foreground">Correo institucional</p>
              <p className="text-sm font-medium text-foreground">
                {email || "No registrado aún"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Número de control</p>
              <p className="text-sm font-medium text-foreground">
                {numeroControl || "No registrado aún"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-foreground">Ejercer tus derechos</h2>

          <button className="w-full flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-colors text-left">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Acceso</p>
              <p className="text-xs text-muted-foreground">Descargar una copia de todos tus datos almacenados.</p>
            </div>
          </button>

          <button className="w-full flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-colors text-left">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Edit className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Rectificación</p>
              <p className="text-xs text-muted-foreground">Solicitar la corrección de datos incorrectos.</p>
            </div>
          </button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Las solicitudes ARCO serán procesadas y validadas por el administrador del sistema en un plazo máximo de 15 días hábiles. Tu voto anónimo no puede ser accedido ni modificado ya que no está vinculado a tu identidad.
        </p>
      </div>
    </div>
  );
}
