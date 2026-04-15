import { useState } from "react";
import { useVote } from "@/context/VoteContext";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, Wrench, Shield, Monitor, BookOpen, Bus, MessageSquare, X, Loader2 } from "lucide-react";
import { castVote } from "@/lib/mockDB";
import { useProblematicas } from "@/lib/supabaseHooks";

// Icons map for each default id
const ICONS: Record<string, React.ReactNode> = {
  mantenimiento:    <Wrench   className="w-5 h-5" />,
  seguridad:        <Shield   className="w-5 h-5" />,
  equipo_obsoleto:  <Monitor  className="w-5 h-5" />,
  oferta_academica: <BookOpen className="w-5 h-5" />,
  transporte:       <Bus      className="w-5 h-5" />,
};

export default function BoletaVotacion() {
  const { setStep, setFolio, email, numeroControl } = useVote();
  const { data: problematicas, isLoading: loadingProbs } = useProblematicas();
  
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [notes,        setNotes]        = useState<Record<string, string>>({});
  const [showNote,     setShowNote]     = useState<Set<string>>(new Set());
  const [loading,      setLoading]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [error,        setError]        = useState("");

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setShowNote((s) => { const n = new Set(s); n.delete(id); return n; });
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNote((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleVote = () => {
    if (selected.size === 0) { setError("Selecciona al menos una problemática."); return; }
    setError(""); setShowConfirm(true);
  };

  const confirmVote = async () => {
    setLoading(true); setError("");
    await new Promise((r) => setTimeout(r, 800));
    const result = await castVote(email, numeroControl, Array.from(selected), notes);
    if (!result.success) {
      setError(result.error ?? "Error al procesar tu voto."); setLoading(false); setShowConfirm(false); return;
    }
    setFolio(result.folio!); setLoading(false); setStep("success");
  };

  const selectedCount = selected.size;

  if (loadingProbs || !problematicas) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-4">
        <h1 className="text-lg font-bold text-foreground">Consulta Universitaria</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Selecciona las problemáticas prioritarias y añade una nota opcional</p>
      </div>

      <div className="px-5 pt-4 pb-2 flex items-center gap-3">
        <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
          <Check className="w-3.5 h-3.5" />{selectedCount} / {problematicas.length} seleccionadas
        </div>
        {selectedCount === 0 && <span className="text-xs text-muted-foreground">Puedes elegir de 1 a {problematicas.length}</span>}
      </div>

      {error && <div className="px-5 mb-2"><p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p></div>}

      <div id="tour-boleta-list" className="flex-1 px-5 pb-32 space-y-3 pt-1">
        {problematicas.map((p) => {
          const isSelected = selected.has(p.id);
          const noteOpen   = showNote.has(p.id);
          const noteText   = notes[p.id] ?? "";
          return (
            <div key={p.id} className={`rounded-xl border-2 transition-all duration-200 overflow-hidden ${
              isSelected ? "bg-primary/5 border-primary shadow-sm" : "bg-card border-border hover:border-primary/40 hover:shadow-sm"
            }`}>
              <button type="button" onClick={() => toggleSelect(p.id)} className="w-full text-left p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}>
                    {ICONS[p.id] ?? <Shield className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{p.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{p.description}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    isSelected ? "bg-primary border-primary" : "border-border"
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                  </div>
                </div>
              </button>

              {isSelected && (
                <div className="border-t border-border/60">
                  <button type="button" onClick={(e) => toggleNote(p.id, e)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    {noteOpen ? "Cerrar nota" : noteText ? `Nota: "${noteText.slice(0, 40)}${noteText.length > 40 ? "…" : ""}"` : "Añadir una nota (opcional)"}
                    {noteOpen && <X className="w-3 h-3 ml-auto" />}
                  </button>
                  {noteOpen && (
                    <div className="px-4 pb-4">
                      <textarea value={noteText} onChange={(e) => setNotes((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        onClick={(e) => e.stopPropagation()} placeholder="Describe con más detalle..."
                        maxLength={500} rows={3}
                        className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary resize-none transition-all" />
                      <p className="text-xs text-muted-foreground text-right mt-1">{(notes[p.id] ?? "").length}/500</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-5">
        <Button id="tour-boleta-btn" onClick={handleVote} disabled={selectedCount === 0 || loading}
          className="w-full h-12 text-base font-semibold rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground">
          {loading ? "Procesando..." : selectedCount === 0
            ? "Selecciona al menos una opción"
            : `Emitir Voto Anónimo (${selectedCount} seleccionada${selectedCount > 1 ? "s" : ""})`}
        </Button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end sm:items-center justify-center p-5">
          <div className="w-full max-w-md bg-card rounded-2xl p-6 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-center text-card-foreground mb-2">¿Confirmar tu voto?</h2>
            <p className="text-sm text-muted-foreground text-center mb-4">{selectedCount} problemática{selectedCount > 1 ? "s" : ""} seleccionada{selectedCount > 1 ? "s" : ""}:</p>
            <div className="bg-muted rounded-xl p-3 mb-4 space-y-3">
              {Array.from(selected).map((id) => {
                const p = problematicas.find((x) => x.id === id)!;
                const nota = notes[id]?.trim();
                return (
                  <div key={id}>
                    <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /><p className="text-sm font-medium text-foreground">{p?.label}</p></div>
                    {nota && <p className="text-xs text-muted-foreground ml-5 mt-1 italic">"{nota}"</p>}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground text-center mb-6">Esta acción es irreversible. Voto y notas registrados de forma anónima.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowConfirm(false)} className="flex-1 h-11 rounded-xl" disabled={loading}>Cancelar</Button>
              <Button onClick={confirmVote} disabled={loading} className="flex-1 h-11 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground">
                {loading ? "Enviando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
