import { chromium } from 'playwright';

const base = 'http://localhost:8080';

const checks = [
  { route: '/', texts: ['Ver Vídeo e Planos', 'Agenda Pública', 'CEMADEB'] },
  { route: '/agenda-publica', texts: ['Agenda Pública'] },
  { route: '/agenda-publica-cemadeb', texts: ['Agenda Pública CEMADEB'] },
  { route: '/escalas-publicas', texts: ['Escalas de Serviço', 'Escalas de Culto'] },
  { route: '/sistema-escalas', texts: ['Escalas de Culto'] },
  { route: '/assistente-lembretes', texts: ['Assistente de Lembretes'] },
  { route: '/contatos-lembretes', texts: ['Gerenciar Contatos para Lembretes'] },
  { route: '/lembretes-automaticos', texts: ['Lembretes Automáticos'] },
  { route: '/assinaturas', texts: ['Assinaturas'] },
  { route: '/dashboard', texts: ['SISCOF - Escola de Culto Online'] },
];

async function main() {
  const browser = await chromium.launch();
  const results = [];
  for (const c of checks) {
    const page = await browser.newPage();
    await page.goto(base + c.route, { waitUntil: 'networkidle' });
    let ok = true;
    for (const txt of c.texts) {
      const count = await page.locator(`text=${txt}`).count();
      if (count === 0) { ok = false; console.error('Missing text', txt, 'on', c.route); }
    }
    console.log(`${ok ? '✅' : '❌'} ${c.route}`);
    results.push({ route: c.route, ok });
    await page.close();
  }
  await browser.close();
  const failed = results.filter(r => !r.ok);
  if (failed.length) {
    console.error('Playwright smoke failed for routes:', failed.map(f => f.route).join(', '));
    process.exit(1);
  }
  console.log('All Playwright smoke routes OK');
}

main();

