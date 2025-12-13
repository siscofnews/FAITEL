import { test, expect } from './base';

const protectedRoutes = [
  '/assistente-lembretes',
  '/contatos-lembretes',
  '/lembretes-automaticos',
  '/assinaturas',
  '/dashboard',
];

for (const route of protectedRoutes) {
  test(`protected route redirects to login: ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login/);
  });
}

