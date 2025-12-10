-- Create table for visitor statistics
CREATE TABLE public.visitor_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL DEFAULT '/',
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  visit_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(page_path, visit_date)
);

-- Enable RLS
ALTER TABLE public.visitor_stats ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read visitor stats (public counter)
CREATE POLICY "Anyone can view visitor stats" 
ON public.visitor_stats 
FOR SELECT 
USING (true);

-- Allow anyone to insert/update visitor stats (for counting)
CREATE POLICY "Anyone can increment visitor stats" 
ON public.visitor_stats 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update visitor stats" 
ON public.visitor_stats 
FOR UPDATE 
USING (true);

-- Function to increment visitor count
CREATE OR REPLACE FUNCTION public.increment_visitor_count(p_page_path TEXT DEFAULT '/')
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO public.visitor_stats (page_path, visit_date, visit_count)
  VALUES (p_page_path, CURRENT_DATE, 1)
  ON CONFLICT (page_path, visit_date)
  DO UPDATE SET 
    visit_count = visitor_stats.visit_count + 1,
    updated_at = now();
  
  SELECT COALESCE(SUM(visit_count), 0) INTO v_count
  FROM public.visitor_stats
  WHERE page_path = p_page_path;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get total visitor count
CREATE OR REPLACE FUNCTION public.get_total_visitors(p_page_path TEXT DEFAULT '/')
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(visit_count) FROM public.visitor_stats WHERE page_path = p_page_path),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;