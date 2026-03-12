
-- =============================================
-- ENUM para roles
-- =============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- =============================================
-- ENUM para problemáticas
-- =============================================
CREATE TYPE public.problematica_tipo AS ENUM (
  'mantenimiento', 'seguridad', 'equipo_obsoleto', 'oferta_academica', 'transporte'
);

-- =============================================
-- Tabla de roles de usuario
-- =============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Función para verificar rol (SECURITY DEFINER)
-- =============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Políticas user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- PADRÓN ELECTORAL (relacional, identidad)
-- Solo marca participación, sin saber qué votó
-- =============================================
CREATE TABLE public.padron_electoral (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  numero_control TEXT NOT NULL,
  participo BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_participacion TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.padron_electoral ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own padron"
  ON public.padron_electoral FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System insert padron"
  ON public.padron_electoral FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- RESULTADOS CONSULTA (aislada, anónima)
-- Solo contadores numéricos, sin identidad
-- =============================================
CREATE TABLE public.resultados_consulta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problematica problematica_tipo NOT NULL UNIQUE,
  votos INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.resultados_consulta ENABLE ROW LEVEL SECURITY;

-- Cualquiera autenticado puede leer resultados
CREATE POLICY "Authenticated can view results"
  ON public.resultados_consulta FOR SELECT
  TO authenticated
  USING (true);

-- Solo admin puede modificar directamente (edge function usa service role)
CREATE POLICY "Admins can manage results"
  ON public.resultados_consulta FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- BITÁCORA DE PRIVACIDAD (RF01, RF03)
-- Registro inmutable de aceptación
-- =============================================
CREATE TABLE public.bitacora_privacidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  aceptado BOOLEAN NOT NULL DEFAULT TRUE,
  ip_address TEXT,
  user_agent TEXT,
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.bitacora_privacidad ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own privacy log"
  ON public.bitacora_privacidad FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own privacy log"
  ON public.bitacora_privacidad FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- SOLICITUDES ARCO (RF02)
-- =============================================
CREATE TYPE public.arco_tipo AS ENUM ('acceso', 'rectificacion', 'cancelacion', 'oposicion');
CREATE TYPE public.arco_estado AS ENUM ('pendiente', 'en_proceso', 'completada', 'rechazada');

CREATE TABLE public.solicitudes_arco (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo arco_tipo NOT NULL,
  descripcion TEXT NOT NULL,
  estado arco_estado NOT NULL DEFAULT 'pendiente',
  respuesta TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.solicitudes_arco ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ARCO requests"
  ON public.solicitudes_arco FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create ARCO requests"
  ON public.solicitudes_arco FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage ARCO requests"
  ON public.solicitudes_arco FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- FOLIOS DE PARTICIPACIÓN (RF-COM)
-- Comprobante anónimo
-- =============================================
CREATE TABLE public.folios_participacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.folios_participacion ENABLE ROW LEVEL SECURITY;

-- Público puede verificar un folio
CREATE POLICY "Anyone can verify folio"
  ON public.folios_participacion FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- Función para actualizar timestamps
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_resultados_updated_at
  BEFORE UPDATE ON public.resultados_consulta
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_solicitudes_arco_updated_at
  BEFORE UPDATE ON public.solicitudes_arco
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Seed: Inicializar contadores de resultados
-- =============================================
INSERT INTO public.resultados_consulta (problematica, votos) VALUES
  ('mantenimiento', 0),
  ('seguridad', 0),
  ('equipo_obsoleto', 0),
  ('oferta_academica', 0),
  ('transporte', 0);
