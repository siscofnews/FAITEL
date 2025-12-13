CREATE OR REPLACE VIEW public.monthly_targets_quarter AS
SELECT entity, entity_id, cost_center_id, nature, year,
  CASE WHEN month IN (1,2,3) THEN 1 WHEN month IN (4,5,6) THEN 2 WHEN month IN (7,8,9) THEN 3 ELSE 4 END AS quarter,
  SUM(target_amount) AS target_amount
FROM public.monthly_targets
GROUP BY entity, entity_id, cost_center_id, nature, year, quarter;

CREATE OR REPLACE VIEW public.monthly_targets_semester AS
SELECT entity, entity_id, cost_center_id, nature, year,
  CASE WHEN month BETWEEN 1 AND 6 THEN 1 ELSE 2 END AS semester,
  SUM(target_amount) AS target_amount
FROM public.monthly_targets
GROUP BY entity, entity_id, cost_center_id, nature, year, semester;

