import { useState } from "react";
import { useVote } from "@/context/VoteContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Edit, UserCheck, Send, XCircle, Ban } from "lucide-react";
import { insertSolicitudArco } from "@/lib/mockDB";
import { Textarea } from "@/components/ui/textarea";

type ArcoTipo = "acceso" | "rectificacion" | "cancelacion" | "oposicion";

const ARCO_OPTIONS: { tipo: ArcoTipo; label: string; desc: string; icon: React.ReactNode }[] = [
  { tipo: "acceso", label: "Acceso", desc: "Solicitar una copia de todos tus datos almacenados.", icon: <Download className="w-5 h-5 text-secondary-foreground" /> },
  { tipo: "rectificacion", label: "Rectificación", desc: "Solicitar la corrección de datos incorrectos.", icon: <Edit className="w-5 h-5 text-secondary-foreground" /> },
  { tipo: "cancelacion", label: "Cancelación", desc: "Solicitar la eliminación de tus datos personales.", icon: <XCircle className="w-5 h-5 text-secondary-foreground" /> },
  { tipo: "oposicion", label: "Oposición", desc: "Oponerte al tratamiento de tus datos personales.", icon: <Ban className="w-5 h-5 text-secondary-foreground" /> },
];

const ARCO_LABELS: Record<ArcoTipo, string> = {
  acceso: "Acceso",
  rectificacion: "Rectificación",
  cancelacion: "Cancelación",
  oposicion: "Oposición",
};

export default function ArcoModule() {
  const { setStep, email, numeroControl } = useVote();
  const [showForm, setShowForm] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<ArcoTipo | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmitArco = async () => {
    if (!selectedTipo || !descripcion.trim() || !email) return;
    setLoading(true);
    setError("");

    await new Promise((r) => setTimeout(r, 600));

    insertSolicitudArco(email, selectedTipo, descripcion.trim());
    setSuccess(true);
    setLoading(false);
    setDescripcion("");
    setShowForm(false);
    setSelectedTipo(null);
  };

  const openForm = (tipo: ArcoTipo) => {
    setSelectedTipo(tipo);
    setShowForm(true);
    setSuccess(false);
    setError("");
  };

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
              <p className="text-sm font-medium text-foreground">{email || "No registrado aún"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Número de control</p>
              <p className="text-sm font-medium text-foreground">{numeroControl || "No registrado aún"}</p>
            </div>
          </div>
        </div>

        {success && (
          <div className="bg-accent/10 border border-accent/20 rounded-lg px-4 py-3 text-sm font-medium" style={{ color: "hsl(160 60% 40%)" }}>
            ✓ Solicitud ARCO enviada correctamente. Será procesada en un plazo máximo de 15 días hábiles.
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-foreground">Ejercer tus derechos</h2>

          {ARCO_OPTIONS.map((opt) => (
            <button
              key={opt.tipo}
              onClick={() => openForm(opt.tipo)}
              className="w-full flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                {opt.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {showForm && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground">
              Solicitud de {selectedTipo ? ARCO_LABELS[selectedTipo] : ""}
            </h3>
            <Textarea
              placeholder="Describe tu solicitud..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="min-h-[100px]"
            />
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleSubmitArco}
                disabled={loading || !descripcion.trim() || !email}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed">
          Las solicitudes ARCO serán procesadas en un plazo máximo de 15 días hábiles. Tu voto anónimo no puede ser accedido ni modificado ya que no está vinculado a tu identidad.
        </p>
      </div>
    </div>
  );
}
