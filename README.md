# 🎯 SISCOF News - Sistema de Gestão Eclesiástica

> Sistema completo de gestão para igrejas com hierarquia multi-nível, portal de notícias evangélicas, e ferramentas administrativas integradas.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Começando](#começando)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Deploy](#deploy)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Documentação](#documentação)
- [Contribuindo](#contribuindo)
- [Suporte](#suporte)

---

## 🚀 Sobre o Projeto

O **SISCOF News** é uma plataforma completa de gestão eclesiástica desenvolvida para a **IADMA - Assembleia de Deus Missão Apostólica**. O sistema permite gerenciar uma hierarquia completa de igrejas, desde a matriz até as células, com controle de membros, eventos, escalas litúrgicas, comunicação interna e muito mais.

### Cliente
**IADMA - Assembleia de Deus Missão Apostólica**

### URLs
- **Produção**: https://nexus-culto-sync.lovable.app
- **Local**: http://localhost:5173 (desenvolvimento)

---

## ✨ Funcionalidades

### 🏢 Gestão Hierárquica de Igrejas
- ✅ 5 níveis hierárquicos: **Matriz → Sede → Subsede → Congregação → Célula**
- ✅ Cadastro de igrejas filhas por pastores autorizados
- ✅ Validação automática de hierarquia
- ✅ Sistema de permissões por nível

### 👥 Gestão de Membros
- ✅ Cadastro público via link/QR Code
- ✅ Cadastro completo com dados pessoais e endereço
- ✅ Auto-preenchimento de CEP (ViaCEP)
- ✅ Seleção hierárquica de igreja
- ✅ Controle de funções e roles

### 🔐 Autenticação e Segurança
- ✅ Login com Supabase Auth
- ✅ Normalização automática de email
- ✅ Recuperação de senha
- ✅ Proteção de rotas por permissão
- ✅ Row Level Security (RLS)

### 📅 Módulos Administrativos
- ✅ **Escalas Litúrgicas**: Gestão de escalas de culto
- ✅ **Eventos**: Criação e gerenciamento de eventos
- ✅ **Comunicação**: Sistema de mensagens internas
- ✅ **Relatórios**: Dashboards e relatórios customizados
- ✅ **Financeiro**: Controle de finanças
- ✅ **Escola de Culto**: Gestão de cursos e treinamentos
- ✅ **Pessoas**: Gestão de liderança e equipes
- ✅ **Convites**: Sistema de convites para eventos

### 🌐 Portal Público
- ✅ Portal de notícias evangélicas
- ✅ Galeria de eventos (AGO, CEMADEB)
- ✅ Informações sobre liderança
- ✅ Parceiros e redes sociais
- ✅ Landing pages personalizadas por igreja

---

## 🛠 Tecnologias

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router v6** - Roteamento
- **React Query (TanStack Query)** - Cache e sincronização

### UI/UX
- **Shadcn/UI** - Componentes acessíveis
- **Tailwind CSS** - Utilitário CSS
- **Framer Motion** - Animações
- **Lucide React** - Ícones
- **Radix UI** - Primitivos headless

### Backend/Database
- **Supabase** - Backend as a Service
  - PostgreSQL - Banco de dados
  - Auth - Autenticação
  - Storage - Armazenamento
  - RLS - Row Level Security
  - Real-time - Subscriptions

### Formulários e Validação
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **@hookform/resolvers** - Integração

### Outras Bibliotecas
- **html2canvas** - Captura de screenshots
- **qrcode.react** - Geração de QR Codes
- **xlsx** - Exportação para Excel
- **recharts** - Gráficos e visualizações
- **date-fns** - Manipulação de datas

---

## 🚀 Começando

### Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (vem com Node.js)
- Conta no **Supabase** ([Sign Up](https://supabase.com))
- Editor de código (VSCode recomendado)

### Verificar instalação

```bash
node --version  # v18.0.0 ou superior
npm --version   # v9.0.0 ou superior
```

---

## 📦 Instalação

### 1. Clonar o repositório

```bash
# SSH (recomendado)
git clone git@github.com:seu-usuario/nexus-culto-sync.git

# HTTPS
git clone https://github.com/seu-usuario/nexus-culto-sync.git

cd nexus-culto-sync
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_PROJECT_ID="seu-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="sua-anon-key"
VITE_SUPABASE_URL="https://seu-project.supabase.co"
```

> 💡 **Dica**: Encontre essas informações no Dashboard do Supabase → Settings → API

### 4. Configurar banco de dados

Execute as migrations no Supabase:

```bash
# No Supabase Dashboard → SQL Editor
# Execute os arquivos em ordem de supabase/migrations/
```

> ⚠️ **IMPORTANTE**: Execute também `supabase/functions/create_child_church.sql` para habilitar o cadastro hierárquico.

Veja o [Guia de Deploy SQL](docs/sql_deployment_guide.md) para instruções detalhadas.

### 5. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:5173

---

## ⚙️ Configuração

### Estrutura de Permissões

O sistema usa 4 níveis de permissão:

1. **super_admin**: Acesso total ao sistema
2. **pastor_presidente**: Pode criar igrejas filhas sob sua jurisdição
3. **admin**: Gerencia sua igreja local
4. **membro**: Acesso básico

### Cadastrar primeiro Super Admin

```sql
-- No Supabase SQL Editor
INSERT INTO user_roles (user_id, role, is_super_admin)
VALUES (
  'uuid-do-usuario-auth',
  'super_admin',
  true
);
```

### Cadastrar primeira Matriz

1. Acesse `/cadastrar-igreja`
2. Preencha os dados da igreja matriz
3. Após aprovação, vincule ao super admin

---

## 🚢 Deploy

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`.

### Deploy no Lovable.app

O deploy é automático via integração Git:

1. Push para branch `main`
2. Lovable detecta mudanças
3. Build e deploy automático
4. URL: https://nexus-culto-sync.lovable.app

### Deploy em outro servidor

```bash
# Build
npm run build

# Serve (exemplo com serve)
npx serve -s dist -l 3000
```

### Variáveis de Ambiente (Produção)

Configure as mesmas variáveis `.env` no seu provedor de hospedagem.

---

## 📂 Estrutura do Projeto

```
nexus-culto-sync/
├── public/                 # Assets estáticos
│   ├── logo.svg
│   └── images/
├── src/
│   ├── components/         # Componentes reutilizáveis (90+)
│   │   ├── ui/            # Componentes Shadcn/UI
│   │   └── auth/          # Componentes de autenticação
│   ├── contexts/          # Context API
│   │   ├── AuthContext.tsx
│   │   └── LanguageContext.tsx
│   ├── hooks/             # Custom React Hooks
│   │   └── use-toast.tsx
│   ├── integrations/      # Integrações externas
│   │   └── supabase/
│   ├── lib/               # Utilitários
│   │   └── utils.ts
│   ├── pages/             # Páginas da aplicação (44)
│   │   ├── Portal.tsx
│   │   ├── Login.tsx
│   │   ├── Index.tsx          # Dashboard
│   │   ├── CadastrarIgrejaFilha.tsx
│   │   ├── CadastroMembro.tsx
│   │   └── ...
│   ├── App.tsx            # Componente raiz
│   ├── main.tsx           # Entry point
│   └── index.css          # Estilos globais
├── supabase/
│   ├── migrations/        # Migrations SQL (20)
│   └── functions/         # Funções SQL
│       └── create_child_church.sql
├── .env                   # Variáveis de ambiente (não commitado)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 📚 Documentação

### Documentos Técnicos

- [📋 Plano de Implementação](docs/implementation_plan.md) - Detalhes técnicos completos
- [🔧 Guia de Deploy SQL](docs/sql_deployment_guide.md) - Como aplicar funções SQL
- [✅ Task List](docs/task.md) - Checklist de desenvolvimento
- [📖 Walkthrough](docs/walkthrough.md) - Visão geral do sistema

### Guias de Uso

- **Cadastrar Igreja Filha**: Dashboard → Menu → Cadastrar Igreja
- **Cadastrar Membro (público)**: `/cadastro-membro?igreja={id}`
- **Gerar QR Code**: `/igreja/{id}` → Ver QR Code
- **Criar Evento**: Dashboard → Eventos → Novo Evento
- **Configurar Escala**: Dashboard → Escalas → Nova Escala

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, siga estas diretrizes:

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/MinhaFeature`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. Abra um **Pull Request**

### Padrões de Código

- Use **TypeScript** para todo código novo
- Siga o **ESLint** configurado
- Componentes em **PascalCase**
- Funções utilitárias em **camelCase**
- Teste localmente antes de commitar

---

## 🐛 Problemas Conhecidos

### RLS bloqueando cadastro de igrejas

**Sintoma**: Erro ao criar igreja filha  
**Solução**: Executar `create_child_church.sql` no Supabase  
**Guia**: [SQL Deployment Guide](docs/sql_deployment_guide.md)

### CSS @import warnings

**Sintoma**: Warnings no build sobre @import  
**Impacto**: Apenas visual, não afeta funcionalidade  
**Fix**: Mover imports para o topo do CSS

---

## 📞 Suporte

### Contatos

- **Email**: siscofnews@gmail.com
- **Cliente**: IADMA - pr.vcsantos@gmail.com

### Reportar Bugs

Abra uma issue no GitHub com:
- Descrição do problema
- Passos para reproduzir
- Screenshots (se aplicável)
- Ambiente (browser, OS, etc.)

---

## 📄 Licença

Este projeto é privado e proprietário da **IADMA - Assembleia de Deus Missão Apostólica**.

Todos os direitos reservados © 2025 IADMA

---

## 👨‍💻 Desenvolvido por

**Sistema SISCOF**  
Equipe de Desenvolvimento IADMA

---

## 🙏 Agradecimentos

- IADMA por confiar no projeto
- Equipe de desenvolvimento
- Comunidade Shadcn/UI
- Time do Supabase

---

## 📊 Estatísticas

- **44 páginas** implementadas
- **90+ componentes** reutilizáveis
- **20 migrations** SQL
- **12 módulos** funcionais
- **Build time**: ~11 segundos
- **Bundle size**: 2.4 MB (672 KB gzipped)

---

## 🔄 Changelog

### Versão 1.0.0 (06/12/2025)
- ✅ Sistema completo de hierarquia de igrejas
- ✅ Cadastro público de membros
- ✅ Portal de notícias
- ✅ 12 módulos administrativos
- ✅ Autenticação e permissões
- ✅ Build de produção otimizado

---

**Última atualização**: 06/12/2025  
**Versão**: 1.0.0  
**Status**: ✅ Em produção
