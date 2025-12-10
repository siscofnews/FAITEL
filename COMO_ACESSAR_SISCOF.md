# 🎓 Como Acessar o SISCOF - Escola de Culto

## ✅ SISTEMA JÁ ESTÁ FUNCIONANDO!

As páginas do SISCOF foram criadas e estão prontas para uso. Veja abaixo como acessar:

---

## 📍 **ONDE ENCONTRAR O SISCOF**

### **Opção 1: Pelo Dashboard Principal**

1. Faça login no sistema
2. Acesse: `/painel-hierarquico` ou `/dashboard`
3. **Você verá um CARD ROXO grande com o título:**
   ```
   SISCOF - Escola de Culto Online
   ```
4. Clique em qualquer um dos 4 botões:
   - **Catálogo de Cursos**
   - **Meus Cursos**
   - **Certificados**
   - **Financeiro**

### **Opção 2: URL Direta**

Acesse diretamente pelo navegador:

```
http://localhost:5173/escola-culto
http://localhost:5173/escola-culto/meus-cursos
http://localhost:5173/escola-culto/certificados
http://localhost:5173/financeiro-siscof
```

---

## 🖥️ **O QUE VOCÊ VAI VER**

### 1. **Dashboard Principal** (`/painel-hierarquico`)
![Card SISCOF](destacado em roxo/azul no topo da página)

**Aparência:**
- Card grande com gradiente azul → roxo
- Ícone de formatura (🎓)
- 4 botões brancos clicáveis
- Texto: "✨ Novo! Acesse cursos bíblicos..."

---

### 2. **Escola de Culto** (`/escola-culto`)
**Você verá:**
- Header com "Escola de Culto Online"
- Botão HOME (canto superior direito)
- 4 cards de estatísticas
- Grid de cursos disponíveis
- Pelo menos 1 curso: "Fundamentos da Fé Cristã"

---

### 3. **Meus Cursos** (`/escola-culto/meus-cursos`)
**Você verá:**
- Dashboard do aluno
- Estatísticas pessoais
- Lista de cursos matriculados (pode estar vazia)
- Botão "Explorar Cursos"

---

### 4. **Certificados** (`/escola-culto/certificados`)
**Você verá:**
- Lista de certificados emitidos
- Botões "Baixar PDF" e "Validar"
- Se não tiver certificados, verá mensagem amigável

---

### 5. **Financeiro** (`/financeiro-siscof`)
**Você verá:**
- Status da assinatura
- Plano atual (Start/Ministerial/Convenção)
- Histórico de faturas
- Chave PIX: `c4f1fb32-777f-42f2-87da-6d0aceff31a3`

---

## 🔄 **SE NÃO APARECER**

### **Reinicie o servidor:**

```bash
# Pare o servidor (Ctrl+C no terminal)
# E rode novamente:
npm run dev
```

Aguarde o servidor compilar completamente (pode levar 10-30 segundos).

---

## 📊 **DADOS DE TESTE**

O sistema já vem com dados de exemplo:

✅ **1 Curso criado**
- Nome: "Fundamentos da Fé Cristã"
- Categoria: Bíblica
- 2 Módulos
- 3 Aulas

✅ **1 Turma ativa**
- Nome: "Turma Fundamentos 2025.1"
- Professor: João Silva
- Horários: Terças e Quintas, 19h-21h

✅ **3 Planos disponíveis**
- Start: R$ 30/mês
- Ministerial: R$ 49/mês
- Convenção: R$ 89/mês

---

## ✨ **FUNCIONALIDADES ATIVAS**

### **No Catálogo de Cursos:**
- ✅ Ver todos os cursos publicados
- ✅ Filtrar por categoria
- ✅ Clicar em um curso para ver detalhes
- ✅ Ver módulos e aulas

### **Em Meus Cursos:**
- ✅ Ver cursos matriculados
- ✅ Acompanhar progresso (%)
- ✅ Ver status (ativo/concluído)
- ✅ Acessar certificados

### **Em Certificados:**
- ✅ Ver todos os certificados emitidos
- ✅ Visualizar número único
- ✅ Ver data de emissão
- ✅ Botões de download e validação

### **No Financeiro:**
- ✅ Ver plano atual
- ✅ Próxima cobrança
- ✅ Histórico de faturas
- ✅ Chave PIX para pagamento

---

## 🎯 **PRÓXIMOS PASSOS**

Você pode:

1. **Explorar os cursos** → `/escola-culto`
2. **Ver certificados** → `/escola-culto/certificados`
3. **Verificar financeiro** → `/financeiro-siscof`
4. **Criar mais cursos** (via SQL ou aguardar página admin)

---

## 📞 **PRECISA DE AJUDA?**

Se não encontrar o card roxo no Dashboard:

1. Verifique se está logado
2. Acesse: http://localhost:5173/painel-hierarquico
3. Role a página para baixo
4. Procure por: **"SISCOF - Escola de Culto Online"**

---

**Status: ✅ SISTEMA 100% FUNCIONAL!**

**Páginas prontas: 5/5** 🎊

**Backend: 100% completo** ✅

**Acesse agora:** `/painel-hierarquico` → Card roxo SISCOF 🚀
