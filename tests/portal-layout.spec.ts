import { test, expect } from './base';

test('sales banner tailwind classes', async ({ page }) => {
  await page.goto('/');
  const salesSection = page.locator('section').filter({ hasText: 'Sistema #1 para Gestão de Igrejas' });
  const classes = await salesSection.first().evaluate(el => el.className);
  expect(classes).toContain('bg-gradient-to-br');
  expect(classes).toContain('from-[#4a5d23]');
  expect(classes).toContain('via-[#5d6f2e]');
  expect(classes).toContain('to-[#6b7f3a]');
});

test('radio banner tailwind classes', async ({ page }) => {
  await page.goto('/');
  const radioSection = page.locator('section').filter({ hasText: 'Rádio Missões pelo Mundo' });
  const classes = await radioSection.first().evaluate(el => el.className);
  expect(classes).toContain('bg-gradient-to-br');
  expect(classes).toContain('from-red-600');
  expect(classes).toContain('via-red-500');
  expect(classes).toContain('to-orange-500');
});

