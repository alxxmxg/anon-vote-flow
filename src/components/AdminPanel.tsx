import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, FileText, LogOut, Shield } from "lucide-react";

interface Resultado {
  problematica: string;
  votos: number;
}

interface SolicitudArco {
  id: string;
  tipo: string;
  descripcion: string;
  estado: string;
  created_at: string;
}

const LABELS: Record<string, string> = {
  mantenimiento: "Mantenimiento",
  seguridad: "Seguridad",
  equipo_obsoleto: "Equipo Obsoleto",
  oferta_academica: "Oferta Académica",
  transporte: "Transporte",
};

export default function AdminPanel() {
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudArco[]>([]);
  const [totalVotantes, setTotalVotantes] = useState(0);
  const [tab, setTab] = useState<"resultados" | "arco">("resultados");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [resResult, arcoResult, padronResult] = await Promise.all([
      supabase.from("resultados_consulta").select("problematica, votos").order("votos", { ascending: false }),
      supabase.from("solicitudes_arco").select("*").order("created_at", { ascending: false }),
      supabase.from("padron_electoral").select("id", { count: "exact" }).eq("participo", true),
    ]);

    if (resResult.data) setResultados(resResult.data);
    if (arcoResult.data) setSolicitudes(arcoResult.data);
    if (padronResult.count !== null) setTotalVotantes(padronResult.count);
    setLoading(false);
  };

  const updateArcoStatus = async (id: string, estado: "pendiente" | "en_proceso" | "completada" | "rechazada") => {
    await supabase.from("solicitudes_arco").update({ estado }).eq("id", id);
    loadData();
  };

  const totalVotos = resultados.reduce((acc, r) => acc + r.votos, 0);
  const maxVotos = Math.max(...resultados.map((r) => r.votos), 1);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando panel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Panel Administrativo</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-1" /> Salir
        </Button>
      </div>

      {/* Stats */}
      <div className="px-5 py-4 grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground">Participantes</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalVotantes}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-accent" />
            <p className="text-xs text-muted-foreground">Votos totales</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalVotos}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 flex gap-2 mb-4">
        <button
          onClick={() => setTab("resultados")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "resultados" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-1.5" />Resultados
        </button>
        <button
          onClick={() => setTab("arco")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "arco" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          <FileText className="w-4 h-4 inline mr-1.5" />ARCO ({solicitudes.length})
        </button>
      </div>

      <div className="px-5 pb-8">
        {tab === "resultados" ? (
          <div className="space-y-3">
            {resultados.map((r) => (
              <div key={r.problematica} className="bg-card border border-border rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-semibold text-foreground">
                    {LABELS[r.problematica] || r.problematica}
                  </p>
                  <p className="text-sm font-bold text-primary">{r.votos}</p>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${(r.votos / maxVotos) * 100}%` }}
                  />
                </div>
                {totalVotos > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {((r.votos / totalVotos) * 100).toFixed(1)}% del total
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {solicitudes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No hay solicitudes ARCO</p>
            ) : (
              solicitudes.map((s) => (
                <div key={s.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-semibold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {s.tipo}
                      </span>
                      <p className="text-sm text-foreground mt-2">{s.descripcion}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(s.created_at).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {s.estado === "pendiente" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => updateArcoStatus(s.id, "en_proceso")}>
                          En proceso
                        </Button>
                        <Button size="sm" onClick={() => updateArcoStatus(s.id, "completada")}>
                          Completar
                        </Button>
                      </>
                    )}
                    {s.estado === "en_proceso" && (
                      <Button size="sm" onClick={() => updateArcoStatus(s.id, "completada")}>
                        Marcar completada
                      </Button>
                    )}
                    {s.estado === "completada" && (
                      <span className="text-xs text-accent font-medium">✓ Completada</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
