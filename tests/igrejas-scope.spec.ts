import { test, expect } from './base';

const SUPA = 'fmbpdrqpxazxwmdagsio';
const authKey = `sb-${SUPA}-auth-token`;

test('igrejas list filters by state scope', async ({ page }) => {
  await page.addInitScript(([key]) => {
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem(key, JSON.stringify({ currentSession: { access_token: 't', token_type: 'bearer', expires_at: now + 3600, expires_in: 3600, refresh_token: 't', user: { id: 'u1', email: 'u@test' } }, expiresAt: now + 3600 }));
    localStorage.setItem('siscof_scope_override', JSON.stringify(['BA']));
  }, [authKey]);
  let urlPublic = '';
  await page.route('**/rest/v1/churches_public*', (route) => {
    urlPublic = route.request().url();
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
  await page.goto('/igrejas');
  expect(urlPublic).toContain('estado=in');
});

