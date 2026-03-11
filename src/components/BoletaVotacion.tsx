import { useState } from "react";
import { useVote } from "@/context/VoteContext";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, Wrench, Shield, Monitor, BookOpen, Bus } from "lucide-react";

const MAX_SELECTIONS = 3;

interface Problematica {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const problematicas: Problematica[] = [
  {
    id: "mantenimiento",
    label: "Mantenimiento",
    description: "Falta de mantenimiento en aulas y áreas comunes.",
    icon: <Wrench className="w-5 h-5" />,
  },
  {
    id: "seguridad",
    label: "Seguridad",
    description: "Mejorar la seguridad dentro y fuera del campus.",
    icon: <Shield className="w-5 h-5" />,
  },
  {
    id: "equipo_obsoleto",
    label: "Equipo Obsoleto",
    description: "Actualización de equipo en laboratorios y biblioteca.",
    icon: <Monitor className="w-5 h-5" />,
  },
  {
    id: "oferta_academica",
    label: "Oferta Académica",
    description: "Ampliación de materias optativas y especializaciones.",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    id: "transporte",
    label: "Transporte",
    description: "Mejorar rutas y horarios del transporte universitario.",
    icon: <Bus className="w-5 h-5" />,
  },
];

export default function BoletaVotacion() {
  const { setStep, setFolio } = useVote();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= MAX_SELECTIONS) return prev;
      return [...prev, id];
    });
  };

  const handleVote = () => {
    if (selected.length === 0) return;
    setShowConfirm(true);
  };

  const confirmVote = () => {
    setLoading(true);
    // Simulate blind token + desvinculación
    // In production: POST /api/v1/vote with JWT, server does:
    //   1. UPDATE padron SET participo=true WHERE id=student
    //   2. UPDATE resultados SET votos=votos+1 WHERE problematica_id IN (...)
    setTimeout(() => {
      const folio = crypto.randomUUID();
      setFolio(folio);
      setLoading(false);
      setStep("success");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-4">
        <h1 className="text-lg font-bold text-foreground">Consulta Universitaria</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Selecciona hasta {MAX_SELECTIONS} problemáticas prioritarias
        </p>
      </div>

      {/* Counter badge */}
      <div className="px-5 pt-4 pb-2">
        <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
          <Check className="w-3.5 h-3.5" />
          {selected.length} / {MAX_SELECTIONS} seleccionadas
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 px-5 pb-32 space-y-3">
        {problematicas.map((p) => {
          const isSelected = selected.includes(p.id);
          const isDisabled = !isSelected && selected.length >= MAX_SELECTIONS;

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleToggle(p.id)}
              disabled={isDisabled}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? "bg-primary/5 border-primary shadow-sm"
                  : isDisabled
                  ? "bg-muted/50 border-border opacity-50 cursor-not-allowed"
                  : "bg-card border-border hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {p.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{p.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {p.description}
                  </p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    isSelected
                      ? "bg-primary border-primary"
                      : "border-border"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-5">
        <Button
          onClick={handleVote}
          disabled={selected.length === 0 || loading}
          className="w-full h-12 text-base font-semibold rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {loading ? "Procesando voto anónimo..." : `Emitir Voto Anónimo (${selected.length}/${MAX_SELECTIONS})`}
        </Button>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end sm:items-center justify-center p-5">
          <div className="w-full max-w-md bg-card rounded-2xl p-6 shadow-xl">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-center text-card-foreground mb-2">
              ¿Confirmar tu voto?
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-2">
              Has seleccionado {selected.length} problemática{selected.length > 1 ? "s" : ""}:
            </p>
            <div className="bg-muted rounded-lg p-3 mb-6">
              {selected.map((id) => {
                const p = problematicas.find((x) => x.id === id)!;
                return (
                  <p key={id} className="text-sm text-foreground py-1">
                    • {p.label}
                  </p>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground text-center mb-6">
              Esta acción es irreversible. Tu voto será registrado de forma anónima.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-11 rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmVote}
                disabled={loading}
                className="flex-1 h-11 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {loading ? "Enviando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
