import { test, expect } from './base';

const SUPA = 'fmbpdrqpxazxwmdagsio';
const authKey = `sb-${SUPA}-auth-token`;

test('cadastro membro externo envia insert', async ({ page }) => {
  await page.route('**/rest/v1/churches_public*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'c1', nome_fantasia: 'Matriz' }]) });
  });
  let inserted = false;
  await page.route('**/rest/v1/members', (route) => {
    inserted = true;
    route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'm1' }) });
  });
  await page.route('**/rest/v1/rpc/assign_member_department', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(null) });
  });
  await page.goto('/cadastro-membro');
  await page.getByPlaceholder('Nome completo').fill('João Teste');
  await page.getByPlaceholder('Email').fill('j@test.com');
  await page.getByPlaceholder('Telefone').fill('9999');
  await page.getByRole('combobox', { name: 'Unidade' }).click();
  await page.getByRole('option', { name: 'Matriz' }).click();
  await page.getByRole('button', { name: 'Enviar' }).click();
  expect(inserted).toBeTruthy();
});

test('cadastro ministerial externo', async ({ page }) => {
  await page.route('**/rest/v1/churches_public*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'c1', nome_fantasia: 'Matriz' }]) });
  });
  await page.route('**/rest/v1/members', (route) => {
    route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'm2' }) });
  });
  await page.route('**/rest/v1/rpc/assign_member_department', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(null) });
  });
  await page.goto('/cadastro-ministerial');
  await page.getByPlaceholder('Nome completo').fill('Maria Min');
  await page.getByRole('combobox', { name: 'Unidade' }).click();
  await page.getByRole('option', { name: 'Matriz' }).click();
  await page.getByRole('combobox', { name: 'Cargo Ministerial' }).click();
  await page.getByRole('option', { name: 'PASTOR' }).click();
  await page.getByRole('button', { name: 'Enviar' }).click();
  await expect(page.getByText('Cadastro ministerial enviado')).toBeVisible();
});

