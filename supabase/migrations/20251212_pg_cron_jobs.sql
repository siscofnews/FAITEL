CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.auto_close_month()
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE rec RECORD; prev_year INT; prev_month INT;
BEGIN
  SELECT CASE WHEN EXTRACT(MONTH FROM NOW())=1 THEN EXTRACT(YEAR FROM NOW())-1 ELSE EXTRACT(YEAR FROM NOW()) END,
         CASE WHEN EXTRACT(MONTH FROM NOW())=1 THEN 12 ELSE EXTRACT(MONTH FROM NOW())-1 END
  INTO prev_year, prev_month;
  FOR rec IN SELECT id FROM public.church_accounts WHERE year=prev_year AND month=prev_month AND closed=false LOOP
    PERFORM public.calculate_repass_and_close(rec.id);
  END LOOP;
  FOR rec IN SELECT id FROM public.convention_accounts WHERE year=prev_year AND month=prev_month AND closed=false LOOP
    PERFORM public.close_convention_account(rec.id);
  END LOOP;
  FOR rec IN SELECT id FROM public.pole_accounts WHERE year=prev_year AND month=prev_month AND closed=false LOOP
    PERFORM public.close_pole_account(rec.id);
  END LOOP;
END;$$;

SELECT cron.schedule('auto-close-month', '0 2 1 * *', $$SELECT public.auto_close_month()$$) ON CONFLICT (jobname) DO UPDATE SET schedule = EXCLUDED.schedule;

