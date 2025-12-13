CREATE OR REPLACE FUNCTION public.asset_totals_by_root_period(_root UUID, _start TIMESTAMPTZ, _end TIMESTAMPTZ)
RETURNS TABLE(total_value NUMERIC, total_items BIGINT)
LANGUAGE sql
AS $$
  WITH RECURSIVE tree AS (
    SELECT id FROM public.churches WHERE id = _root
    UNION ALL
    SELECT c.id FROM public.churches c JOIN tree t ON c.parent_church_id = t.id
  )
  SELECT COALESCE(SUM(a.total_value),0), COUNT(a.id)
  FROM public.assets a
  WHERE a.church_id IN (SELECT id FROM tree)
    AND (_start IS NULL OR a.created_at >= _start)
    AND (_end IS NULL OR a.created_at <= _end);
$$;

CREATE OR REPLACE FUNCTION public.asset_totals_by_category_period(_root UUID, _start TIMESTAMPTZ, _end TIMESTAMPTZ)
RETURNS TABLE(category_id INTEGER, category_name TEXT, total_value NUMERIC, total_items BIGINT)
LANGUAGE sql
AS $$
  WITH RECURSIVE tree AS (
    SELECT id FROM public.churches WHERE id = _root
    UNION ALL
    SELECT c.id FROM public.churches c JOIN tree t ON c.parent_church_id = t.id
  )
  SELECT a.category_id, ac.name, COALESCE(SUM(a.total_value),0), COUNT(a.id)
  FROM public.assets a
  JOIN public.asset_categories ac ON ac.id = a.category_id
  WHERE a.church_id IN (SELECT id FROM tree)
    AND (_start IS NULL OR a.created_at >= _start)
    AND (_end IS NULL OR a.created_at <= _end)
  GROUP BY a.category_id, ac.name
  ORDER BY ac.name;
$$;

