import { test, expect } from './base';

const SUPA = 'fmbpdrqpxazxwmdagsio';
const authKey = `sb-${SUPA}-auth-token`;

test('igrejas aprovacao usa estado e hierarquia', async ({ page }) => {
  await page.addInitScript(([key]) => {
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem(key, JSON.stringify({ currentSession: { access_token: 't', token_type: 'bearer', expires_at: now + 3600, expires_in: 3600, refresh_token: 't', user: { id: 'u1', email: 'u@test' } }, expiresAt: now + 3600 }));
    localStorage.setItem('siscof_scope_override', JSON.stringify(['BA']));
  }, [authKey]);

  await page.route('**/rest/v1/rpc/get_accessible_church_ids', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(['m1']) });
  });
  let url = '';
  await page.route('**/rest/v1/churches*', (route) => {
    url = route.request().url();
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
  await page.goto('/igrejas-aprovacao');
  expect(url).toContain('estado=in');
  expect(url).toContain('parent_church_id=in');
});

