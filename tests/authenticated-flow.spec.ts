import { test, expect } from './base';

const SUPA = 'fmbpdrqpxazxwmdagsio';
const authKey = `sb-${SUPA}-auth-token`;

test('authenticated dashboard flow without secrets', async ({ page }) => {
  await page.addInitScript(([key]) => {
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem(key, JSON.stringify({
      currentSession: {
        access_token: 'test', token_type: 'bearer', expires_in: 3600, expires_at: now + 3600,
        refresh_token: 'test', user: { id: '00000000-0000-0000-0000-000000000000', email: 'siscofnews@gmail.com' }
      },
      expiresAt: now + 3600
    }));
  }, [authKey]);

  await page.route('**/rest/v1/churches*', (route) => {
    const body = [{ id: 'c1', nome_fantasia: 'Igreja Seed', nivel: 'matriz', cidade: 'Salvador', estado: 'BA' }];
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.route('**/rest/v1/siscof_subscriptions*', (route) => {
    const body = [{ id: 'sub1', church_id: 'c1', status: 'active', plan_id: 'plan1', last_payment_at: new Date().toISOString() }];
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });

  await page.goto('/dashboard');
  await expect(page.getByText('Status: ACTIVE', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ir para Financeiro' })).toBeVisible();
});

