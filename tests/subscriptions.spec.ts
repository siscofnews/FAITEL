import { test, expect } from './base';

const SUPA = 'fmbpdrqpxazxwmdagsio';
const authKey = `sb-${SUPA}-auth-token`;

test('assinaturas admin shows statuses and actions with mocked supabase', async ({ page }) => {
  await page.addInitScript(([key]) => {
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem(key, JSON.stringify({
      currentSession: {
        access_token: 'test', token_type: 'bearer', expires_in: 3600, expires_at: now + 3600,
        refresh_token: 'test', user: { id: '00000000-0000-0000-0000-000000000000', email: 'test@example.com' }
      },
      expiresAt: now + 3600
    }));
  }, [authKey]);

  await page.route('**/rest/v1/siscof_subscriptions*', (route) => {
    if (route.request().method() === 'PATCH') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'sub1', status: 'active', last_payment_at: new Date().toISOString() }) });
    }
    const body = [
      { id: 'sub1', church_id: 'c1', status: 'pending', last_payment_at: null },
      { id: 'sub2', church_id: 'c2', status: 'blocked', last_payment_at: null },
    ];
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });

  await page.goto('/assinaturas');
  await expect(page.getByText('Assinaturas')).toBeVisible();
  await expect(page.getByText('PENDING', { exact: false })).toHaveCount(0); // normalized label not used
  await expect(page.getByText('PENDENTE')).toHaveCount(0); // avoid false positive
  await expect(page.getByText('Bloqueado')).toHaveCount(1);
  const btnPago = page.getByRole('button', { name: 'Marcar pago hoje' }).first();
  await btnPago.click();
  await page.screenshot({ path: 'test-artifacts/assinaturas-action.png', fullPage: true });
});

test('dashboard pending banner with mocked supabase', async ({ page }) => {
  await page.addInitScript(([key]) => {
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem(key, JSON.stringify({
      currentSession: {
        access_token: 'test', token_type: 'bearer', expires_in: 3600, expires_at: now + 3600,
        refresh_token: 'test', user: { id: '00000000-0000-0000-0000-000000000000', email: 'test@example.com' }
      },
      expiresAt: now + 3600
    }));
  }, [authKey]);

  await page.route('**/rest/v1/churches*', (route) => {
    const body = [{ id: 'c1', nome_fantasia: 'Igreja Teste', nivel: 'matriz', cidade: 'Cidade', estado: 'SP' }];
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.route('**/rest/v1/siscof_subscriptions*', (route) => {
    const body = [{ id: 'sub1', church_id: 'c1', status: 'pending', plan_id: 'plan1', last_payment_at: null }];
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.route('**/rest/v1/siscof_modules*', (route) => {
    const body = [{ key: 'finance', name: 'Financeiro' }, { key: 'ead', name: 'EAD' }];
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.route('**/rest/v1/siscof_plan_modules*', (route) => {
    const body = [{ plan_id: 'plan1', module_key: 'finance' }, { plan_id: 'plan1', module_key: 'ead' }];
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });

  await page.goto('/dashboard');
  await expect(page.getByText('Assinatura pendente')).toBeVisible();
  await expect(page.getByText('Módulos do plano')).toBeVisible();
  await page.screenshot({ path: 'test-artifacts/dashboard-pending.png', fullPage: true });
});

