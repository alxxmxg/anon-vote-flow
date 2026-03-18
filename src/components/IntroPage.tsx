import { useVote } from "@/context/VoteContext";
import { Button } from "@/components/ui/button";
import { useConsultaConfig } from "@/lib/supabaseHooks";
import { FileText, ArrowRight, Loader2 } from "lucide-react";

export default function IntroPage() {
  const { setStep } = useVote();
  const { data: cfg, isLoading } = useConsultaConfig();

  if (isLoading || !cfg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-8 text-center animate-in fade-in zoom-in-95 duration-700">
      
      {/* Container del Logo */}
      <div className="w-full max-w-sm mb-6 bg-white p-6 rounded-3xl shadow-sm border border-border/50">
        <img 
          src="/logotec.jpg" 
          alt="Logotipo Institucional" 
          className="w-full h-auto object-contain max-h-32"
        />
      </div>

      <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
        <FileText className="w-3.5 h-3.5" />
        Encuesta Oficial
      </div>

      <h1 className="text-3xl font-extrabold text-foreground mb-3 leading-tight tracking-tight">
        {cfg.titulo.split(' ').slice(0, 2).join(' ')} <br /> 
        {cfg.titulo.split(' ').slice(2).join(' ')}
      </h1>
      
      <p className="text-base text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
        Bienvenido al sistema de consulta institucional del <strong className="text-foreground">{cfg.institucion}</strong>. 
        Tu participación nos ayuda a detectar las problemáticas más importantes y mejorar nuestra comunidad. El proceso es anónimo, seguro y rápido.
      </p>

      <Button 
        onClick={() => setStep("privacy")}
        className="h-14 px-8 text-base font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all w-full max-w-xs gap-2"
        size="lg"
      >
        Comenzar Consulta <ArrowRight className="w-5 h-5" />
      </Button>

      <div className="mt-12 text-xs text-muted-foreground/70 space-y-1">
        <p>Sistema online · Conectado a la Nube Segura</p>
        <p>Tus datos son 100% confidenciales según la Ley de Privacidad</p>
      </div>
    </div>
  );
}
