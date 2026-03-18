// @ts-nocheck
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";

// ==========================================
// TIPOS (Mantén esto para que TS compile)
// ==========================================
export interface ProblematicaConfig {
  id: string;
  label: string;
  description: string;
}

export interface ConsultaConfig {
  titulo: string;
  institucion: string;
  startDate?: string; 
  endDate?: string;
  active: boolean;
}

export type TipoSolicitudArco = 'acceso' | 'rectificacion' | 'cancelacion' | 'oposicion';
export type EstadoSolicitudArco = 'pendiente' | 'en_proceso' | 'completada' | 'rechazada';

export interface ArcoSolicitud {
  id: string;
  email: string;
  tipo: TipoSolicitudArco;
  descripcion: string;
  estado: EstadoSolicitudArco;
  fecha: string;
}

// ==========================================
// SESSION (LOCALSTORAGE LIGERO)
// ==========================================
export const getSession = () => JSON.parse(localStorage.getItem('votouni_session') || 'null');
export const setSession = (data: any) => localStorage.setItem('votouni_session', JSON.stringify(data));
export const clearSession = () => localStorage.removeItem('votouni_session');

// ==========================================
// OTP Y PADRÓN SUPABASE
// ==========================================
export const generateOtp = async (email: string, numeroControl: string) => {
  // Validación estricta de dominio institucional ITM
  if (!email.toLowerCase().endsWith('@itmexicali.edu.mx')) {
    return { success: false, error: "Solo se permiten correos institucionales con la extensión @itmexicali.edu.mx" };
  }

  // Verificar si ya votó
  const { data } = await supabase.from('padron').select('participo').eq('email', email).maybeSingle();
  if (data && (data as any).participo) {
    return { success: false, error: "Este usuario ya emitió su voto." };
  }
  
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) return { success: false, error: error.message };

  return { success: true };
};

export const verifyOtp = async (email: string, numeroControl: string, code: string) => {
  const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
  if (error) return { success: false, error: "Código incorrecto o expirado." };
  if (!data.session) return { success: false, error: "Error al iniciar sesión." };

  return { success: true };
};

// ==========================================
// VOTO ANÓNIMO EN LA NUBE
// ==========================================
export const castVote = async (email: string, numeroControl: string, selectedProblematicas: string[], notas?: Record<string, string>) => {
  try {
    // Invoke the secure Postgres RPC function bypassing RLS to cast the vote anonymously
    const { data: result, error } = await supabase.rpc('cast_vote', {
      p_numero_control: numeroControl,
      p_problematica_ids: selectedProblematicas,
      p_notas: notas || {}
    });

    if (error) return { success: false, error: error.message };
    
    // Desvincular sesión después de emitir el voto garante del anonimato
    await supabase.auth.signOut();

    if (result && result.success) {
      return { success: true, folio: result.folio };
    }
    
    return { success: false, error: result?.error || "Error desconocido al registrar el voto" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

// ==========================================
// VERIFICADOR PÚBLICO
// ==========================================
export const verifyFolio = async (folio: string) => {
  const { data } = await supabase.from('padron').select('fecha').eq('folio', folio).maybeSingle();
  if (data) return { exists: true, fecha: (data as any).fecha };
  return { exists: false };
};

// ==========================================
// MÓDULO ARCO
// ==========================================
export const insertSolicitudArco = async (email: string, tipo: string, descripcion: string) => {
  await supabase.from('solicitudes_arco').insert({ email, tipo, descripcion } as any);
  return { success: true, message: "Solicitud registrada con éxito." };
};

export const updateSolicitudArco = async (id: string, nuevoEstado: EstadoSolicitudArco) => {
  await supabase.from('solicitudes_arco').update({ estado: nuevoEstado } as any).eq('id', id);
};

// ==========================================
// RESET DE CONSULTA
// ==========================================
export const resetConsulta = async () => {
  // Empty padron, notas, and arco
  await supabase.from('padron').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('notas_anonimas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('solicitudes_arco').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  // Reset vote counts
  const { data } = await supabase.from('categorias_problematica').select('id');
  if (data) {
    for (const p of data) {
      await supabase.from('votos').update({ cantidad: 0 } as any).eq('problematica_id', (p as any).id);
    }
  }
};

// We leave export stubs for old methods so TS doesn't crash before we update components
export const getConsultaConfig = () => ({titulo: 'Cargando...', institucion: 'Cargando...', active: true});
export const isConsultaActive = () => true;
export const getProblematicasConfig = () => [];
export const getProblematicaResults = () => ({});
export const getAllNotasGrouped = () => ({});
export const getSolicitudesArco = () => [];
export const updateProblematicasConfig = (c: any) => {};
export const updateConsultaConfig = (c: any) => {};
