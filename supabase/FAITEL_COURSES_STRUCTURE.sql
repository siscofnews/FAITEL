-- ============================================
-- ESTRUTURA DE CURSOS DA FAITEL
-- Faculdade Internacional Teológica de Líderes
-- ============================================

-- Este script cria a estrutura completa de cursos teológicos
-- baseada nas melhores práticas de seminários cristãos

-- ============================================
-- 1. CURSOS LIVRES/BÁSICOS (Formação Ministerial)
-- ============================================

-- CURSO 1: Teologia Básica (Formação Inicial)
INSERT INTO courses (name, description, duration_hours, level, is_active) VALUES
('Teologia Básica', 
 'Curso introdutório para formação ministerial básica. Ideal para obreiros, diáconos e líderes de células que desejam fundamentos sólidos da fé cristã.',
 120, 'basic', true);

-- Módulos do Curso de Teologia Básica
INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Bibliologia', 'Estudo sobre a Bíblia: inspiração, canonicidade e hermenêutica básica', 1 
FROM courses WHERE name = 'Teologia Básica';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Cristologia', 'Doutrina de Cristo: pessoa, obra e ministério de Jesus', 2 
FROM courses WHERE name = 'Teologia Básica';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Pneumatologia', 'Doutrina do Espírito Santo: pessoa, dons e fruto', 3 
FROM courses WHERE name = 'Teologia Básica';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Eclesiologia', 'Doutrina da Igreja: natureza, missão e ordenanças', 4 
FROM courses WHERE name = 'Teologia Básica';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Escatologia', 'Doutrina das Últimas Coisas: segunda vinda, juízo final e eternidade', 5 
FROM courses WHERE name = 'Teologia Básica';

-- CURSO 2: Escola Bíblica Dominical - Formação de Professores
INSERT INTO courses (name, description, duration_hours, level, is_active) VALUES
('EBD - Formação de Professores', 
 'Capacitação para professores de Escola Bíblica Dominical. Metodologias de ensino, didática e pedagogia cristã.',
 60, 'basic', true);

-- CURSO 3: Liderança Cristã
INSERT INTO courses (name, description, duration_hours, level, is_active) VALUES
('Liderança Cristã', 
 'Princípios bíblicos de liderança para pastores, presbíteros e líderes de ministérios.',
 80, 'basic', true);

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Fundamentos da Liderança Cristã', 'Princípios bíblicos e características de um líder segundo o coração de Deus', 1 
FROM courses WHERE name = 'Liderança Cristã';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Gestão de Ministérios', 'Administração eficaz de ministérios e departamentos na igreja local', 2 
FROM courses WHERE name = 'Liderança Cristã';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Liderança Servidora', 'O modelo de Jesus: servir para liderar', 3 
FROM courses WHERE name = 'Liderança Cristã';

-- ============================================
-- 2. BACHARELADO EM TEOLOGIA (3-4 anos)
-- ============================================

-- CURSO 4: Bacharelado em Teologia
INSERT INTO courses (name, description, duration_hours, level, is_active) VALUES
('Bacharelado em Teologia', 
 'Curso superior completo de formação teológica. Duração: 4 anos (8 semestres). Prepara para o ministério pastoral, ensino e pesquisa.',
 2400, 'undergraduate', true);

-- Módulos do Bacharelado - 1º Ano
INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Introdução à Teologia', 'Fundamentos e métodos do estudo teológico', 1 
FROM courses WHERE name = 'Bacharelado em Teologia';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Pentateuco', 'Estudo dos cinco primeiros livros da Bíblia: Gênesis a Deuteronômio', 2 
FROM courses WHERE name = 'Bacharelado em Teologia';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Evangelhos Sinóticos', 'Estudo comparativo de Mateus, Marcos e Lucas', 3 
FROM courses WHERE name = 'Bacharelado em Teologia';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'História da Igreja Primitiva', 'Do século I ao IV: expansão, perseguições e concílios', 4 
FROM courses WHERE name = 'Bacharelado em Teologia';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Grego Bíblico I', 'Introdução ao grego koiné do Novo Testamento', 5 
FROM courses WHERE name = 'Bacharelado em Teologia';

-- Módulos do Bacharelado - 2º Ano
INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Livros Históricos', 'Josué, Juízes, Samuel, Reis e Crônicas', 6 
FROM courses WHERE name = 'Bacharelado em Teologia';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Livros Poéticos e Sapienciais', 'Jó, Salmos, Provérbios, Eclesiastes e Cantares', 7 
FROM courses WHERE name = 'Bacharelado em Teologia';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Evangelho de João', 'Estudo aprofundado do quarto evangelho', 8 
FROM courses WHERE name = 'Bacharelado em Teologia';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Atos dos Apóstolos', 'História da igreja primitiva e missões', 9 
FROM courses WHERE name = 'Bacharelado em Teologia';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Teologia Sistemática I', 'Teontologia, Cristologia e Pneumatologia', 10 
FROM courses WHERE name = 'Bacharelado em Teologia';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Hebraico Bíblico I', 'Introdução ao hebraico do Antigo Testamento', 11 
FROM courses WHERE name = 'Bacharelado em Teologia';

-- Módulos do Bacharelado - 3º Ano
INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Profetas Maiores', 'Isaías, Jeremias, Ezequiel e Daniel', 12 
FROM courses WHERE name = 'Bacharelado em Teologia';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Profetas Menores', 'Os doze profetas menores', 13 
FROM courses WHERE name = 'Bacharelado em Teologia';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Epístolas Paulinas I', 'Romanos, Coríntios e Gálatas', 14 
FROM courses WHERE name = 'Bacharelado em Teologia';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Teologia Sistemática II', 'Soteriologia, Eclesiologia e Escatologia', 15 
FROM courses WHERE name = 'Bacharelado em Teologia';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Hermenêutica Bíblica', 'Princípios e métodos de interpretação da Bíblia', 16 
FROM courses WHERE name = 'Bacharelado em Teologia';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'História da Reforma', 'Reforma Protestante: Lutero, Calvino e movimentos reformados', 17 
FROM courses WHERE name = 'Bacharelado em Teologia';

-- Módulos do Bacharelado - 4º Ano
INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Epístolas Paulinas II', 'Efésios, Filipenses, Colossenses e Tessalonicenses', 18 
FROM courses WHERE name = 'Bacharelado em Teologia';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Epístolas Gerais', 'Hebreus, Tiago, Pedro, João e Judas', 19 
FROM courses WHERE name = 'Bacharelado em Teologia';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Apocalipse', 'Estudo do livro de Revelação', 20 
FROM courses WHERE name = 'Bacharelado em Teologia';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Homilética', 'Arte e ciência da pregação cristã', 21 
FROM courses WHERE name = 'Bacharelado em Teologia';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Teologia Pastoral', 'Cuidado pastoral, aconselhamento e ética ministerial', 22 
FROM courses WHERE name = 'Bacharelado em Teologia';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Missiologia', 'Teologia e prática missionária transcultural', 23 
FROM courses WHERE name = 'Bacharelado em Teologia';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Capelania', 'Ministério de capelania hospitalar, militar e prisional', 24 
FROM courses WHERE name = 'Bacharelado em Teologia';

-- ============================================
-- 3. PÓS-GRADUAÇÃO (Especialização)
-- ============================================

-- CURSO 5: Pós-Graduação em Teologia Pastoral
INSERT INTO courses (name, description, duration_hours, level, is_active) VALUES
('Pós-Graduação em Teologia Pastoral', 
 'Especialização para pastores e líderes ministeriais. Aprofundamento em aconselhamento, liderança e gestão eclesiástica.',
 360, 'postgraduate', true);

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Aconselhamento Pastoral Avançado', 'Técnicas e metodologias de aconselhamento cristão', 1 
FROM courses WHERE name = 'Pós-Graduação em Teologia Pastoral';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Gestão Eclesiástica', 'Administração de igrejas e ministérios', 2 
FROM courses WHERE name = 'Pós-Graduação em Teologia Pastoral';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Pregação Expositiva', 'Métodos avançados de pregação bíblica', 3 
FROM courses WHERE name = 'Pós-Graduação em Teologia Pastoral';

-- CURSO 6: Pós-Graduação em Educação Cristã
INSERT INTO courses (name, description, duration_hours, level, is_active) VALUES
('Pós-Graduação em Educação Cristã', 
 'Especialização para educadores cristãos. Pedagogia, didática e metodologias de ensino bíblico.',
 360, 'postgraduate', true);

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Pedagogia Cristã', 'Fundamentos pedagógicos para o ensino cristão', 1 
FROM courses WHERE name = 'Pós-Graduação em Educação Cristã';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Didática do Ensino Bíblico', 'Metodologias eficazes para ensinar a Palavra', 2 
FROM courses WHERE name = 'Pós-Graduação em Educação Cristã';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Currículo de Educação Cristã', 'Desenvolvimento de currículos para ministérios de ensino', 3 
FROM courses WHERE name = 'Pós-Graduação em Educação Cristã';

-- CURSO 7: Pós-Graduação em Missões Transculturais
INSERT INTO courses (name, description, duration_hours, level, is_active) VALUES
('Pós-Graduação em Missões Transculturais', 
 'Especialização para missionários e plantadores de igrejas. Antropologia, contexto cultural e estratégias missionárias.',
 360, 'postgraduate', true);

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Antropologia Missionária', 'Compreensão cultural para missões eficazes', 1 
FROM courses WHERE name = 'Pós-Graduação em Missões Transculturais';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Plantação de Igrejas', 'Estratégias e metodologias para plantar igrejas', 2 
FROM courses WHERE name = 'Pós-Graduação em Missões Transculturais';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Missões Urbanas', 'Evangelização e discipulado em contextos urbanos', 3 
FROM courses WHERE name = 'Pós-Graduação em Missões Transculturais';

-- ============================================
-- 4. CURSOS COMPLEMENTARES/ESPECIALIZADOS
-- ============================================

-- CURSO 8: Filosofia e Apologética Cristã
INSERT INTO courses (name, description, duration_hours, level, is_active) VALUES
('Filosofia e Apologética Cristã', 
 'Defesa racional da fé cristã. Estudo de filosofia, cosmovisões e argumentação apologética.',
 100, 'intermediate', true);

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'História da Filosofia', 'Panorama filosófico da antiguidade à contemporaneidade', 1 
FROM courses WHERE name = 'Filosofia e Apologética Cristã';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Apologética Clássica', 'Argumentos racionais para a existência de Deus', 2 
FROM courses WHERE name = 'Filosofia e Apologética Cristã';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Cosmovisão Cristã', 'A fé cristã como visão de mundo integral', 3 
FROM courses WHERE name = 'Filosofia e Apologética Cristã';

-- CURSO 9: Louvor e Adoração
INSERT INTO courses (name, description, duration_hours, level, is_active) VALUES
('Louvor e Adoração', 
 'Formação para líderes de louvor e ministros de música. Teologia, prática e liderança de adoração.',
 80, 'basic', true);

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Teologia da Adoração', 'Fundamentos bíblicos e teológicos do louvor', 1 
FROM courses WHERE name = 'Louvor e Adoração';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Liderança de Louvor', 'Como conduzir a congregação em adoração', 2 
FROM courses WHERE name = 'Louvor e Adoração';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Prática de Ministério de Música', 'Organização e gestão de equipes de louvor', 3 
FROM courses WHERE name = 'Louvor e Adoração';

-- CURSO 10: Ética e Cidadania Cristã
INSERT INTO courses (name, description, duration_hours, level, is_active) VALUES
('Ética e Cidadania Cristã', 
 'Princípios éticos cristãos aplicados à vida social, política e profissional.',
 60, 'basic', true);

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Ética Bíblica', 'Fundamentos éticos nas Escrituras', 1 
FROM courses WHERE name = 'Ética e Cidadania Cristã';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Ética Profissional Cristã', 'Integridade no trabalho e negócios', 2 
FROM courses WHERE name = 'Ética e Cidadania Cristã';

INSERT INTO course_modules (course_id, name, description, order_index) 
SELECT id, 'Cidadania e Responsabilidade Social', 'O cristão na sociedade e política', 3 
FROM courses WHERE name = 'Ética e Cidadania Cristã';

-- ============================================
-- OBSERVAÇÕES FINAIS
-- ============================================

-- Este script cria uma estrutura completa e profissional de cursos
-- para uma faculdade teológica cristã como a FAITEL.

-- Tipos de cursos incluídos:
-- - Cursos Livres/Básicos (formação ministerial)
-- - Bacharelado em Teologia (graduação completa)
-- - Pós-Graduação (Especialização)
-- - Cursos Complementares

-- Próximos passos:
-- 1. Adicionar aulas (lessons) em cada módulo
-- 2. Upload de vídeos e materiais de apoio
-- 3. Criar provas e avaliações
-- 4. Configurar certificados

-- Total de cursos: 10
-- Total de módulos: ~60+
-- Carga horária total: ~4.000 horas
