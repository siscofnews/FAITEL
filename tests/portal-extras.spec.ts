import { test, expect } from './base';

test('sales banner elements', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Sistema #1 para Gestão de Igrejas')).toBeVisible();
  const assinarBtn = page.getByRole('button', { name: 'Assinar Agora' });
  await expect(assinarBtn).toBeVisible();
  const hasGoldClass = await assinarBtn.evaluate(el => el.className.includes('bg-gold'));
  expect(hasGoldClass).toBeTruthy();
});

test('radio banner elements', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Rádio Missões pelo Mundo' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ouvir Agora' })).toBeVisible();
});

