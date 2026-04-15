import { useState } from "react";
import { Search, CheckCircle2, XCircle, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyFolio } from "@/lib/mockDB";
import { useConsultaConfig } from "@/lib/supabaseHooks";
import ThemeToggle from "@/components/ThemeToggle";
import TutorialButton from "@/components/TutorialButton";
import { useEffect } from "react";
import { startTutorial } from "@/lib/tutorialConfig";

export default function VerificarPage() {
  const [folio, setFolio] = useState("");
  const [result, setResult] = useState<"none" | "found" | "not_found">("none");
  const [loading, setLoading] = useState(false);
  const { data: cfg, isLoading: loadingCfg } = useConsultaConfig();

  const handleVerify = async () => {
    if (!folio.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const { exists } = await verifyFolio(folio.trim());
    setResult(exists ? "found" : "not_found");
    setLoading(false);
  };

  useEffect(() => {
    if (loadingCfg || !cfg) return;
    const tm = setTimeout(() => startTutorial("verificar", false), 300);
    return () => clearTimeout(tm);
  }, [loadingCfg, cfg]);

  if (loadingCfg || !cfg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-8">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-foreground mb-1">Verificar Folio</h1>
        <p className="text-sm text-muted-foreground text-center mb-1">{cfg.titulo}</p>
        <p className="text-xs text-muted-foreground text-center mb-8">
          Confirma que tu folio está registrado sin revelar cómo votaste.
        </p>

        <div className="flex gap-2 mb-4">
          <Input
            id="tour-verificar-input"
            value={folio}
            onChange={(e) => { setFolio(e.target.value); setResult("none"); }}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="h-12 rounded-xl font-mono text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          />
          <Button id="tour-verificar-btn" onClick={handleVerify} disabled={loading || !folio.trim()} className="h-12 px-5 rounded-xl shrink-0">
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {result === "found" && (
          <div className="flex gap-3 items-start bg-accent/10 border border-accent/30 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "hsl(160 60% 40%)" }} />
            <div>
              <p className="text-sm font-semibold text-foreground">Folio válido ✓</p>
              <p className="text-xs text-muted-foreground mt-0.5">Este folio está registrado en el sistema. Tu participación anónima está confirmada.</p>
            </div>
          </div>
        )}

        {result === "not_found" && (
          <div className="flex gap-3 items-start bg-destructive/10 border border-destructive/20 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2">
            <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Folio no encontrado</p>
              <p className="text-xs text-muted-foreground mt-0.5">Este folio no existe en el registro. Verifica que lo copiaste correctamente.</p>
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-10 justify-center text-xs text-muted-foreground">
          <a href="/" className="hover:text-primary transition-colors">← Votación</a>
          <a href="/resultados" className="hover:text-primary transition-colors">Ver resultados →</a>
        </div>
      </div>
      <TutorialButton />
    </div>
  );
}
