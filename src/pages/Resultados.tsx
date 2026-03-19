import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useConsultaConfig, useResultados, useParticipantes, useNotasAnonimas } from "@/lib/supabaseHooks";
import { Users, BarChart3, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareQuote } from "lucide-react"; // O cualquier icono de mensaje que prefieras
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const LABELS: Record<string, string> = {
  mantenimiento:    "Mantenimiento",
  seguridad:        "Seguridad",
  equipo_obsoleto:  "Equipo Obsoleto",
  oferta_academica: "Oferta Académica",
  transporte:       "Transporte",
};
//Este componente maneja el carrusel de cada opción y un dialogo para ver todos
const ComentariosCarrusel = ({ comentarios, titulo }: { comentarios: string[], titulo: string }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Solo inicia el temporizador si hay más de un comentario
    if (comentarios.length <= 1) return;
    
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % comentarios.length);
    }, 4000); // Cambia cada 4 segundos

    return () => clearInterval(interval);
  }, [comentarios]);

  // Si no hay comentarios, no renderiza nada
  if (comentarios.length === 0) return null;

  return (
    <div className="mt-3 flex items-center gap-2">
      <div className="flex-1 bg-muted/20 border border-border/50 rounded-lg p-3 relative overflow-hidden h-14 flex items-center shadow-inner">
        <div className="absolute left-2.5 opacity-10">
          <MessageSquareQuote className="w-4 h-4 text-primary" />
        </div>
        <div className="pl-6 pr-2 w-full">
          <AnimatePresence mode="wait">
            <motion.p
              key={index} // Clave crucial para que Framer Motion detecte el cambio y anime
              initial={{ opacity: 0, y: 15 }} // Empieza abajo y transparente
              animate={{ opacity: 1, y: 0 }}  // Sube y se hace opaco
              exit={{ opacity: 0, y: -15 }}   // Sube más y se desvanece
              transition={{ duration: 0.4 }}    // Duración de la animación
              className="text-[11px] italic text-muted-foreground line-clamp-2 leading-tight"
            >
              "{comentarios[index]}"
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="h-14 w-14 shrink-0 rounded-lg bg-muted/20 border-border/50 hover:bg-muted/50">
            <MessageSquareQuote className="h-5 w-5 text-muted-foreground" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Comentarios Anónimos</DialogTitle>
            <DialogDescription>
              Opiniones sobre: <span className="font-semibold text-foreground">{titulo}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-2 space-y-3 flex-1 py-4">
            {comentarios.map((c, i) => (
              <div key={i} className="bg-muted/20 p-3 flex gap-3 text-sm rounded-md border border-border/50">
                <MessageSquareQuote className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-foreground italic leading-relaxed text-[13px]">"{c}"</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const COLORS = ["hsl(220,70%,45%)", "hsl(160,60%,40%)", "hsl(38,92%,50%)", "hsl(280,60%,50%)", "hsl(0,65%,50%)"];

export default function ResultadosPage() {
  const { data: cfg, isLoading: loadingCfg } = useConsultaConfig();
  const { data: rawResultados, isLoading: loadingRes, refetch: refetchRes } = useResultados();
  const { data: participantes = 0, isLoading: loadingPart, refetch: refetchPart } = useParticipantes();
  const { data: notas = {}, isLoading: loadingNotas, refetch: refetchNotas } = useNotasAnonimas();
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const load = () => {
    refetchRes();
    refetchPart();
    refetchNotas();
    setLastUpdate(new Date());
  };

  if (loadingCfg || loadingRes || loadingPart || loadingNotas || !cfg || !rawResultados) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const resultados = Object.entries(rawResultados)
    .map(([problematica, votos]) => ({ problematica, votos }))
    .sort((a, b) => b.votos - a.votos);

  const totalVotos = resultados.reduce((a, r) => a + r.votos, 0);

  const chartData = resultados.map((r) => ({
    name: LABELS[r.problematica] ?? r.problematica,
    votos: r.votos,
    pct: totalVotos > 0 ? +((r.votos / totalVotos) * 100).toFixed(1) : 0,
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      {/* Header */}
      <div className="px-5 pt-12 pb-6 text-center border-b border-border">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3">
          <BarChart3 className="w-3.5 h-3.5" /> Resultados en tiempo real
        </div>
        <h1 className="text-2xl font-bold text-foreground">{cfg.titulo}</h1>
        <p className="text-sm text-muted-foreground">{cfg.institucion}</p>
      </div>

      {/* Stats */}
      <div className="px-5 py-4 grid grid-cols-2 gap-3 max-w-lg mx-auto">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Users className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{participantes}</p>
          <p className="text-xs text-muted-foreground">Participantes</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <BarChart3 className="w-5 h-5 text-accent mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{totalVotos}</p>
          <p className="text-xs text-muted-foreground">Votos totales</p>
        </div>
      </div>

      {/* Chart */}
      <div className="px-5 max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">Distribución de votos</h2>
          {totalVotos === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">Aún no hay votos registrados</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  angle={-18}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: 12,
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number, _: string, entry: { payload: { pct: number } }) =>
                    [`${value} votos (${entry.payload.pct}%)`, ""]
                  }
                />
                <Bar dataKey="votos" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Ranking list */}
        <div className="space-y-2 mb-6">
          {resultados.map((r, i) => {
            const comments = notas[r.problematica]?.map(n => n.nota) || [];
            
            return (
              <div key={r.problematica} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: COLORS[i % COLORS.length] }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{LABELS[r.problematica] ?? r.problematica}</p>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{
                          width: `${totalVotos > 0 ? (r.votos / resultados[0].votos) * 100 : 0}%`,
                          background: COLORS[i % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground">{r.votos}</p>
                    <p className="text-xs text-muted-foreground">
                      {totalVotos > 0 ? ((r.votos / totalVotos) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
                {comments.length > 0 && (
                  <ComentariosCarrusel comentarios={comments} titulo={LABELS[r.problematica] ?? r.problematica} />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between py-2 mb-8">
          <p className="text-xs text-muted-foreground">
            Actualizado: {lastUpdate.toLocaleTimeString("es-MX")}
          </p>
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5 text-xs">
            <RefreshCw className="w-3 h-3" /> Actualizar
          </Button>
        </div>

        <div className="flex justify-center gap-6 text-xs text-muted-foreground pb-8 border-t border-border pt-4">
          <a href="/" className="hover:text-primary transition-colors">← Votación</a>
          <a href="/verificar" className="hover:text-primary transition-colors">Verificar folio</a>
        </div>
      </div>
    </div>
  );
}
