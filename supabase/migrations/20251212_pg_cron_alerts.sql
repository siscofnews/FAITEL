CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule('generate-target-alerts', '0 3 * * *', $$
  SELECT public.generate_target_alerts('IGREJA', id, 'RECEITA', EXTRACT(YEAR FROM NOW())::INT) FROM public.churches;
$$) ON CONFLICT (jobname) DO UPDATE SET schedule = EXCLUDED.schedule;

SELECT cron.schedule('generate-target-alerts-despesa', '5 3 * * *', $$
  SELECT public.generate_target_alerts('IGREJA', id, 'DESPESA', EXTRACT(YEAR FROM NOW())::INT) FROM public.churches;
$$) ON CONFLICT (jobname) DO UPDATE SET schedule = EXCLUDED.schedule;


