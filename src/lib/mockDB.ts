// =============================================
// MOCK DATABASE — 100% localStorage, sin Supabase
// =============================================

export interface Session {
  email: string;
  numeroControl: string;
}

export interface Votante {
  email: string;
  numeroControl: string;
  participo: boolean;
  folio?: string;
  fecha?: string;
}

export interface ResultadoVoto {
  problematica: string;
  votos: number;
}

export interface NotaAnonima {
  id: string;
  problematica: string;
  nota: string;
  created_at: string;
}

export interface SolicitudArco {
  id: string;
  email: string;
  tipo: "acceso" | "rectificacion" | "cancelacion" | "oposicion";
  descripcion: string;
  estado: "pendiente" | "en_proceso" | "completada" | "rechazada";
  created_at: string;
}

export interface ProblematicaConfig {
  id: string;
  label: string;
  description: string;
}

export interface ConsultaConfig {
  titulo: string;
  institucion: string;
  startDate: string | null; // ISO string, null = no limit
  endDate: string | null;
  active: boolean; // manual override
}

// ---- Keys ----
const SESSION_KEY     = "votouni_session";
const PADRON_KEY      = "votouni_padron";
const VOTES_KEY       = "votouni_votes";
const NOTAS_KEY       = "votouni_notas";
const ARCO_KEY        = "votouni_arco";
const CONFIG_KEY      = "votouni_config";
const PROB_KEY        = "votouni_problematicas";

// ---- Default problematicas ----
const DEFAULT_PROBLEMATICAS: ProblematicaConfig[] = [
  { id: "mantenimiento",    label: "Mantenimiento",    description: "Falta de mantenimiento en aulas y áreas comunes." },
  { id: "seguridad",        label: "Seguridad",        description: "Mejorar la seguridad dentro y fuera del campus." },
  { id: "equipo_obsoleto",  label: "Equipo Obsoleto",  description: "Actualización de equipo en laboratorios y biblioteca." },
  { id: "oferta_academica", label: "Oferta Académica", description: "Ampliación de materias optativas y especializaciones." },
  { id: "transporte",       label: "Transporte",       description: "Mejorar rutas y horarios del transporte universitario." },
];

// For compatibility with other files
export const PROBLEMATICAS = DEFAULT_PROBLEMATICAS.map((p) => p.id);

// ---- Consulta Config ----
const DEFAULT_CONFIG: ConsultaConfig = {
  titulo: "Consulta Universitaria 2025",
  institucion: "Instituto Tecnológico",
  startDate: null,
  endDate: null,
  active: true,
};

export function getConsultaConfig(): ConsultaConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
  } catch { return DEFAULT_CONFIG; }
}

export function saveConsultaConfig(cfg: ConsultaConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
}

export function isConsultaActive(): boolean {
  const cfg = getConsultaConfig();
  if (!cfg.active) return false;
  const now = Date.now();
  if (cfg.startDate && now < new Date(cfg.startDate).getTime()) return false;
  if (cfg.endDate   && now > new Date(cfg.endDate).getTime())   return false;
  return true;
}

// ---- Dynamic Problematicas ----
export function getProblematicasConfig(): ProblematicaConfig[] {
  try {
    const raw = localStorage.getItem(PROB_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_PROBLEMATICAS;
  } catch { return DEFAULT_PROBLEMATICAS; }
}

export function saveProblematicasConfig(probs: ProblematicaConfig[]) {
  localStorage.setItem(PROB_KEY, JSON.stringify(probs));
}

// ---- Session ----
export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ---- Padrón ----
function getPadron(): Votante[] {
  try {
    const raw = localStorage.getItem(PADRON_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function savePadron(padron: Votante[]) {
  localStorage.setItem(PADRON_KEY, JSON.stringify(padron));
}

export function getParticipantes(): number {
  return getPadron().filter((v) => v.participo).length;
}

// ---- Folio verification ----
export function verifyFolio(folio: string): boolean {
  const padron = getPadron();
  return padron.some((v) => v.folio === folio && v.participo);
}

// ---- Votes ----
function getVotes(): Record<string, number> {
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* empty */ }
  const init: Record<string, number> = {};
  getProblematicasConfig().forEach((p) => (init[p.id] = 0));
  return init;
}

function saveVotes(votes: Record<string, number>) {
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}

export function getResultados(): ResultadoVoto[] {
  const votes = getVotes();
  const probs = getProblematicasConfig();
  return probs
    .map((p) => ({ problematica: p.id, votos: votes[p.id] ?? 0 }))
    .sort((a, b) => b.votos - a.votos);
}

// ---- Notas Anónimas ----
function getAllNotas(): NotaAnonima[] {
  try {
    const raw = localStorage.getItem(NOTAS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveNotas(notas: NotaAnonima[]) {
  localStorage.setItem(NOTAS_KEY, JSON.stringify(notas));
}

export function getNotasForProblematica(problematica: string): NotaAnonima[] {
  return getAllNotas().filter((n) => n.problematica === problematica);
}

export function getAllNotasGrouped(): Record<string, NotaAnonima[]> {
  const all = getAllNotas();
  const grouped: Record<string, NotaAnonima[]> = {};
  all.forEach((n) => {
    if (!grouped[n.problematica]) grouped[n.problematica] = [];
    grouped[n.problematica].push(n);
  });
  return grouped;
}

// ---- Cast Vote (atomic, anónimo) ----
export function castVote(
  email: string,
  numeroControl: string,
  problematicasIds: string[],
  notas: Record<string, string> = {}
): { success: boolean; folio?: string; error?: string } {
  const padron = getPadron();
  const existing = padron.find((v) => v.email === email);

  if (existing?.participo) {
    return { success: false, error: "Ya has participado en esta consulta." };
  }

  const folio = crypto.randomUUID();
  const now = new Date().toISOString();

  if (existing) {
    existing.participo = true;
    existing.folio = folio;
    existing.fecha = now;
  } else {
    padron.push({ email, numeroControl, participo: true, folio, fecha: now });
  }
  savePadron(padron);

  const votes = getVotes();
  problematicasIds.forEach((p) => { votes[p] = (votes[p] ?? 0) + 1; });
  saveVotes(votes);

  const todasNotas = getAllNotas();
  problematicasIds.forEach((p) => {
    const texto = notas[p]?.trim();
    if (texto) {
      todasNotas.push({ id: crypto.randomUUID(), problematica: p, nota: texto, created_at: now });
    }
  });
  saveNotas(todasNotas);

  return { success: true, folio };
}

// ---- Reset consulta ----
export function resetConsulta() {
  localStorage.removeItem(PADRON_KEY);
  localStorage.removeItem(VOTES_KEY);
  localStorage.removeItem(NOTAS_KEY);
  localStorage.removeItem(ARCO_KEY);
  // Re-initialize votes to 0
  const init: Record<string, number> = {};
  getProblematicasConfig().forEach((p) => (init[p.id] = 0));
  saveVotes(init);
}

// ---- ARCO ----
function getArco(): SolicitudArco[] {
  try {
    const raw = localStorage.getItem(ARCO_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveArco(arco: SolicitudArco[]) {
  localStorage.setItem(ARCO_KEY, JSON.stringify(arco));
}

export function getSolicitudesArco(): SolicitudArco[] {
  return getArco().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function insertSolicitudArco(email: string, tipo: SolicitudArco["tipo"], descripcion: string): void {
  const arco = getArco();
  arco.push({ id: crypto.randomUUID(), email, tipo, descripcion, estado: "pendiente", created_at: new Date().toISOString() });
  saveArco(arco);
}

export function updateArcoEstado(id: string, estado: SolicitudArco["estado"]): void {
  const arco = getArco();
  const item = arco.find((a) => a.id === id);
  if (item) item.estado = estado;
  saveArco(arco);
}

// ---- OTP (demo) ----
const pendingOtps: Map<string, string> = new Map();

export function generateOtp(email: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  pendingOtps.set(email, code);
  console.log(`%c[DEMO OTP] ${email} → ${code}`, "color: #3b82f6; font-weight: bold; font-size: 14px");
  return code;
}

export function verifyOtp(email: string, code: string): boolean {
  const expected = pendingOtps.get(email);
  if (expected && expected === code) {
    pendingOtps.delete(email);
    return true;
  }
  return false;
}
