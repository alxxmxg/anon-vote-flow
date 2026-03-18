-- =========================================================================
-- SCRIPT DE MIGRACIÓN: MODO OFFLINE -> SUPABASE PRODUCCIÓN
-- Cópealo y pégalo en el "SQL Editor" de tu proyecto de Supabase y dale RUN
-- =========================================================================

-- 1. Padrón (para rastrear quién votó sin saber qué votó)
CREATE TABLE padron (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  numero_control TEXT NOT NULL,
  participo BOOLEAN DEFAULT false,
  folio UUID,
  fecha TIMESTAMPTZ
);

-- 2. Configuración de Problemáticas (Categorías editables)
CREATE TABLE categorias_problematica (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT NOT NULL
);

-- 3. Votos (Anónimos, solo guardan la cantidad total por opción)
CREATE TABLE votos (
  problematica_id TEXT PRIMARY KEY REFERENCES categorias_problematica(id),
  cantidad INTEGER DEFAULT 0
);

-- 4. Notas Anónimas (separadas completamente del usuario)
CREATE TABLE notas_anonimas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problematica_id TEXT REFERENCES categorias_problematica(id),
  nota TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Solicitudes ARCO
CREATE TYPE estado_arco AS ENUM ('pendiente', 'en_proceso', 'completada', 'rechazada');
CREATE TYPE tipo_arco AS ENUM ('acceso', 'rectificacion', 'cancelacion', 'oposicion');

CREATE TABLE solicitudes_arco (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  tipo tipo_arco NOT NULL,
  descripcion TEXT NOT NULL,
  estado estado_arco DEFAULT 'pendiente',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Configuración global de la Consulta
CREATE TABLE configuracion_consulta (
  id INTEGER PRIMARY KEY CHECK (id = 1), -- Solo permitimos 1 fila de configuración
  titulo TEXT NOT NULL,
  institucion TEXT NOT NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  active BOOLEAN DEFAULT true
);

-- ==========================================
-- INSERTAR DATOS POR DEFECTO PARA EL TEC
-- ==========================================
INSERT INTO configuracion_consulta (id, titulo, institucion) 
VALUES (1, 'Encuesta Voto Universitario 2026', 'Tecnológico de Mexicali');

INSERT INTO categorias_problematica (id, label, description) VALUES
('mantenimiento', 'Mantenimiento', 'Falta de mantenimiento en aulas y áreas comunes.'),
('seguridad', 'Seguridad', 'Mejorar la seguridad dentro y fuera del campus.'),
('equipo_obsoleto', 'Equipo Obsoleto', 'Actualización de equipo en laboratorios y biblioteca.'),
('oferta_academica', 'Oferta Académica', 'Ampliación de materias optativas y especializaciones.'),
('transporte', 'Transporte', 'Mejorar rutas y horarios del transporte universitario.');

INSERT INTO votos (problematica_id, cantidad) VALUES
('mantenimiento', 0), ('seguridad', 0), ('equipo_obsoleto', 0), ('oferta_academica', 0), ('transporte', 0);
