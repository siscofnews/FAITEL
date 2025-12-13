import { test, expect } from './base';

const SUPA = 'fmbpdrqpxazxwmdagsio';
const authKey = `sb-${SUPA}-auth-token`;

test('header shows scope badge for presidente estadual', async ({ page }) => {
  await page.addInitScript(([key]) => {
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem(key, JSON.stringify({ currentSession: { access_token: 't', token_type: 'bearer', expires_at: now + 3600, expires_in: 3600, refresh_token: 't', user: { id: 'u1', email: 'u@test' } }, expiresAt: now + 3600 }));
  }, [authKey]);
  await page.route('**/rest/v1/user_roles*', (route) => {
    const url = route.request().url();
    if (url.includes('user_id.eq.u1')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ role: 'presidente_estadual' }]) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
  await page.route('**/rest/v1/state_scope*', (route) => {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ state_code: 'BA' }, { state_code: 'SE' }]) });
  });
  await page.goto('/igrejas');
  await expect(page.getByText('Escopo: BA, SE')).toBeVisible();
});

