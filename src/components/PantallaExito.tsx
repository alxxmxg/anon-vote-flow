import { useVote } from "@/context/VoteContext";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, Check, Building2, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { useConsultaConfig } from "@/lib/supabaseHooks";

export default function PantallaExito() {
  const { folio, signOut } = useVote();
  const [copied, setCopied] = useState(false);
  const { data: cfg, isLoading } = useConsultaConfig();

  const handleCopy = async () => {
    if (!folio) return;
    await navigator.clipboard.writeText(folio);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading || !cfg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-8 bg-background">
      <div className="w-full max-w-md">
        {/* Logo / Institución */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center animate-in zoom-in-50 duration-500">
            <CheckCircle2 className="w-10 h-10 text-accent" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-1">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground font-medium">{cfg.institucion}</p>
        </div>

        <h1 className="text-2xl font-bold text-foreground text-center mb-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
          ¡Voto Registrado!
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6 animate-in fade-in duration-700">
          Tu participación ha sido registrada de forma <strong>anónima y segura</strong>.
        </p>

        {/* Comprobante */}
        <div className="bg-card border-2 border-border rounded-2xl overflow-hidden mb-6 animate-in fade-in slide-in-from-bottom-3 duration-700">
          {/* Header del comprobante */}
          <div className="bg-primary px-5 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-primary-foreground/70 font-medium uppercase tracking-wider">Comprobante de Participación</p>
              <p className="text-sm text-primary-foreground font-semibold">{cfg.titulo}</p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-primary-foreground/80" />
          </div>

          {/* Folio */}
          <div className="px-5 py-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
              Folio de participación
            </p>
            <div className="flex items-center justify-between bg-muted rounded-lg px-4 py-3">
              <p className="font-mono text-xs text-foreground break-all text-left">{folio}</p>
              <button
                onClick={handleCopy}
                className="ml-3 p-2 rounded-lg hover:bg-background transition-colors shrink-0"
                title="Copiar folio"
              >
                {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-border space-y-1">
              <p className="text-xs text-muted-foreground">
                📅 {new Date().toLocaleString("es-MX", { dateStyle: "long", timeStyle: "short" })}
              </p>
              <p className="text-xs text-muted-foreground">
                🔒 Anonimato garantizado — sin vínculo con tu identidad
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mb-5">
          Guarda tu folio para verificarlo en <a href="/verificar" className="text-primary underline">votouni/verificar</a>
        </p>

        <div className="flex gap-3">
          <Button
            onClick={() => window.open("/verificar", "_blank")}
            variant="outline"
            className="flex-1 h-11 rounded-xl text-sm gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Verificar
          </Button>
          <Button
            onClick={signOut}
            className="flex-1 h-11 rounded-xl text-sm"
          >
            Finalizar
          </Button>
        </div>
      </div>
    </div>
  );
}
