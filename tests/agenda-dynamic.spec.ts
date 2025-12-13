import { test, expect } from './base';

test('agenda publica renders dynamic events', async ({ page }) => {
  await page.route('**/rest/v1/annual_agenda*', (route) => {
    const body = [
      { id: 'ev1', titulo: 'Congresso de Louvor', data_inicio: '2026-01-20', local: 'São Paulo', publicado: true },
      { id: 'ev2', titulo: 'Vigília Nacional', data_inicio: '2026-02-18', local: 'Rio de Janeiro', publicado: true },
    ];
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.goto('/agenda-publica');
  await expect(page.getByText('Congresso de Louvor')).toBeVisible();
  await expect(page.getByText('Vigília Nacional')).toBeVisible();
  // Badge outline date format dd/MM/yyyy
  const badge = page.locator('.badge').first();
  await expect(badge).toBeVisible();
});

test('agenda cemadeb filters is_cemadeb true', async ({ page }) => {
  await page.route('**/rest/v1/annual_agenda*', (route) => {
    const url = route.request().url();
    const isCemadeb = url.includes('is_cemadeb.eq.true');
    const body = isCemadeb
      ? [{ id: 'ev3', titulo: 'CEMADEB Congresso', data_inicio: '2026-03-10', local: 'Bahia', publicado: true, is_cemadeb: true }]
      : [];
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.goto('/agenda-publica-cemadeb');
  await expect(page.getByText('CEMADEB Congresso')).toBeVisible();
});

