
-- Atomic increment function for anonymous vote counting
CREATE OR REPLACE FUNCTION public.increment_vote(prob_id problematica_tipo)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.resultados_consulta
  SET votos = votos + 1, updated_at = now()
  WHERE problematica = prob_id;
$$;
