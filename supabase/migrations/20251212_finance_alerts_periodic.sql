CREATE OR REPLACE FUNCTION public.generate_target_alerts_periodic(_entity entity_type, _entity_id UUID, _nature TEXT, _year INT, _mode TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE rec RECORD; tgt NUMERIC; act NUMERIC; pct NUMERIC; label TEXT; months INT[]; BEGIN
  FOR rec IN SELECT * FROM public.cost_centers WHERE entity=_entity AND entity_id=_entity_id LOOP
    IF _mode='TRIMESTRAL' THEN
      FOR months, label IN SELECT ARRAY[1,2,3], 'Q01' UNION ALL SELECT ARRAY[4,5,6], 'Q02' UNION ALL SELECT ARRAY[7,8,9], 'Q03' UNION ALL SELECT ARRAY[10,11,12], 'Q04' LOOP
        SELECT COALESCE(SUM(target_amount),0) INTO tgt FROM public.monthly_targets WHERE entity=_entity AND entity_id=_entity_id AND nature=_nature AND year=_year AND cost_center_id IS NOT DISTINCT FROM rec.id AND month = ANY(months);
        IF _entity='IGREJA' THEN
          IF _nature='RECEITA' THEN SELECT COALESCE(SUM(e.amount),0) INTO act FROM public.church_entries e WHERE e.church_id=_entity_id AND e.cost_center_id IS NOT DISTINCT FROM rec.id AND EXTRACT(YEAR FROM e.date)=_year AND EXTRACT(MONTH FROM e.date)=ANY(months);
          ELSE SELECT COALESCE(SUM(x.total_value),0) INTO act FROM public.church_expenses x WHERE x.church_id=_entity_id AND x.cost_center_id IS NOT DISTINCT FROM rec.id AND EXTRACT(YEAR FROM x.date)=_year AND EXTRACT(MONTH FROM x.date)=ANY(months);
          END IF;
        END IF;
        pct := CASE WHEN tgt>0 THEN ROUND(act/tgt*100,2) ELSE 0 END;
        IF pct < 100 THEN INSERT INTO public.finance_alerts(entity,entity_id,cost_center_id,nature,year,period_label,target_amount,actual_amount,pct) VALUES (_entity,_entity_id,rec.id,_nature,_year,label,tgt,act,pct); END IF;
      END LOOP;
    ELSE
      FOR months, label IN SELECT ARRAY[1,2,3,4,5,6], 'H1' UNION ALL SELECT ARRAY[7,8,9,10,11,12], 'H2' LOOP
        SELECT COALESCE(SUM(target_amount),0) INTO tgt FROM public.monthly_targets WHERE entity=_entity AND entity_id=_entity_id AND nature=_nature AND year=_year AND cost_center_id IS NOT DISTINCT FROM rec.id AND month = ANY(months);
        IF _entity='IGREJA' THEN
          IF _nature='RECEITA' THEN SELECT COALESCE(SUM(e.amount),0) INTO act FROM public.church_entries e WHERE e.church_id=_entity_id AND e.cost_center_id IS NOT DISTINCT FROM rec.id AND EXTRACT(YEAR FROM e.date)=_year AND EXTRACT(MONTH FROM e.date)=ANY(months);
          ELSE SELECT COALESCE(SUM(x.total_value),0) INTO act FROM public.church_expenses x WHERE x.church_id=_entity_id AND x.cost_center_id IS NOT DISTINCT FROM rec.id AND EXTRACT(YEAR FROM x.date)=_year AND EXTRACT(MONTH FROM x.date)=ANY(months);
          END IF;
        END IF;
        pct := CASE WHEN tgt>0 THEN ROUND(act/tgt*100,2) ELSE 0 END;
        IF pct < 100 THEN INSERT INTO public.finance_alerts(entity,entity_id,cost_center_id,nature,year,period_label,target_amount,actual_amount,pct) VALUES (_entity,_entity_id,rec.id,_nature,_year,label,tgt,act,pct); END IF;
      END LOOP;
    END IF;
  END LOOP;
END;$$;

SELECT cron.schedule('generate-target-alerts-quarter', '10 3 1 */3 *', $$
  SELECT public.generate_target_alerts_periodic('IGREJA', id, 'RECEITA', EXTRACT(YEAR FROM NOW())::INT, 'TRIMESTRAL') FROM public.churches;
$$) ON CONFLICT (jobname) DO UPDATE SET schedule = EXCLUDED.schedule;

SELECT cron.schedule('generate-target-alerts-semester', '15 3 1 1,7 *', $$
  SELECT public.generate_target_alerts_periodic('IGREJA', id, 'RECEITA', EXTRACT(YEAR FROM NOW())::INT, 'SEMESTRAL') FROM public.churches;
$$) ON CONFLICT (jobname) DO UPDATE SET schedule = EXCLUDED.schedule;

