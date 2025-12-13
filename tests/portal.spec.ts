import { test, expect } from './base';

test('portal buttons and badges', async ({ page }) => {
  await page.goto('/');
  const videoBtn = page.getByRole('button', { name: 'Ver Vídeo e Planos' });
  await expect(videoBtn).toBeVisible();
  const hasYellowClass = await videoBtn.evaluate(el => el.className.includes('bg-yellow-400'));
  expect(hasYellowClass).toBeTruthy();

  const agendaLink = page.locator('a[href="/agenda-publica"]');
  await expect(agendaLink).toBeVisible();
  await expect(page.locator('a[href="/agenda-publica"] .bg-gold')).toHaveCount(1);

  const cemadebLink = page.locator('a[href="/agenda-publica-cemadeb"]');
  await expect(cemadebLink).toBeVisible();
  await expect(page.locator('a[href="/agenda-publica-cemadeb"] .bg-purple-600')).toHaveCount(1);
});

test('agenda pages headers', async ({ page }) => {
  await page.goto('/agenda-publica');
  await expect(page.getByRole('heading', { name: 'Agenda Pública' })).toBeVisible();
  await page.goto('/agenda-publica-cemadeb');
  await expect(page.getByRole('heading', { name: 'Agenda Pública CEMADEB' })).toBeVisible();
});

