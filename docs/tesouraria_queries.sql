-- Repasses pendentes por Matriz
SELECT r.id, c.nome_fantasia AS from_church, p.nome_fantasia AS to_church, r.amount, r.paid
FROM public.repass_logs r
JOIN public.churches c ON r.from_church = c.id
JOIN public.churches p ON r.to_church = p.id
WHERE p.id = :matriz_id AND (r.paid = false OR r.paid IS NULL);

-- Saldo acumulado por rede
WITH RECURSIVE tree AS (
  SELECT id FROM public.churches WHERE id = :root_id
  UNION ALL
  SELECT c.id FROM public.churches c JOIN tree t ON c.parent_church_id = t.id
)
SELECT ch.id, ch.nome_fantasia AS name,
  COALESCE((SELECT SUM(amount) FROM public.church_entries e JOIN public.church_accounts a ON e.account_id = a.id WHERE a.church_id = ch.id),0)
  - COALESCE((SELECT SUM(total_value) FROM public.church_expenses x JOIN public.church_accounts a2 ON x.account_id = a2.id WHERE a2.church_id = ch.id),0) AS balance
FROM public.churches ch
WHERE ch.id IN (SELECT id FROM tree);

