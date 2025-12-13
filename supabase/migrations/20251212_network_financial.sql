CREATE OR REPLACE FUNCTION public.network_tithes_totals(_root UUID)
RETURNS TABLE(church_id UUID, total NUMERIC)
LANGUAGE sql
AS $$
  WITH RECURSIVE tree AS (
    SELECT id FROM public.churches WHERE id = _root
    UNION ALL
    SELECT c.id FROM public.churches c JOIN tree t ON c.parent_church_id = t.id
  )
  SELECT ti.church_id, COALESCE(SUM(ti.amount),0)
  FROM public.tithes ti WHERE ti.church_id IN (SELECT id FROM tree)
  GROUP BY ti.church_id;
$$;

CREATE OR REPLACE FUNCTION public.network_offerings_totals(_root UUID)
RETURNS TABLE(church_id UUID, total NUMERIC)
LANGUAGE sql
AS $$
  WITH RECURSIVE tree AS (
    SELECT id FROM public.churches WHERE id = _root
    UNION ALL
    SELECT c.id FROM public.churches c JOIN tree t ON c.parent_church_id = t.id
  )
  SELECT ofr.church_id, COALESCE(SUM(ofr.amount),0)
  FROM public.offerings ofr WHERE ofr.church_id IN (SELECT id FROM tree)
  GROUP BY ofr.church_id;
$$;

