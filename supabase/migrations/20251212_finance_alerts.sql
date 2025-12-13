CREATE TABLE IF NOT EXISTS public.finance_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity entity_type NOT NULL,
  entity_id UUID NOT NULL,
  cost_center_id UUID,
  nature TEXT CHECK (nature IN ('RECEITA','DESPESA')) NOT NULL,
  year INT NOT NULL,
  period_label TEXT NOT NULL,
  target_amount NUMERIC(14,2) NOT NULL,
  actual_amount NUMERIC(14,2) NOT NULL,
  pct NUMERIC(6,2) NOT NULL,
  email_to TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.generate_target_alerts(_entity entity_type, _entity_id UUID, _nature TEXT, _year INT)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE rec RECORD; tgt NUMERIC; act NUMERIC; pct NUMERIC; label TEXT; BEGIN
  FOR rec IN SELECT * FROM public.monthly_targets WHERE entity=_entity AND entity_id=_entity_id AND nature=_nature AND year=_year LOOP
    tgt := rec.target_amount; act := 0; label := 'M' || LPAD(rec.month::TEXT,2,'0');
    IF _entity='IGREJA' THEN
      SELECT COALESCE(SUM(e.amount),0) INTO act FROM public.church_entries e WHERE e.church_id=_entity_id AND e.cost_center_id IS NOT DISTINCT FROM rec.cost_center_id AND EXTRACT(YEAR FROM e.date)=_year AND EXTRACT(MONTH FROM e.date)=rec.month;
      IF _nature='DESPESA' THEN SELECT COALESCE(SUM(x.total_value),0) INTO act FROM public.church_expenses x WHERE x.church_id=_entity_id AND x.cost_center_id IS NOT DISTINCT FROM rec.cost_center_id AND EXTRACT(YEAR FROM x.date)=_year AND EXTRACT(MONTH FROM x.date)=rec.month; END IF;
    END IF;
    pct := CASE WHEN tgt>0 THEN ROUND(act/tgt*100,2) ELSE 0 END;
    IF pct < 100 THEN
      INSERT INTO public.finance_alerts(entity,entity_id,cost_center_id,nature,year,period_label,target_amount,actual_amount,pct)
      VALUES (_entity,_entity_id,rec.cost_center_id,_nature,_year,label,tgt,act,pct);
    END IF;
  END LOOP;
END;$$;

