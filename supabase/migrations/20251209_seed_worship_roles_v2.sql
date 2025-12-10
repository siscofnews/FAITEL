
-- Garantir que os Tipos de Culto existam
INSERT INTO public.service_types (name, is_system_default) VALUES
('Culto de Domingo', true),
('Culto de Ensino', true),
('Santa Ceia', true),
('Culto de Jovens', true),
('Culto de Oração', true),
('EBD', true)
ON CONFLICT DO NOTHING;

-- Garantir que as Funções da Escala existam
INSERT INTO public.assignment_roles (name, category, is_multiple, is_system_default) VALUES
-- Liturgia (Liturgy)
('Dirigente', 'liturgy', false, true),
('Pregador', 'liturgy', false, true),
('Oração Oferta e Dízimos', 'liturgy', false, true),
('Leitura da Palavra', 'liturgy', false, true),
('Bênção Apostólica', 'liturgy', false, true),
('Oportunidade', 'liturgy', true, true),

-- Louvor (Worship)
('Líder de Louvor', 'worship', false, true),
('Músicos', 'worship', true, true),
('Backvocal', 'worship', true, true),
('Sonoplastia', 'worship', false, true),
('Mídia / Projeção', 'worship', false, true),

-- Apoio (Support)
('Porteiro(a)', 'support', false, true),
('Recepção', 'support', true, true),
('Limpeza', 'support', false, true),
('Servir Água', 'support', false, true),
('Ofertório', 'support', false, true),
('Conferente', 'support', false, true),
('Cantina', 'support', false, true),
('Segurança', 'support', false, true)
ON CONFLICT DO NOTHING;
