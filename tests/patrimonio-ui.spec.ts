import { test, expect } from './base';

const SUPA = 'fmbpdrqpxazxwmdagsio';
const authKey = `sb-${SUPA}-auth-token`;

test('patrimonio dashboard loads with stats', async ({ page }) => {
  await page.addInitScript(([key]) => {
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem(key, JSON.stringify({ currentSession: { access_token: 't', token_type: 'bearer', expires_at: now + 3600, expires_in: 3600, refresh_token: 't', user: { id: 'u1', email: 'u@test' } }, expiresAt: now + 3600 }));
  }, [authKey]);
  await page.route('**/rest/v1/churches*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'c1', estado: 'BA' }]) });
  });
  await page.route('**/rest/v1/assets*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ total_value: 1000, status: 'ATIVO', church_id: 'c1' }]) });
  });
  await page.goto('/patrimonio');
  await expect(page.getByText('Patrimônio')).not.toBeVisible();
});

