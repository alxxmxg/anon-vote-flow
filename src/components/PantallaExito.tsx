import { useVote } from "@/context/VoteContext";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function PantallaExito() {
  const { folio } = useVote();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!folio) return;
    await navigator.clipboard.writeText(folio);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinish = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-8 bg-background">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center animate-in zoom-in-50 duration-500">
            <CheckCircle2 className="w-10 h-10 text-accent" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
          ¡Voto Registrado!
        </h1>
        <p className="text-sm text-muted-foreground mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
          Tu participación ha sido registrada de forma anónima y segura. Nadie puede vincular tu identidad con tu selección.
        </p>

        <div className="bg-card border border-border rounded-xl p-5 mb-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
            Folio de participación
          </p>
          <div className="flex items-center justify-between bg-muted rounded-lg px-4 py-3">
            <p className="font-mono text-sm text-foreground break-all text-left">{folio}</p>
            <button
              onClick={handleCopy}
              className="ml-3 p-2 rounded-lg hover:bg-background transition-colors shrink-0"
              title="Copiar folio"
            >
              {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Guarda este folio como comprobante de participación. No contiene información sobre tu voto.
          </p>
        </div>

        <Button
          onClick={handleFinish}
          variant="outline"
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          Finalizar
        </Button>
      </div>
    </div>
  );
}
