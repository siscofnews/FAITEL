-- Permitir cadastro público de membros (sem autenticação)
CREATE POLICY "Public can insert members" 
ON public.members 
FOR INSERT 
WITH CHECK (true);

-- Permitir leitura pública das igrejas aprovadas para seleção no formulário
CREATE POLICY "Public can view approved churches" 
ON public.churches 
FOR SELECT 
USING (is_approved = true AND is_active = true);