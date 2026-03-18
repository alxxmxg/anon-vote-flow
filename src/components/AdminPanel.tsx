import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import {
  BarChart3, Users, FileText, LogOut, Shield, Download,
  ChevronDown, ChevronUp, MessageSquare, Settings, RefreshCw,
  Trash2, Search, Printer, Tag,
} from "lucide-react";
import {
  getResultados, getSolicitudesArco, getParticipantes,
  getNotasForProblematica, updateArcoEstado, getProblematicasConfig,
  saveProblematicasConfig, getConsultaConfig, saveConsultaConfig,
  resetConsulta, getAllNotasGrouped,
  type ResultadoVoto, type SolicitudArco, type NotaAnonima,
  type ProblematicaConfig, type ConsultaConfig,
} from "@/lib/mockDB";
import ThemeToggle from "@/components/ThemeToggle";

const COLORS = ["hsl(220,70%,45%)", "hsl(160,60%,40%)", "hsl(38,92%,50%)", "hsl(280,60%,50%)", "hsl(0,65%,50%)"];

const ESTADO_COLORS: Record<string, string> = {
  pendiente:  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  en_proceso: "bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-300",
  completada: "bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-300",
  rechazada:  "bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-300",
};

type Tab = "resultados" | "arco" | "categorias" | "config";

export default function AdminPanel() {
  const [resultados,     setResultados]     = useState<ResultadoVoto[]>([]);
  const [solicitudes,    setSolicitudes]    = useState<SolicitudArco[]>([]);
  const [totalVotantes,  setTotalVotantes]  = useState(0);
  const [tab,            setTab]            = useState<Tab>("resultados");
  const [expandedNotes,  setExpandedNotes]  = useState<Set<string>>(new Set());
  const [notasMap,       setNotasMap]       = useState<Record<string, NotaAnonima[]>>({});
  const [noteSearch,     setNoteSearch]     = useState("");
  // categories
  const [probs,          setProbs]          = useState<ProblematicaConfig[]>([]);
  const [editingProb,    setEditingProb]    = useState<string | null>(null);
  const [probDraft,      setProbDraft]      = useState<ProblematicaConfig | null>(null);
  // config
  const [cfg,            setCfg]            = useState<ConsultaConfig>(getConsultaConfig());
  const [resetConfirm,   setResetConfirm]   = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    setResultados(getResultados());
    setSolicitudes(getSolicitudesArco());
    setTotalVotantes(getParticipantes());
    setNotasMap(getAllNotasGrouped());
    setProbs(getProblematicasConfig());
    setCfg(getConsultaConfig());
  };

  useEffect(() => { loadData(); }, []);

  // ---- Helpers ----
  const toggleNotes = (prob: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      next.has(prob) ? next.delete(prob) : next.add(prob);
      return next;
    });
  };

  const handleUpdateArco = (id: string, estado: SolicitudArco["estado"]) => {
    updateArcoEstado(id, estado);
    loadData();
  };

  const exportCSV = () => {
    const totalVotos = resultados.reduce((a, r) => a + r.votos, 0);
    const headers = ["Problemática", "Votos", "% del Total", "Notas Anónimas"];
    const labelMap: Record<string, string> = {};
    probs.forEach((p) => { labelMap[p.id] = p.label; });
    const rows = resultados.map((r) => {
      const notas = (notasMap[r.problematica] ?? []).map((n) => n.nota).join(" | ");
      return [
        labelMap[r.problematica] ?? r.problematica,
        r.votos,
        totalVotos > 0 ? ((r.votos / totalVotos) * 100).toFixed(1) + "%" : "0%",
        `"${notas.replace(/"/g, "'")}"`,
      ];
    });
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resultados_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  const handleReset = () => {
    resetConsulta();
    setResetConfirm(false);
    loadData();
  };

  const handleSaveConfig = () => {
    saveConsultaConfig(cfg);
    alert("Configuración guardada ✓");
  };

  const startEditProb = (p: ProblematicaConfig) => {
    setEditingProb(p.id);
    setProbDraft({ ...p });
  };

  const saveProb = () => {
    if (!probDraft) return;
    const updated = probs.map((p) => p.id === probDraft.id ? probDraft : p);
    saveProblematicasConfig(updated);
    setProbs(updated);
    setEditingProb(null);
  };

  const totalVotos = resultados.reduce((a, r) => a + r.votos, 0);
  const maxVotos   = Math.max(...resultados.map((r) => r.votos), 1);
  const labelMap: Record<string, string> = {};
  probs.forEach((p) => { labelMap[p.id] = p.label; });

  const chartData = resultados.map((r) => ({
    name: labelMap[r.problematica] ?? r.problematica,
    votos: r.votos,
    pct: totalVotos > 0 ? +((r.votos / totalVotos) * 100).toFixed(1) : 0,
  }));

  // Filtered notes
  const getFilteredNotas = (prob: string) => {
    const all = notasMap[prob] ?? [];
    if (!noteSearch.trim()) return all;
    return all.filter((n) => n.nota.toLowerCase().includes(noteSearch.toLowerCase()));
  };

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "resultados", label: "Resultados", icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { key: "arco",       label: `ARCO (${solicitudes.length})`, icon: <FileText className="w-3.5 h-3.5" /> },
    { key: "categorias", label: "Categorías", icon: <Tag className="w-3.5 h-3.5" /> },
    { key: "config",     label: "Config",     icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-background print:bg-white" ref={printRef}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-base font-bold text-foreground">Panel Administrativo</h1>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={handlePrint} title="Imprimir / PDF">
            <Printer className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/")}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block px-6 py-4 border-b">
        <h1 className="text-xl font-bold">{cfg.titulo} — {cfg.institucion}</h1>
        <p className="text-sm text-gray-500">Reporte generado: {new Date().toLocaleString("es-MX")}</p>
      </div>

      {/* Stats */}
      <div className="px-5 py-4 grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Users className="w-4 h-4 text-primary" /><p className="text-xs text-muted-foreground">Participantes</p></div>
          <p className="text-2xl font-bold text-foreground">{totalVotantes}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><BarChart3 className="w-4 h-4 text-accent" /><p className="text-xs text-muted-foreground">Votos totales</p></div>
          <p className="text-2xl font-bold text-foreground">{totalVotos}</p>
        </div>
      </div>

      {/* Links externos */}
      <div className="px-5 pb-2 flex gap-2 print:hidden">
        <a href="/resultados" target="_blank" className="text-xs text-primary hover:underline">Ver página pública →</a>
        <span className="text-xs text-muted-foreground">|</span>
        <a href="/verificar" target="_blank" className="text-xs text-primary hover:underline">Verificar folio →</a>
      </div>

      {/* Tabs */}
      <div className="px-5 flex gap-1.5 mb-4 flex-wrap print:hidden">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              tab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      <div className="px-5 pb-8">

        {/* ===== RESULTADOS ===== */}
        {tab === "resultados" && (
          <div className="space-y-4">
            {/* Actions */}
            <div className="flex gap-2 justify-end print:hidden">
              <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5 text-xs">
                <RefreshCw className="w-3 h-3" /> Actualizar
              </Button>
              <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5 text-xs">
                <Download className="w-3.5 h-3.5" /> CSV
              </Button>
            </div>

            {/* Recharts */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="text-sm font-semibold text-foreground mb-3">Distribución de votos</h2>
              {totalVotos === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">Aún no hay votos</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ bottom: 35 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-16} textAnchor="end" />
                    <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: 11 }}
                      formatter={(v: number, _: string, e: { payload: { pct: number } }) => [`${v} votos (${e.payload.pct}%)`, ""]}
                    />
                    <Bar dataKey="votos" radius={[6, 6, 0, 0]}>
                      {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Note search */}
            <div className="flex items-center gap-2 print:hidden">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Buscar en notas anónimas..."
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                className="h-9 text-sm rounded-xl"
              />
            </div>

            {/* Result cards with notes */}
            {resultados.map((r, i) => {
              const filteredNotas = getFilteredNotas(r.problematica);
              const notesExpanded = expandedNotes.has(r.problematica);
              return (
                <div key={r.problematica} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <p className="text-sm font-semibold text-foreground">{labelMap[r.problematica] ?? r.problematica}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{r.votos} votos</p>
                        {totalVotantes > 0 && <p className="text-xs text-muted-foreground">{((r.votos / totalVotantes) * 100).toFixed(1)}% de votantes</p>}
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="h-2.5 rounded-full transition-all duration-700"
                        style={{ width: `${(r.votos / maxVotos) * 100}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                    {totalVotos > 0 && <p className="text-xs text-muted-foreground mt-1">{((r.votos / totalVotos) * 100).toFixed(1)}% del total</p>}
                  </div>

                  {/* Notes toggle */}
                  <button onClick={() => toggleNotes(r.problematica)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 border-t border-border/60 text-xs text-muted-foreground hover:text-primary hover:bg-muted/30 transition-colors print:hidden">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    {filteredNotas.length === 0
                      ? (noteSearch ? "Sin coincidencias" : "Sin notas")
                      : `${filteredNotas.length} nota${filteredNotas.length > 1 ? "s" : ""} anónima${filteredNotas.length > 1 ? "s" : ""}`}
                    {filteredNotas.length > 0 && (notesExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />)}
                  </button>

                  {notesExpanded && filteredNotas.length > 0 && (
                    <div className="border-t border-border/60 bg-muted/20 divide-y divide-border/40">
                      {filteredNotas.map((nota) => (
                        <div key={nota.id} className="px-4 py-3">
                          <p className="text-sm text-foreground leading-relaxed">"{nota.nota}"</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Anónima — {new Date(nota.created_at).toLocaleDateString("es-MX", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ===== ARCO ===== */}
        {tab === "arco" && (
          <div className="space-y-3">
            {solicitudes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No hay solicitudes ARCO</p>
            ) : solicitudes.map((s) => (
              <div key={s.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start gap-2 flex-wrap mb-2">
                  <span className="text-xs font-semibold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded">{s.tipo}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded capitalize ${ESTADO_COLORS[s.estado] ?? ""}`}>{s.estado.replace("_", " ")}</span>
                </div>
                <p className="text-sm text-foreground">{s.descripcion}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(s.created_at).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" })}</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {s.estado === "pendiente" && <>
                    <Button size="sm" variant="outline" onClick={() => handleUpdateArco(s.id, "en_proceso")}>En proceso</Button>
                    <Button size="sm" onClick={() => handleUpdateArco(s.id, "completada")}>Completar</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleUpdateArco(s.id, "rechazada")}>Rechazar</Button>
                  </>}
                  {s.estado === "en_proceso" && <>
                    <Button size="sm" onClick={() => handleUpdateArco(s.id, "completada")}>Completada</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleUpdateArco(s.id, "rechazada")}>Rechazar</Button>
                  </>}
                  {s.estado === "completada" && <span className="text-xs font-medium" style={{ color: "hsl(160 60% 40%)" }}>✓ Completada</span>}
                  {s.estado === "rechazada"  && <span className="text-xs font-medium text-destructive">✗ Rechazada</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== CATEGORÍAS ===== */}
        {tab === "categorias" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground mb-4">Edita el nombre y descripción de cada problemática. Los cambios se reflejan en la boleta de votación.</p>
            {probs.map((p) => {
              const isEditing = editingProb === p.id;
              return (
                <div key={p.id} className="bg-card border border-border rounded-xl p-4">
                  {!isEditing ? (
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{p.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => startEditProb(p)}>Editar</Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Nombre</p>
                        <Input
                          value={probDraft?.label ?? ""}
                          onChange={(e) => setProbDraft((d) => d ? { ...d, label: e.target.value } : d)}
                          className="h-9 text-sm rounded-lg"
                          maxLength={50}
                        />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Descripción</p>
                        <Input
                          value={probDraft?.description ?? ""}
                          onChange={(e) => setProbDraft((d) => d ? { ...d, description: e.target.value } : d)}
                          className="h-9 text-sm rounded-lg"
                          maxLength={120}
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="outline" onClick={() => setEditingProb(null)} className="flex-1">Cancelar</Button>
                        <Button size="sm" onClick={saveProb} className="flex-1">Guardar</Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ===== CONFIGURACIÓN ===== */}
        {tab === "config" && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Datos de la Consulta</h3>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Título de la consulta</p>
                <Input value={cfg.titulo} onChange={(e) => setCfg((c) => ({ ...c, titulo: e.target.value }))} className="h-10 text-sm rounded-xl" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Institución</p>
                <Input value={cfg.institucion} onChange={(e) => setCfg((c) => ({ ...c, institucion: e.target.value }))} className="h-10 text-sm rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Inicio (opcional)</p>
                  <Input type="datetime-local" value={cfg.startDate?.slice(0, 16) ?? ""} onChange={(e) => setCfg((c) => ({ ...c, startDate: e.target.value ? new Date(e.target.value).toISOString() : null }))} className="h-10 text-xs rounded-xl" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cierre (opcional)</p>
                  <Input type="datetime-local" value={cfg.endDate?.slice(0, 16) ?? ""} onChange={(e) => setCfg((c) => ({ ...c, endDate: e.target.value ? new Date(e.target.value).toISOString() : null }))} className="h-10 text-xs rounded-xl" />
                </div>
              </div>
              <div className="flex items-center justify-between bg-muted rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Consulta activa</p>
                  <p className="text-xs text-muted-foreground">Si se desactiva, nadie puede votar</p>
                </div>
                <button
                  onClick={() => setCfg((c) => ({ ...c, active: !c.active }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${cfg.active ? "bg-primary" : "bg-muted-foreground/30"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${cfg.active ? "translate-x-7" : "translate-x-1"}`} />
                </button>
              </div>
              <Button onClick={handleSaveConfig} className="w-full h-11 rounded-xl">Guardar configuración</Button>
            </div>

            {/* Danger zone */}
            <div className="bg-card border border-destructive/30 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-destructive">Zona de peligro</h3>
              <p className="text-xs text-muted-foreground">Elimina todos los votos, notas y solicitudes ARCO. La configuración y categorías se mantienen.</p>
              {!resetConfirm ? (
                <Button variant="destructive" onClick={() => setResetConfirm(true)} className="gap-2 w-full">
                  <Trash2 className="w-4 h-4" /> Reiniciar consulta
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-destructive text-center">¿Seguro? Esta acción no se puede deshacer.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setResetConfirm(false)} className="flex-1">Cancelar</Button>
                    <Button variant="destructive" onClick={handleReset} className="flex-1">Sí, reiniciar</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
