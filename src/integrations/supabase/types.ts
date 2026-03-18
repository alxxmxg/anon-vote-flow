export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      configuracion_consulta: {
        Row: { id: number; titulo: string; institucion: string; start_date: string | null; end_date: string | null; active: boolean; }
        Insert: { id?: number; titulo: string; institucion: string; start_date?: string | null; end_date?: string | null; active?: boolean; }
        Update: { id?: number; titulo?: string; institucion?: string; start_date?: string | null; end_date?: string | null; active?: boolean; }
      }
      categorias_problematica: {
        Row: { id: string; label: string; description: string; }
        Insert: { id: string; label: string; description: string; }
        Update: { id?: string; label?: string; description?: string; }
      }
      votos: {
        Row: { problematica_id: string; cantidad: number; }
        Insert: { problematica_id: string; cantidad?: number; }
        Update: { problematica_id?: string; cantidad?: number; }
      }
      notas_anonimas: {
        Row: { id: string; problematica_id: string; nota: string; created_at: string; }
        Insert: { id?: string; problematica_id: string; nota: string; created_at?: string; }
        Update: { id?: string; problematica_id?: string; nota?: string; created_at?: string; }
      }
      solicitudes_arco: {
        Row: { id: string; email: string; tipo: string; descripcion: string; estado: string; created_at: string; }
        Insert: { id?: string; email: string; tipo: string; descripcion: string; estado?: string; created_at?: string; }
        Update: { id?: string; email?: string; tipo?: string; descripcion?: string; estado?: string; created_at?: string; }
      }
      padron: {
        Row: { id: string; email: string; numero_control: string; participo: boolean; folio: string | null; fecha: string | null; }
        Insert: { id?: string; email: string; numero_control: string; participo?: boolean; folio?: string | null; fecha?: string | null; }
        Update: { id?: string; email?: string; numero_control?: string; participo?: boolean; folio?: string | null; fecha?: string | null; }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
