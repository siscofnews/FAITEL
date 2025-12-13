import { test, expect } from './base';

const SUPA = 'fmbpdrqpxazxwmdagsio';
const authKey = `sb-${SUPA}-auth-token`;

test('membros page applies state scope filter', async ({ page }) => {
  await page.addInitScript(([key]) => {
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem(key, JSON.stringify({ currentSession: { access_token: 't', token_type: 'bearer', expires_at: now + 3600, expires_in: 3600, refresh_token: 't', user: { id: 'u1', email: 'u@test' } }, expiresAt: now + 3600 }));
    localStorage.setItem('siscof_scope_override', JSON.stringify(['BA','SE']));
  }, [authKey]);

  let lastURL = '';
  await page.route('**/rest/v1/members*', (route) => {
    lastURL = route.request().url();
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
  await page.route('**/rest/v1/state_scope*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
  await page.goto('/membros');
  expect(lastURL).toContain('churches.estado=in');
});

