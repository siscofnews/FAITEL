CREATE OR REPLACE FUNCTION public.get_church_tree(_root UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE result JSONB;
BEGIN
  WITH RECURSIVE tree AS (
    SELECT id, parent_church_id, nome_fantasia, nivel FROM public.churches WHERE id = _root
    UNION ALL
    SELECT c.id, c.parent_church_id, c.nome_fantasia, c.nivel FROM public.churches c JOIN tree t ON c.parent_church_id = t.id
  ), nodes AS (
    SELECT id, parent_church_id, nome_fantasia, nivel FROM tree
  )
  SELECT jsonb_agg(n) INTO result FROM (
    SELECT n.id, n.parent_church_id, n.nome_fantasia, n.nivel FROM nodes n
  ) n;
  RETURN result;
END;$$;

