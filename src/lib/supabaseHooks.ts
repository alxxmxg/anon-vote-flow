import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProblematicaConfig, ConsultaConfig, ArcoSolicitud } from "./mockDB"; // Reusing types

// --- FETCH HOOKS ---

export function useConsultaConfig() {
  return useQuery({
    queryKey: ['consultaConfig'],
    queryFn: async () => {
      const { data, error } = await supabase.from('configuracion_consulta').select('*').eq('id', 1).single();
      if (error) throw error;
      return {
        titulo: data.titulo,
        institucion: data.institucion,
        startDate: data.start_date,
        endDate: data.end_date,
        active: data.active
      } as ConsultaConfig;
    }
  });
}

export function useProblematicas() {
  return useQuery({
    queryKey: ['problematicas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categorias_problematica').select('*');
      if (error) throw error;
      return data as ProblematicaConfig[];
    }
  });
}

export function useResultados() {
  return useQuery({
    queryKey: ['resultados'],
    queryFn: async () => {
      const { data, error } = await supabase.from('votos').select('*');
      if (error) throw error;
      return data.reduce((acc, curr) => ({ ...acc, [curr.problematica_id]: curr.cantidad }), {} as Record<string, number>);
    }
  });
}

export function useParticipantes() {
  return useQuery({
    queryKey: ['participantes'],
    queryFn: async () => {
      const { count, error } = await supabase.from('padron').select('*', { count: 'exact', head: true }).eq('participo', true);
      if (error) throw error;
      return count || 0;
    }
  });
}

export function useNotasAnonimas() {
  return useQuery({
    queryKey: ['notas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('notas_anonimas').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      const grouped: Record<string, { id: string, nota: string, date: string }[]> = {};
      for (const row of data) {
        if (!grouped[row.problematica_id]) grouped[row.problematica_id] = [];
        grouped[row.problematica_id].push({ id: row.id, nota: row.nota, date: row.created_at });
      }
      return grouped;
    }
  });
}

export function useSolicitudesArco() {
  return useQuery({
    queryKey: ['arco'],
    queryFn: async () => {
      const { data, error } = await supabase.from('solicitudes_arco').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as ArcoSolicitud[];
    }
  });
}

// --- MUTATION HOOKS ---
// We will use these in AdminPanel

export function useUpdateConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cfg: ConsultaConfig) => {
      await supabase.from('configuracion_consulta').update({
        titulo: cfg.titulo,
        institucion: cfg.institucion,
        start_date: cfg.startDate,
        end_date: cfg.endDate,
        active: cfg.active
      }).eq('id', 1);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['consultaConfig'] })
  });
}

export function useUpdateProblematica() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: ProblematicaConfig) => {
      await supabase.from('categorias_problematica').update({ label: p.label, description: p.description }).eq('id', p.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['problematicas'] })
  });
}

export function useUpdateArcoStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, estado }: { id: string, estado: ArcoSolicitud['estado'] }) => {
      await supabase.from('solicitudes_arco').update({ estado }).eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['arco'] })
  });
}
