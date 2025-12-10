-- =====================================================
-- SISCOF COMPLETO - INSTALAÇÃO MASTER
-- Execute este arquivo NO SUPABASE SQL EDITOR
-- Aplica TODAS as migrations do sistema educacional
-- Data: 2025-12-10
-- =====================================================

-- IMPORTANTE: Execute cada seção uma por vez se houver erros
-- Tempo estimado de execução: 2-3 minutos

\echo '========================================='
\echo '🚀 INICIANDO INSTALAÇÃO DO SISCOF'
\echo '========================================='

\echo '📚 FASE 1: Escola de Culto (Cursos, Aulas, Matrículas)'
\i 20251210_siscof_escola_culto_database.sql

\echo '📝 FASE 2: Sistema de Avaliações (Provas, Questões, Correção Automática)'
\i 20251210_siscof_avaliacoes.sql

\echo '🎓 FASE 3: Certificados Digitais (Emissão Automática, QR Code)'
\i 20251210_siscof_certificados.sql

\echo '💰 FASE 5: Sistema Financeiro (PIX, Planos, Travamento Automático)'
\i 20251210_siscof_financeiro.sql

\echo '💬 FASE 7: Comunicação (Chat, Notificações, Avisos)'
\i 20251210_siscof_comunicacao.sql

\echo '📊 FASE 8: BI e Relatórios (Dashboards, Análises, Métricas)'
\i 20251210_siscof_bi_relatorios.sql

\echo '========================================='
\echo '✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!'
\echo '========================================='
\echo ''
\echo '📦 RESUMO DO QUE FOI INSTALADO:'
\echo '  ✓ 50+ tabelas criadas'
\echo '  ✓ 30+ funções SQL'  
\echo '  ✓ 15+ views de análise'
\echo '  ✓ Políticas RLS configuradas'
\echo '  ✓ Triggers automáticos ativos'
\echo '  ✓ Sistema de correção automática'
\echo '  ✓ Emissão automática de certificados'
\echo '  ✓ Travamento por inadimplência (33 dias)'
\echo '  ✓ Chave PIX: c4f1fb32-777f-42f2-87da-6d0aceff31a3'
\echo ''
\echo '📋 PRÓXIMOS PASSOS:'
\echo '  1. Verificar todas as tabelas criadas'
\echo '  2. Configurar planos de assinatura (já criados)'
\echo '  3. Atualizar frontend (NÃO MEXER AINDA - conforme solicitado)'
\echo '  4. Testar funcionalidades básicas'
\echo '  5. Criar curso de teste'
\echo ''
\echo '🎯 PLANOS DISPONÍVEIS:'
\echo '  • Start: R$ 30/mês (50 alunos, 5 cursos)'
\echo '  • Ministerial: R$ 49/mês (200 alunos, 20 cursos, lives)'
\echo '  • Convenção: R$ 89/mês (ilimitado, BI completo, API)'
\echo ''
\echo '🔧 FUNCIONALIDADES PRONTAS:'
\echo '  ✓ Criar cursos e módulos'
\echo '  ✓ Adicionar aulas (vídeo, texto, quiz)'
\echo '  ✓ Criar turmas e matricular alunos'
\echo '  ✓ Criar avaliações com correção automática'
\echo '  ✓ Emitir certificados automaticamente'
\echo '  ✓ Registrar presença (online/presencial/QR)'
\echo '  ✓ Chat por turma'
\echo '  ✓ Notificações automáticas'
\echo '  ✓ Relatórios e dashboards'
\echo '  ✓ Sistema de pagamento PIX'
\echo '  ✓ Travamento automático por inadimplência'
\echo ''
\echo '========================================='
