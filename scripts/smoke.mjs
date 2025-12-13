// Minimal smoke tests: hit routes and assert 200
const routes = [
  '/',
  '/agenda-publica',
  '/agenda-publica-cemadeb',
  '/escalas-publicas',
  '/sistema-escalas',
  '/assistente-lembretes',
  '/contatos-lembretes',
  '/lembretes-automaticos',
  '/assinaturas',
  '/dashboard',
  '/gerenciar-permissoes',
  '/gerenciar-perfis-globais',
  '/financeiro-siscof',
];

const sources = [
  { path: '/src/pages/Portal.tsx', includes: ['Agenda Pública', 'CEMADEB – Agenda'] },
  { path: '/src/pages/public/AgendaPublica.tsx', includes: ['Agenda Pública'] },
  { path: '/src/pages/public/AgendaPublicaCemadeb.tsx', includes: ['Agenda Pública CEMADEB'] },
  { path: '/src/pages/public/PublicSchedulePage.tsx', includes: ['Escalas de Culto'] },
  { path: '/src/pages/public/LandingEscalas.tsx', includes: ['Escalas de Culto'] },
  { path: '/src/pages/admin/GetAssistente.tsx', includes: ['Assistente de Lembretes'] },
  { path: '/src/pages/admin/ContatosManager.tsx', includes: ['Gerenciar Contatos para Lembretes'] },
  { path: '/src/pages/admin/LembretesAutomaticos.tsx', includes: ['Lembretes Automáticos'] },
  { path: '/src/pages/admin/AssinaturasAdmin.tsx', includes: ['Assinaturas'] },
  { path: '/src/pages/GerenciarPermissoes.tsx', includes: ['Gerenciar Permissões'] },
  { path: '/src/pages/Dashboard.tsx', includes: ['SISCOF - Escola de Culto Online'] },
];

async function check(url) {
  try {
    const res = await fetch(url);
    const ok = res.status >= 200 && res.status < 400;
    const text = await res.text();
    const hasRoot = /<div\s+id=\"(root|app)\"/i.test(text);
    if (!ok) console.error('Status', res.status, 'for', url);
    if (!hasRoot) console.error('Missing root container in response for', url, 'length', text.length);
    return ok && (hasRoot || text.length > 100);
  } catch (e) {
    console.error('Error fetching', url, e.message);
    return false;
  }
}

async function main() {
  const base = 'http://localhost:8080';
  const results = [];
  for (const r of routes) {
    const ok = await check(base + r);
    results.push({ route: r, ok });
    console.log(`${ok ? '✅' : '❌'} ${r}`);
  }
  // source checks
  for (const s of sources) {
    try {
      const res = await fetch(base + s.path);
      const text = await res.text();
      const ok = s.includes.every(str => text.includes(str));
      console.log(`${ok ? '✅' : '❌'} source ${s.path}`);
      results.push({ route: `src:${s.path}`, ok });
      if (!ok) console.error('Missing strings for', s.path);
    } catch (e) {
      console.error('Error source fetch', s.path, e.message);
      results.push({ route: `src:${s.path}`, ok: false });
    }
  }
  const failed = results.filter(r => !r.ok);
  if (failed.length) {
    console.error('Smoke failed for routes:', failed.map(f => f.route).join(', '));
    process.exit(1);
  }
  console.log('All smoke routes OK');
}

main();

