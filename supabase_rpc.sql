-- ==========================================
-- 1. SECURIZAR LAS TABLAS (Row Level Security)
-- ==========================================

-- Habilitar RLS en todas las tablas sensibles
ALTER TABLE public.padron ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas_anonimas ENABLE ROW LEVEL SECURITY;

-- Borrar políticas previas (si las hubiera, para evitar duplicados)
DROP POLICY IF EXISTS "Permitir lectura publica de padron" ON public.padron;
DROP POLICY IF EXISTS "Permitir lectura publica de votos" ON public.votos;
DROP POLICY IF EXISTS "Permitir lectura publica de notas" ON public.notas_anonimas;

-- Permitir lectura pública (para que el Admin Panel y resultados públicos funcionen)
-- Bloqueamos INSERT, UPDATE, DELETE desde el cliente web. 
-- LA ÚNICA FORMA DE INSERTAR VOTOS O ACTUALIZAR PADRÓN SERÁ MEDIANTE LA FUNCIÓN "cast_vote".
CREATE POLICY "Permitir lectura publica de padron" ON public.padron FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica de votos" ON public.votos FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica de notas" ON public.notas_anonimas FOR SELECT USING (true);


-- ==========================================
-- 2. CREACIÓN DE LA FUNCIÓN RPC (con auto-registro)
-- ==========================================
-- "SECURITY DEFINER" asegura que esta función corra con permisos de administrador e ignore el RLS anterior.
-- Ahora acepta p_numero_control y auto-registra al estudiante si tiene correo @itmexicali.edu.mx

DROP FUNCTION IF EXISTS cast_vote(TEXT[], JSONB);
DROP FUNCTION IF EXISTS cast_vote(TEXT, TEXT[], JSONB);

CREATE OR REPLACE FUNCTION cast_vote(
    p_numero_control TEXT,
    p_problematica_ids TEXT[],
    p_notas JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB AS $$
DECLARE
    v_user_email TEXT;
    v_participo BOOLEAN;
    v_folio UUID;
    v_pid TEXT;
    v_nota_texto TEXT;
    v_padron_exists BOOLEAN;
BEGIN
    -- 1. Obtener email del usuario autenticado (Extraído de Supabase Auth, imposible de engañar)
    v_user_email := auth.jwt() ->> 'email';
    
    IF v_user_email IS NULL THEN
        RAISE EXCEPTION 'No autorizado. Se requiere iniciar sesión con OTP.';
    END IF;

    -- 2. Validar que sea correo institucional @itmexicali.edu.mx
    IF v_user_email NOT LIKE '%@itmexicali.edu.mx' THEN
        RAISE EXCEPTION 'Solo se permiten correos institucionales @itmexicali.edu.mx';
    END IF;

    -- 3. Verificar si ya existe en el padrón
    SELECT participo INTO v_participo
    FROM public.padron
    WHERE email = v_user_email;

    v_padron_exists := FOUND;

    -- 4. Si ya votó, rechazar
    IF v_padron_exists AND v_participo THEN
        RAISE EXCEPTION 'Ya has participado en esta consulta.';
    END IF;

    -- 5. Si NO existe en el padrón, auto-registrarlo (correo institucional válido)
    IF NOT v_padron_exists THEN
        INSERT INTO public.padron (email, numero_control)
        VALUES (v_user_email, p_numero_control);
    END IF;

    -- 6. Generar nuevo UUID para el folio secreto
    v_folio := gen_random_uuid();

    -- 7. Registrar los votos (Anónimo, no se guarda el user_id)
    FOREACH v_pid IN ARRAY p_problematica_ids
    LOOP
        UPDATE public.votos
        SET cantidad = cantidad + 1
        WHERE problematica_id = v_pid;
    END LOOP;

    -- 8. Registrar las notas (Anónimo)
    IF p_notas IS NOT NULL AND jsonb_typeof(p_notas) = 'object' THEN
        FOR v_pid, v_nota_texto IN SELECT * FROM jsonb_each_text(p_notas)
        LOOP
            IF btrim(v_nota_texto) <> '' THEN
                INSERT INTO public.notas_anonimas (problematica_id, nota)
                VALUES (v_pid, btrim(v_nota_texto));
            END IF;
        END LOOP;
    END IF;

    -- 9. Marcar al estudiante como "ya votó"
    UPDATE public.padron
    SET participo = true,
        folio = v_folio,
        fecha = NOW()
    WHERE email = v_user_email;

    -- 10. Retornar éxito y folio al frontend
    RETURN jsonb_build_object('success', true, 'folio', v_folio);

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
