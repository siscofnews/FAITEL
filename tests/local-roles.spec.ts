import { test, expect } from './base';

const SUPA = 'fmbpdrqpxazxwmdagsio';
const authKey = `sb-${SUPA}-auth-token`;

test('perfis locais read-only and filter', async ({ page }) => {
  await page.addInitScript(([key]) => {
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem(key, JSON.stringify({ currentSession: { access_token: 't', token_type: 'bearer', expires_at: now + 3600, expires_in: 3600, refresh_token: 't', user: { id: 'u1', email: 'user@test' } }, expiresAt: now + 3600 }));
  }, [authKey]);

  await page.route('**/rest/v1/churches*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'c1', nivel: 'congregacao' }]) });
  });
  await page.route('**/rest/v1/members*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
      { user_id: 'm1', full_name: 'Maria Tesoureira', email: 'maria@example.com', is_active: true },
      { user_id: 'm2', full_name: 'Carlos Secretário', email: 'carlos@example.com', is_active: true },
    ]) });
  });
  await page.route('**/rest/v1/user_roles*', (route) => {
    const url = route.request().url();
    if (url.includes('user_id')) {
      // current user roles: none manipulator (read-only)
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    }
    // existing assignments
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ user_id: 'm2', role: 'secretario', is_manipulator: true }]) });
  });
  await page.route('**/rest/v1/permission_logs*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });

  await page.goto('/perfis-locais/c1');
  await expect(page.getByText('Perfis Locais')).toBeVisible();
  await expect(page.getByText('Somente leitura')).toBeVisible();
  // Filter members
  await page.getByPlaceholder('Filtrar membros por nome/email').fill('maria');
  await expect(page.getByText('Maria Tesoureira')).toBeVisible();
  // Save button disabled due to read-only
  const saveBtn = page.getByRole('button', { name: 'Salvar' }).first();
  await expect(saveBtn).toBeDisabled();
});

test('perfis locais manage allowed roles and logs', async ({ page }) => {
  await page.addInitScript(([key]) => {
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem(key, JSON.stringify({ currentSession: { access_token: 't', token_type: 'bearer', expires_at: now + 3600, expires_in: 3600, refresh_token: 't', user: { id: 'admin1', email: 'admin@test' } }, expiresAt: now + 3600 }));
  }, [authKey]);

  await page.route('**/rest/v1/churches*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'c1', nivel: 'sede' }]) });
  });
  await page.route('**/rest/v1/user_roles*', (route) => {
    const url = route.request().url();
    if (url.includes('user_id')) {
      // current user has manipulator role
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ role: 'admin', is_manipulator: true }]) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
  await page.route('**/rest/v1/members*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
      { user_id: 'm3', full_name: 'João Coordenador', email: 'joao@example.com', is_active: true },
    ]) });
  });
  await page.route('**/rest/v1/permission_logs*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 1, action: 'granted', role_granted: 'coordenador', created_at: new Date().toISOString(), user_id: 'm3', granted_by: 'admin1' }]) });
  });
  // intercept user_roles upsert and permission_logs insert
  await page.route('**/rest/v1/user_roles', (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify([{ user_id: 'm3', role: 'coordenador', church_id: 'c1', is_manipulator: true }]) });
    }
    return route.continue();
  });
  await page.route('**/rest/v1/permission_logs', (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify([{ id: 2 }]) });
    }
    return route.continue();
  });

  await page.goto('/perfis-locais/c1');
  await expect(page.getByText('Perfis Locais')).toBeVisible();
  const select = page.getByRole('combobox').first();
  await select.click();
  await page.getByText('João Coordenador').click();
  await page.getByRole('button', { name: 'Salvar' }).first().click();
  await page.screenshot({ path: 'test-artifacts/perfis-locais-manage.png', fullPage: true });
});

test('bloqueio de tesoureiro em célula', async ({ page }) => {
  await page.addInitScript(([key]) => {
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem(key, JSON.stringify({ currentSession: { access_token: 't', token_type: 'bearer', expires_at: now + 3600, expires_in: 3600, refresh_token: 't', user: { id: 'admin1', email: 'admin@test' } }, expiresAt: now + 3600 }));
  }, [authKey]);

  await page.route('**/rest/v1/churches*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'c2', nivel: 'celula' }]) });
  });
  await page.route('**/rest/v1/user_roles*', (route) => {
    const url = route.request().url();
    if (url.includes('user_id')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ role: 'admin', is_manipulator: true }]) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
  await page.route('**/rest/v1/members*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ user_id: 'm4', full_name: 'Ana', email: 'ana@example.com', is_active: true }]) });
  });
  await page.route('**/rest/v1/permission_logs*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });

  await page.goto('/perfis-locais/c2');
  const titulo = page.getByRole('heading', { name: 'Primeiro Tesoureiro' });
  await expect(titulo).toBeVisible();
  await expect(page.getByText('não disponível neste nível')).toBeVisible();
  const titulo2 = page.getByRole('heading', { name: 'Primeiro Tesoureiro' });
  const card = titulo2.locator('..').locator('..');
  const btn = card.getByRole('button', { name: 'Salvar' });
  await expect(btn).toBeDisabled();
});

test('presidente estadual não disponível em sede', async ({ page }) => {
  await page.addInitScript(([key]) => {
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem(key, JSON.stringify({ currentSession: { access_token: 't', token_type: 'bearer', expires_at: now + 3600, expires_in: 3600, refresh_token: 't', user: { id: 'admin1', email: 'admin@test' } }, expiresAt: now + 3600 }));
  }, [authKey]);
  await page.route('**/rest/v1/churches*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'c4', nivel: 'sede' }]) });
  });
  await page.route('**/rest/v1/user_roles*', (route) => {
    const url = route.request().url();
    if (url.includes('user_id')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ role: 'admin', is_manipulator: true }]) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
  await page.route('**/rest/v1/members*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
  await page.route('**/rest/v1/permission_logs*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });

  await page.goto('/perfis-locais/c4');
  const titulo = page.getByRole('heading', { name: 'Presidente Estadual' });
  await expect(titulo).toBeVisible();
  await expect(page.getByText('não disponível neste nível')).toBeVisible();
});

test('exportar auditoria em CSV', async ({ page }) => {
  await page.addInitScript(([key]) => {
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem(key, JSON.stringify({ currentSession: { access_token: 't', token_type: 'bearer', expires_at: now + 3600, expires_in: 3600, refresh_token: 't', user: { id: 'admin1', email: 'admin@test' } }, expiresAt: now + 3600 }));
  }, [authKey]);
  await page.route('**/rest/v1/churches*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'c5', nivel: 'matriz' }]) });
  });
  await page.route('**/rest/v1/user_roles*', (route) => {
    const url = route.request().url();
    if (url.includes('user_id')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ role: 'admin', is_manipulator: true }]) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
  await page.route('**/rest/v1/permission_logs*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
      { id: 10, action: 'granted', role_granted: 'secretario', created_at: new Date().toISOString(), granted_by: 'admin1', user_id: 'm10' }
    ]) });
  });

  await page.goto('/perfis-locais/c5');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Exportar Auditoria' }).click(),
  ]);
  const path = await download.suggestedFilename();
  expect(path).toContain('auditoria_c5');
});

test('escopo regional UI e salvar', async ({ page }) => {
  await page.addInitScript(([key]) => {
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem(key, JSON.stringify({ currentSession: { access_token: 't', token_type: 'bearer', expires_at: now + 3600, expires_in: 3600, refresh_token: 't', user: { id: 'admin1', email: 'admin@test' } }, expiresAt: now + 3600 }));
  }, [authKey]);
  await page.route('**/rest/v1/churches*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'c6', nivel: 'matriz' }]) });
  });
  await page.route('**/rest/v1/user_roles*', (route) => {
    const url = route.request().url();
    if (url.includes('user_id')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ role: 'admin', is_manipulator: true }]) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ user_id: 'u_pres', role: 'presidente_estadual', is_manipulator: true }]) });
  });
  await page.route('**/rest/v1/members*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ user_id: 'u_pres', full_name: 'Presidente', email: 'p@example.com', is_active: true }]) });
  });
  await page.route('**/rest/v1/state_scope*', (route) => {
    const url = route.request().url();
    if (route.request().method() === 'DELETE') {
      return route.fulfill({ status: 204, contentType: 'application/json', body: '' });
    }
    if (route.request().method() === 'POST') {
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify([{ ok: true }]) });
    }
    if (url.includes('user_id.eq.u_pres')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ state_code: 'BA' }, { state_code: 'SE' }]) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });

  await page.goto('/perfis-locais/c6');
  const title = page.getByRole('heading', { name: 'Presidente Estadual' });
  await expect(title).toBeVisible();
  await expect(page.getByText('Escopo Regional: BA, SE')).toBeVisible();
  await page.getByRole('button', { name: 'SP' }).click();
  await page.getByRole('button', { name: 'Salvar Alcance' }).click();
  await expect(page.getByText('Escopo regional salvo')).toBeVisible();
});

test('bulk assignment applies multiple roles and logs', async ({ page }) => {
  await page.addInitScript(([key]) => {
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem(key, JSON.stringify({ currentSession: { access_token: 't', token_type: 'bearer', expires_at: now + 3600, expires_in: 3600, refresh_token: 't', user: { id: 'admin1', email: 'admin@test' } }, expiresAt: now + 3600 }));
  }, [authKey]);

  let assigned = false;
  await page.route('**/rest/v1/churches*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'c3', nivel: 'sede' }]) });
  });
  await page.route('**/rest/v1/user_roles*', (route) => {
    const url = route.request().url();
    if (url.includes('user_id')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ role: 'admin', is_manipulator: true }]) });
    }
    const body = assigned ? [
      { user_id: 'm10', role: 'secretario', is_manipulator: true },
      { user_id: 'm11', role: 'coordenador', is_manipulator: true },
    ] : [];
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.route('**/rest/v1/members*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
      { user_id: 'm10', full_name: 'Maria', email: 'maria@example.com', is_active: true },
      { user_id: 'm11', full_name: 'João', email: 'joao@example.com', is_active: true },
    ]) });
  });
  await page.route('**/rest/v1/permission_logs*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
  await page.route('**/rest/v1/user_roles', (route) => {
    if (route.request().method() === 'POST') {
      assigned = true;
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify([{ ok: true }]) });
    }
    return route.continue();
  });
  await page.route('**/rest/v1/permission_logs', (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify([{ id: 3 }]) });
    }
    return route.continue();
  });

  await page.goto('/perfis-locais/c3');
  // Secretário select
  const secTitle = page.getByRole('heading', { name: 'Secretário' });
  const secCard = secTitle.locator('..').locator('..');
  await secCard.getByRole('combobox').click();
  await page.getByText('Maria').click();
  // Coordenador select
  const coordTitle = page.getByRole('heading', { name: 'Coordenador' });
  const coordCard = coordTitle.locator('..').locator('..');
  await coordCard.getByRole('combobox').click();
  await page.getByText('João').click();

  await page.getByRole('button', { name: 'Aplicar em massa' }).click();
  await expect(page.getByText('Atribuições em massa aplicadas')).toBeVisible();
  await page.screenshot({ path: 'test-artifacts/perfis-locais-bulk.png', fullPage: true });
});


