-- =====================================================================
-- INSERIR PLANOS SISCOF
-- Execute este SQL DEPOIS de aplicar o 20251210_siscof_FINAL.sql
-- =====================================================================

INSERT INTO subscription_plans (name, price_monthly, price_yearly, features, is_active)
VALUES 
  (
    'SISCOF Start', 
    30.00, 
    300.00,
    '{"cells": "unlimited", "escola_culto": true, "escalas": true, "qr_attendance": true}'::jsonb,
    true
  ),
  (
    'SISCOF Ministerial', 
    49.00, 
    490.00,
    '{"cells": "unlimited", "escola_culto": true, "escalas": true, "qr_attendance": true, "trilhas_avancadas": true, "biblioteca": true, "certificados_auto": true}'::jsonb,
    true
  ),
  (
    'SISCOF Convenção', 
    89.00, 
    890.00,
    '{"cells": "unlimited", "all_features": true, "bi_global": true, "matriz_control": true, "multi_campus": true}'::jsonb,
    true
  );

-- Verificar se os planos foram inseridos:
SELECT id, name, price_monthly FROM subscription_plans ORDER BY price_monthly;
