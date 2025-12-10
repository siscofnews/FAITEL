-- Create table for hourly visitor tracking
CREATE TABLE public.visitor_hourly_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL DEFAULT '/',
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  visit_hour INTEGER NOT NULL CHECK (visit_hour >= 0 AND visit_hour <= 23),
  visit_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(page_path, visit_date, visit_hour)
);

-- Enable RLS
ALTER TABLE public.visitor_hourly_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can view hourly visitor stats"
ON public.visitor_hourly_stats FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert hourly visitor stats"
ON public.visitor_hourly_stats FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update hourly visitor stats"
ON public.visitor_hourly_stats FOR UPDATE
USING (true);

-- Create function to increment hourly visitor count
CREATE OR REPLACE FUNCTION public.increment_hourly_visitor_count(p_page_path TEXT DEFAULT '/')
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hour INTEGER;
  v_count INTEGER;
BEGIN
  v_hour := EXTRACT(HOUR FROM now());
  
  INSERT INTO public.visitor_hourly_stats (page_path, visit_date, visit_hour, visit_count)
  VALUES (p_page_path, CURRENT_DATE, v_hour, 1)
  ON CONFLICT (page_path, visit_date, visit_hour)
  DO UPDATE SET 
    visit_count = visitor_hourly_stats.visit_count + 1,
    updated_at = now();
  
  RETURN v_hour;
END;
$$;