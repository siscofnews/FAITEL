# 📚 PLATAFORMA EAD FAITEL - DOCUMENTO MASTER COMPLETO

**Versão**: 1.0  
**Data**: 13/12/2025  
**Status**: Pronto para Implementação  
**Stack**: React + TypeScript + Supabase (PostgreSQL)

---

## 📋 SUMÁRIO

1. [Visão Geral](#visão-geral)
2. [Banco de Dados Completo](#banco-de-dados-completo)
3. [Fluxos BPMN](#fluxos-bpmn)
4. [Sistema de Certificados](#sistema-de-certificados)
5. [Painel do Chanceler](#painel-do-chanceler)
6. [Arquitetura White-Label](#arquitetura-white-label)
7. [Termo de Matrícula](#termo-de-matrícula)
8. [Plano Comercial SaaS](#plano-comercial-saas)
9. [Estrutura de Código](#estrutura-de-código)
10. [Roadmap de Implementação](#roadmap-de-implementação)

---

## 🎯 1. VISÃO GERAL

### Objetivo
Criar uma plataforma EAD robusta, escalável e regulamentada para:
- Oferecer cursos teológicos e seculares online
- Garantir progressão acadêmica rigorosa (100% obrigatório)
- Controlar acesso financeiro automatizado
- Gerar certificados válidos
- Operar como produto SaaS white-label

### Diferenciais Técnicos
✅ **Tracking de vídeo real-time** (progresso a cada 10s)  
✅ **Bloqueio acadêmico automático** (até 100% da aula)  
✅ **Bloqueio financeiro automático** (35 dias)  
✅ **Auditoria completa** (log de todas as ações)  
✅ **Certificados digitais** com código de validação  
✅ **Multi-instituição** (white-label)

---

## 🗄️ 2. BANCO DE DADOS COMPLETO

### 2.1 Schema SQL Completo (PostgreSQL/Supabase)

```sql
-- ============================================
-- INSTITUIÇÕES (White-Label Multi-Tenant)
-- ============================================

CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(150) NOT NULL,
  dominio VARCHAR(150) UNIQUE,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#1E40AF',
  secondary_color VARCHAR(7) DEFAULT '#F59E0B',
  is_active BOOLEAN DEFAULT true,
  plano TEXT CHECK (plano IN ('basico', 'profissional', 'enterprise')),
  max_alunos INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- USUÁRIOS E PERFIS
-- ============================================

-- Tabela users já existe no Supabase Auth
-- Extender com profiles

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  institution_id UUID REFERENCES institutions(id),
  nome_completo TEXT NOT NULL,
  tipo_perfil TEXT CHECK (tipo_perfil IN ('aluno', 'professor', 'diretor', 'chanceler')),
  foto_url TEXT,
  cpf VARCHAR(11) UNIQUE,
  telefone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de roles (políticas de acesso)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL,
  church_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ACADÊMICO
-- ============================================

-- Cursos
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID REFERENCES institutions(id),
  nome VARCHAR(150) NOT NULL,
  tipo VARCHAR(100), -- teologico, profissionalizante, tecnico
  nivel VARCHAR(50), -- basico, medio, bacharelado, pos
  descricao TEXT,
  carga_horaria INTEGER,
  enrollment_fee DECIMAL(10,2) DEFAULT 0,
  monthly_fee DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Matérias (Subjects)
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  nome VARCHAR(150) NOT NULL,
  ordem INTEGER NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Aulas (Lessons)
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  titulo VARCHAR(200) NOT NULL,
  ordem INTEGER NOT NULL,
  duracao_video INTEGER, -- em segundos
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vídeos das Aulas
CREATE TABLE lesson_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('upload', 'youtube', 'facebook', 'instagram', 'vimeo')),
  url TEXT NOT NULL,
  duracao_segundos INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Arquivos das Aulas
CREATE TABLE lesson_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('pdf', 'word', 'powerpoint', 'excel', 'texto')),
  titulo TEXT NOT NULL,
  arquivo_url TEXT NOT NULL,
  tamanho_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Progresso nas Aulas
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  lesson_id UUID REFERENCES lessons(id),
  percentual INTEGER DEFAULT 0 CHECK (percentual >= 0 AND percentual <= 100),
  segundos_assistidos INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- ============================================
-- BANCO DE QUESTÕES E AVALIAÇÕES
-- ============================================

-- Banco de Questões
CREATE TABLE question_bank (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id),
  pergunta TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('multipla_escolha', 'verdadeiro_falso')) NOT NULL,
  nivel_dificuldade TEXT CHECK (nivel_dificuldade IN ('facil', 'medio', 'dificil')),
  explicacao TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Opções de Questões
CREATE TABLE question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES question_bank(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  is_correta BOOLEAN DEFAULT false,
  ordem INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Provas (Simulados e Provas Finais)
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id),
  tipo TEXT CHECK (tipo IN ('simulado', 'prova_final')) NOT NULL,
  total_questoes INTEGER DEFAULT 10,
  percentual_aprovacao DECIMAL(5,2) DEFAULT 70.00,
  max_tentativas INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Questões da Prova (randomização)
CREATE TABLE exam_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  question_id UUID REFERENCES question_bank(id),
  ordem INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tentativas de Prova
CREATE TABLE exam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id),
  user_id UUID REFERENCES auth.users(id),
  nota DECIMAL(5,2),
  percentual DECIMAL(5,2),
  tentativa INTEGER NOT NULL CHECK (tentativa <= 3),
  aprovado BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  UNIQUE(exam_id, user_id, tentativa)
);

-- Respostas do Aluno
CREATE TABLE exam_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES question_bank(id),
  selected_option_id UUID REFERENCES question_options(id),
  is_correct BOOLEAN,
  answered_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- MATRÍCULAS E FINANCEIRO
-- ============================================

-- Matrículas
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  course_id UUID REFERENCES courses(id),
  institution_id UUID REFERENCES institutions(id),
  enrollment_date TIMESTAMPTZ DEFAULT now(),
  status TEXT CHECK (status IN ('active', 'blocked', 'completed', 'cancelled')) DEFAULT 'active',
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pagamentos
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  enrollment_id UUID REFERENCES enrollments(id),
  tipo TEXT CHECK (tipo IN ('matricula', 'mensalidade')) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT CHECK (status IN ('pendente', 'pago', 'atrasado')) DEFAULT 'pendente',
  metodo_pagamento TEXT,
  comprovante_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bloqueios Financeiros
CREATE TABLE financial_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  enrollment_id UUID REFERENCES enrollments(id),
  motivo TEXT NOT NULL,
  dias_atraso INTEGER,
  valor_devido DECIMAL(10,2),
  ativo BOOLEAN DEFAULT true,
  blocked_at TIMESTAMPTZ DEFAULT now(),
  unblocked_at TIMESTAMPTZ,
  unblocked_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- CERTIFICADOS
-- ============================================

CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  course_id UUID REFERENCES courses(id),
  enrollment_id UUID REFERENCES enrollments(id),
  codigo_validacao VARCHAR(50) UNIQUE NOT NULL,
  nome_aluno TEXT NOT NULL,
  nome_curso TEXT NOT NULL,
  carga_horaria INTEGER NOT NULL,
  data_conclusao DATE NOT NULL,
  emitido_em TIMESTAMPTZ DEFAULT now(),
  pdf_url TEXT,
  qr_code_url TEXT,
  is_valid BOOLEAN DEFAULT true,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- AUDITORIA E LOGS
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  acao VARCHAR(200) NOT NULL,
  entidade VARCHAR(100) NOT NULL, -- 'enrollment', 'payment', 'exam_attempt'
  entidade_id UUID,
  detalhes JSONB,
  ip VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Log específico de desbloqueios (governança)
CREATE TABLE unlock_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id),
  blocked_user_id UUID REFERENCES auth.users(id),
  unblocked_by UUID REFERENCES auth.users(id),
  unblocked_by_role TEXT, -- 'chanceler' ou 'diretor'
  motivo TEXT NOT NULL,
  dias_atraso INTEGER,
  valor_devido DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.2 Índices de Performance

```sql
-- Índices críticos para performance
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

---

## 📊 3. FLUXOS BPMN

### 3.1 Fluxo Acadêmico Principal

```
[Início] → [Matrícula Paga?] 
         ↓ Não → [Bloqueia Acesso]
         ↓ Sim
[Libera Primeira Aula] → [Aluno Assiste Vídeo 100%]
         ↓
[Salva Progresso a cada 10s] → [Completou 100%?]
         ↓ Não → [Aguarda]
         ↓ Sim
[Desbloqueia Próxima Aula] → [Todas Aulas Concluídas?]
         ↓ Não → [Volta para Assistir]
         ↓ Sim
[Libera Prova Final] → [Aluno Faz Prova]
         ↓
[Nota ≥ 70%?]
         ↓ Não → [Tentativa < 3?]
                  ↓ Sim → [Permite Refazer]
                  ↓ Não → [Reprova na Matéria]
         ↓ Sim
[Aprova Matéria] → [Todas Matérias Concluídas?]
         ↓ Não → [Vai para Próxima Matéria]
         ↓ Sim
[Gera Certificado] → [Fim]
```

### 3.2 Fluxo Financeiro Automático

```
[Matrícula Confirmada] → [30 dias]
         ↓
[Gera Cobrança Mensalidade] → [Pagamento Recebido?]
         ↓ Não → [Aguarda 5 dias]
                  ↓
                 [35 dias sem pagamento]
                  ↓
                 [Bloqueio Automático]
                  ↓
                 [Notifica Aluno + Diretor]
         ↓ Sim
[Libera Acesso por mais 30 dias] → [Loop]
```

### 3.3 Fluxo de Desbloqueio (Governança)

```
[Aluno Bloqueado] → [Solicita Desbloqueio]
         ↓
[Chanceler/Diretor Analisa]
         ↓
[Aprova?]
         ↓ Não → [Permanece Bloqueado]
         ↓ Sim
[Insere Motivo] → [Executa Desbloqueio]
         ↓
[Registra em unlock_logs] → [Notifica Aluno]
         ↓
[Fim]
```

---

## 🎓 4. SISTEMA DE CERTIFICADOS

### 4.1 Regras de Emissão

**Certificado é gerado automaticamente quando:**
1. ✅ Todas as matérias do curso foram concluídas
2. ✅ Todas as provas finais foram aprovadas (≥70%)
3. ✅ Não há pendências financeiras
4. ✅ Status da matrícula = 'active' ou 'completed'

### 4.2 Estrutura do Certificado

```typescript
interface Certificate {
  codigo_validacao: string; // Exemplo: "FAITEL-2025-ABC123XYZ"
  nome_aluno: string;
  cpf_aluno: string;
  nome_curso: string;
  carga_horaria: number;
  data_conclusao: Date;
  assinaturas: {
    chanceler: string;
    diretor_academico: string;
  };
  qr_code: string; // URL de validação pública
}
```

### 4.3 Validação Pública

```
URL: https://faculdadefaitel.com.br/validar-certificado/:codigo

Retorna:
- Nome do aluno
- Curso
- Data de conclusão
- Status: Válido/Revogado
```

### 4.4 SQL para Gerar Certificado

```sql
CREATE OR REPLACE FUNCTION generate_certificate(p_enrollment_id UUID)
RETURNS UUID AS $$
DECLARE
  v_certificate_id UUID;
  v_user_id UUID;
  v_course_id UUID;
  v_nome_aluno TEXT;
  v_nome_curso TEXT;
  v_carga_horaria INTEGER;
  v_codigo VARCHAR(50);
BEGIN
  -- Verificar se todas as matérias foram concluídas
  -- Verificar se não há bloqueio financeiro
  -- Gerar código único
  v_codigo := 'FAITEL-' || EXTRACT(YEAR FROM now()) || '-' || substr(md5(random()::text), 1, 10);
  
  -- Inserir certificado
  INSERT INTO certificates (
    user_id, course_id, enrollment_id,
    codigo_validacao, nome_aluno, nome_curso,
    carga_horaria, data_conclusao
  ) VALUES (
    v_user_id, v_course_id, p_enrollment_id,
    v_codigo, v_nome_aluno, v_nome_curso,
    v_carga_horaria, CURRENT_DATE
  ) RETURNING id INTO v_certificate_id;
  
  RETURN v_certificate_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 👔 5. PAINEL DO CHANCELER - GOVERNANÇA TOTAL

### 5.1 Funcionalidades

```
/chanceler/dashboard

📊 KPIs Principais:
- Total de alunos ativos
- Alunos bloqueados
- Receita mensal (prevista vs realizada)
- Taxa de aprovação geral
- Certificados emitidos no mês

📋 Seções:
1. Desbloqueios Realizados (histórico completo)
2. Alunos Inadimplentes (lista + ações)
3. Aprovações e Reprovações por Curso
4. Logs de Auditoria (filtráveis)
5. Relatórios Customizados
```

### 5.2 SQL para Relatório de Governança

```sql
-- Relatório de Desbloqueios (últimos 30 dias)
SELECT 
  ul.created_at,
  p.nome_completo as aluno,
  ul.unblocked_by_role as desbloqueado_por,
  ul.motivo,
  ul.dias_atraso,
  ul.valor_devido
FROM unlock_logs ul
INNER JOIN profiles p ON p.user_id = ul.blocked_user_id
WHERE ul.created_at >= now() - INTERVAL '30 days'
ORDER BY ul.created_at DESC;

-- Alunos bloqueados atualmente
SELECT 
  p.nome_completo,
  c.nome as curso,
  fb.dias_atraso,
  fb.valor_devido,
  fb.blocked_at
FROM financial_blocks fb
INNER JOIN profiles p ON p.user_id = fb.user_id
INNER JOIN enrollments e ON e.id = fb.enrollment_id
INNER JOIN courses c ON c.id = e.course_id
WHERE fb.ativo = true
ORDER BY fb.dias_atraso DESC;
```

---

## 🏢 6. ARQUITETURA WHITE-LABEL (Multi-Tenant)

### 6.1 Modelo de Operação

```
FAITEL - Instituição Principal
  ├── Igreja ABC - Polo 1
  │   ├── Cursos: Teologia Básica, Liderança
  │   └── Domínio: abc.faculdadefaitel.com
  │
  ├── Escola XYZ - Cliente 2
  │   ├── Cursos: Profissionalizantes
  │   └── Domínio: xyz.faculdadefaitel.com
  │
  └── Instituto DEF - Cliente 3
      ├── Cursos: Técnicos
      └── Domínio: def.faculdadefaitel.com
```

### 6.2 Isolamento de Dados

**RLS Policy Example:**
```sql
-- Cada instituição só vê seus próprios dados
CREATE POLICY "Institutions see own data"
  ON courses FOR SELECT
  USING (
    institution_id = (
      SELECT institution_id 
      FROM profiles 
      WHERE user_id = auth.uid()
    )
  );
```

### 6.3 Customização por Instituição

```typescript
interface InstitutionConfig {
  nome: string;
  logo_url: string;
  primary_color: string; // #1E40AF
  secondary_color: string; // #F59E0B
  dominio: string; // custom.domain.com
  plano: 'basico' | 'profissional' | 'enterprise';
  limites: {
    max_alunos: number;
    max_cursos: number;
    max_professores: number;
  };
}
```

---

## 📜 7. TERMO DE MATRÍCULA E CONTRATO EDUCACIONAL

### Modelo Oficial (Resumido)

```
TERMO DE MATRÍCULA E CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS

Entre:
CONTRATANTE: [Nome do Aluno], CPF [XXX.XXX.XXX-XX]
CONTRATADA: FAITEL - Faculdade Internacional Teológica de Líderes

CLÁUSULA 1ª – DO OBJETO
A CONTRATADA oferece cursos de educação a distância (EAD) regulamentados conforme legislação vigente.

CLÁUSULA 2ª – DO ACESSO
O acesso à plataforma será liberado após confirmação do pagamento da matrícula.

CLÁUSULA 3ª – DA PROGRESSÃO ACADÊMICA
O aluno deverá assistir 100% de cada aula em vídeo para liberar a próxima.
Ao final de cada matéria, deverá realizar prova final com aprovação mínima de 70%.

CLÁUSULA 4ª – DAS AVALIAÇÕES
- Simulados: a cada 3 aulas, sem nota
- Prova Final: 10 questões, até 3 tentativas

CLÁUSULA 5ª – DO FINANCEIRO
Mensalidade vence a cada 30 dias.
Atraso superior a 35 dias acarretará bloqueio automático do acesso.

CLÁUSULA 6ª – DO DESBLOQUEIO
Somente o Chanceler ou Diretor Acadêmico poderão autorizar desbloqueio,
com registro obrigatório em sistema.

CLÁUSULA 7ª – DO CERTIFICADO
Será emitido automaticamente após conclusão de todas as matérias
e regularização financeira.

Data: ___/___/______
Assinatura do Aluno: ___________________
Assinatura da FAITEL: ___________________
```

---

## 💼 8. PLANO COMERCIAL SAAS

### 8.1 Modelo de Negócio

**FAITEL como Produto SaaS Educacional**

### 8.2 Planos de Licenciamento

| Plano | Alunos | Cursos | Professores | Preço/Mês |
|-------|--------|--------|-------------|-----------|
| **Básico** | até 500 | 5 | 10 | R$ 497 |
| **Profissional** | até 5.000 | 20 | 50 | R$ 997 |
| **Enterprise** | Ilimitado | Ilimitado | Ilimitado | R$ 2.497 |

### 8.3 Diferenciais Comerciais

✅ **Controle Acadêmico Rígido** - Impossível burlar progressão  
✅ **Auditoria Total** - Transparência em todas as ações  
✅ **Certificados Válidos** - Com validação pública  
✅ **White-Label Completo** - Marca própria do cliente  
✅ **Multi-Instituição** - Gerenciar várias unidades  
✅ **Financeiro Integrado** - Bloqueio/desbloqueio automático

### 8.4 Público-Alvo

- Igrejas com escola teológica
- Seminários e institutos bíblicos
- Escolas profissionalizantes
- Instituições de ensino técnico
- Empresas com treinamento interno

---

## 💻 9. ESTRUTURA DE CÓDIGO

### 9.1 Arquitetura Frontend (React + TypeScript)

```
src/
├── pages/
│   ├── ead/
│   │   ├── StudentDashboard.tsx
│   │   ├── LessonPlayer.tsx
│   │   ├── ExamPage.tsx
│   │   ├── CertificatePage.tsx
│   │   └── FinancialBlockedPage.tsx
│   ├── admin/
│   │   ├── ChancelerDashboard.tsx
│   │   ├── CourseManager.tsx
│   │   ├── QuestionBank.tsx
│   │   └── FinancialControl.tsx
│   └── professor/
│       ├── ProfessorDashboard.tsx
│       └── StudentProgress.tsx
├── components/
│   ├── ead/
│   │   ├── VideoPlayer.tsx (com tracking)
│   │   ├── ProgressBar.tsx
│   │   ├── QuestionCard.tsx
│   │   └── CertificateTemplate.tsx
│   └── admin/
│       ├── UnlockModal.tsx
│       └── AuditLogTable.tsx
├── hooks/
│   ├── useVideoProgress.ts
│   ├── useFinancialStatus.ts
│   └── useEnrollmentProgress.ts
└── utils/
    ├── certificateGenerator.ts
    └── auditLogger.ts
```

### 9.2 Exemplo: Video Player com Tracking

```typescript
// src/components/ead/VideoPlayer.tsx
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface VideoPlayerProps {
  lessonId: string;
  videoUrl: string;
  enrollmentId: string;
  onComplete: () => void;
}

export function VideoPlayer({ lessonId, videoUrl, enrollmentId, onComplete }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Salvar progresso a cada 10 segundos
    const interval = setInterval(async () => {
      const currentTime = video.currentTime;
      const duration = video.duration;
      const percentage = (currentTime / duration) * 100;
      
      await supabase.from('lesson_progress').upsert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        lesson_id: lessonId,
        segundos_assistidos: Math.floor(currentTime),
        percentual: Math.floor(percentage)
      });
    }, 10000);
    
    // Detectar conclusão
    video.addEventListener('ended', async () => {
      await supabase.from('lesson_progress').update({
        completed: true,
        percentual: 100,
        completed_at: new Date().toISOString()
      }).eq('lesson_id', lessonId);
      
      onComplete();
    });
    
    return () => clearInterval(interval);
  }, [lessonId]);
  
  return (
    <video
      ref={videoRef}
      src={videoUrl}
      controls
      controlsList="nodownload"
      onContextMenu={(e) => e.preventDefault()}
      className="w-full aspect-video"
    />
  );
}
```

---

## 🚀 10. ROADMAP DE IMPLEMENTAÇÃO

### Fase 1: Fundação (2 semanas)
- [x] Estrutura de banco de dados
- [ ] Aplicar migrations no Supabase
- [ ] Configurar RLS policies
- [ ] Criar estrutura de pastas React

### Fase 2: Core Acadêmico (3 semanas)
- [ ] Player de vídeo com tracking
- [ ] Sistema de progressão de aulas
- [ ] Banco de questões
- [ ] Simulados e provas

### Fase 3: Financeiro (1 semana)
- [ ] Sistema de pagamentos
- [ ] Bloqueio/desbloqueio automático
- [ ] Painel financeiro

### Fase 4: Certificados (1 semana)
- [ ] Geração automática
- [ ] Template PDF
- [ ] Validação pública

### Fase 5: Governança (1 semana)
- [ ] Painel do Chanceler
- [ ] Logs de auditoria
- [ ] Relatórios estratégicos

### Fase 6: White-Label (2 semanas)
- [ ] Multi-tenancy
- [ ] Customização de marca
- [ ] Domínios personalizados

### Fase 7: Deploy (1 semana)
- [ ] Testes finais
- [ ] Deploy em produção
- [ ] Documentação de uso

**Total Estimado**: 11 semanas

---

## 📞 SUPORTE E CONTATO

**FAITEL - Faculdade Internacional Teológica de Líderes**  
📧 Email: contato@faculdadefaitel.com.br  
🌐 Site: https://faculdadefaitel.com.br  
📱 WhatsApp: +55 71 99999-9999

**Chanceler**: Valdinei da Conceição Santos  
**Versão do Documento**: 1.0  
**Última Atualização**: 13/12/2025

---

## ✅ STATUS: PRONTO PARA IMPLEMENTAÇÃO

Este documento contém TODA a arquitetura técnica e institucional necessária para implementar a Plataforma EAD FAITEL como produto SaaS profissional.

Todos os elementos estão prontos:
- ✅ Banco de dados completo
- ✅ Fluxos BPMN documentados
- ✅ Sistema de certificados
- ✅ Arquitetura white-label
- ✅ Plano comercial
- ✅ Estrutura de código

**Próximo Passo**: Aplicar migrations e iniciar desenvolvimento do frontend.
