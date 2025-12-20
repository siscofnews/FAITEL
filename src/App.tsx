import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Portal from "./pages/Portal";
import Index from "./pages/Index";
import Igrejas from "./pages/Igrejas";
import Escola from "./pages/Escola";
import Escalas from "./pages/Escalas";
import Pessoas from "./pages/Pessoas";
import Comunicacao from "./pages/Comunicacao";
import Relatorios from "./pages/Relatorios";
import Financeiro from "./pages/Financeiro";
import Configuracoes from "./pages/Configuracoes";

import Parceiros from "./pages/Parceiros";
import ParceiroDetalhe from "./pages/ParceiroDetalhe";
import RedesSociais from "./pages/RedesSociais";
import Eventos from "./pages/Eventos";
import IgrejaDetalhe from "./pages/IgrejaDetalhe";
import Membros from "./pages/Membros";
import RecuperarSenha from "./pages/RecuperarSenha";
import AceitarConvite from "./pages/AceitarConvite";
import Convites from "./pages/Convites";
import AGO30CEMADEB from "./pages/AGO30CEMADEB";
import CadastrarIgreja from "./pages/CadastrarIgreja";
import CadastrarIgrejaAdmin from "./pages/CadastrarIgrejaAdmin";
import CadastrarIgrejaFilha from "./pages/CadastrarIgrejaFilha";
import IgrejasAprovacao from "./pages/IgrejasAprovacao";
import ConsultaEscalas from "./pages/ConsultaEscalas";
import SistemaEscalas from "./pages/SistemaEscalas";
import Lideranca from "./pages/Lideranca";
import GaleriaAGOs from "./pages/GaleriaAGOs";
import CadastroMembro from "./pages/CadastroMembro";
import CadastroSucesso from "./pages/CadastroSucesso";
import EventosIADMA from "./pages/EventosIADMA";
import IgrejaLanding from "./pages/IgrejaLanding";
import NotFound from "./pages/NotFound";
import LimparDados from "./pages/LimparDados";
import CadastrarEstrutura from "./pages/CadastrarEstrutura";
import GerenciarPermissoes from "./pages/GerenciarPermissoes";
import CadastrarCelula from "./pages/CadastrarCelula";
import AprovarMatrizes from "./pages/AprovarMatrizes";
import ConfigurarIgreja from "./pages/ConfigurarIgreja";
import GerenciarEscalas from "./pages/GerenciarEscalas";
import GerenciarDados from "./pages/GerenciarDados";
import Dashboard from "./pages/Dashboard";
import CriarUnidade from "./pages/CriarUnidade";
import ListaIgrejas from "./pages/ListaIgrejas";
import DetalhesIgrejaHierarquia from "./pages/DetalhesIgrejaHierarquia";
import CadastrarMembroAdmin from "./pages/CadastrarMembroAdmin";
import EscolaCulto from "./pages/EscolaCulto";
import DetalheCurso from "./pages/DetalheCurso";
import MeusCursos from "./pages/MeusCursos";
import Certificados from "./pages/Certificados";
import FinanceiroSISCOF from "./pages/FinanceiroSISCOF";
import GerenciarCursos from "./pages/GerenciarCursos";
import GerenciarModulosAulas from "./pages/GerenciarModulosAulas";
import GerenciarTurmas from "./pages/GerenciarTurmas";
import GerenciarAvaliacoes from "./pages/GerenciarAvaliacoes";
import MinhasTurmas from "./pages/MinhasTurmas";
import MatricularTurma from "./pages/MatricularTurma";
import ConteudoTurma from "./pages/ConteudoTurma";
import AssistirAula from "./pages/AssistirAula";
import AlunosMatriculados from "./pages/AlunosMatriculados";
import DashboardMelhorado from "./pages/DashboardMelhorado";
import ConfiguracoesNotificacoes from "./pages/ConfiguracoesNotificacoes";
import ConfiguracoesVisuais from "./pages/ConfiguracoesVisuais";

// SISCOF 3.0 - Dual RBAC & EAD Module
import GerenciarPerfisGlobais from "./pages/GerenciarPerfisGlobais";
import AtribuirPermissoes from "./pages/AtribuirPermissoes";
import RadioSISCOF from "./pages/RadioSISCOF";

import SiscofAssistant from "./components/SiscofAssistant";
import LandingEscalas from "./pages/public/LandingEscalas";
import CadastroMembroPublico from "./pages/public/CadastroMembroPublico";
import CreateSchedulePage from "./pages/worship/CreateSchedulePage";
import AuditLogsPage from "./pages/admin/AuditLogsPage";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { VisitorBanner } from "@/components/layout/VisitorBanner";
import PublicSchedulePage from "@/pages/public/PublicSchedulePage";
import { RadioPlayer } from "@/components/layout/RadioPlayer";
import AgendaPublica from "@/pages/public/AgendaPublica";
import AgendaPublicaCemadeb from "@/pages/public/AgendaPublicaCemadeb";
import GetAssistente from "@/pages/admin/GetAssistente";
import ContatosManager from "@/pages/admin/ContatosManager";
import LembretesAutomaticos from "@/pages/admin/LembretesAutomaticos";
import AssinaturasAdmin from "@/pages/admin/AssinaturasAdmin";
import PerfisLocais from "@/pages/PerfisLocais";
import AssetsList from "@/pages/patrimonio/AssetsList";
import PatrimonioDashboard from "@/pages/patrimonio/PatrimonioDashboard";
import PrintAuthorization from "@/pages/patrimonio/PrintAuthorization";
import AssetForm from "@/pages/patrimonio/AssetForm";
import AssetDetail from "@/pages/patrimonio/AssetDetail";
import MovementForm from "@/pages/patrimonio/MovementForm";
import DefectsRepairs from "@/pages/patrimonio/DefectsRepairs";
import PatrimonioReports from "@/pages/patrimonio/PatrimonioReports";
// removed duplicate import to avoid identifier conflict
import CadastroMinisterial from "@/pages/public/CadastroMinisterial";
import MemberCredential from "@/pages/membros/MemberCredential";
import ValidateCredential from "@/pages/membros/ValidateCredential";
import ChurchesTree from "@/pages/admin/ChurchesTree";
import ImportarMembros from "@/pages/admin/ImportarMembros";
import CredentialTemplatesManager from "@/pages/admin/CredentialTemplatesManager";
import CredentialBatchIssue from "@/pages/admin/CredentialBatchIssue";
import ValidateSignature from "@/pages/membros/ValidateSignature";
import CredentialGabaritoExport from "@/pages/membros/CredentialGabaritoExport";
import TreasuryDashboard from "@/pages/tesouraria/TreasuryDashboard";
import TreasuryClosure from "@/pages/tesouraria/TreasuryClosure";
import MonthlyReports from "@/pages/tesouraria/MonthlyReports";
import AccountingExport from "@/pages/tesouraria/AccountingExport";
import AccountingSpedExport from "@/pages/tesouraria/AccountingSpedExport";
import CostCenters from "@/pages/tesouraria/CostCenters";
import ChartAccounts from "@/pages/tesouraria/ChartAccounts";

import AccountingCustomExport from "@/pages/tesouraria/AccountingCustomExport";
import TrendsReports from "@/pages/tesouraria/TrendsReports";
import FinanceTypeMapping from "@/pages/tesouraria/FinanceTypeMapping";
import AdvancedFiltersReports from "@/pages/tesouraria/AdvancedFiltersReports";
import HeatmapTargets from "@/pages/tesouraria/HeatmapTargets";
import TargetsCsv from "@/pages/tesouraria/TargetsCsv";
import AccountingSpecManager from "@/pages/tesouraria/AccountingSpecManager";
import Login from "@/pages/auth/Login";
import GlobalAdmin from "@/pages/admin/GlobalAdmin";
import ChurchAdminDashboard from "@/pages/admin/ChurchAdminDashboard";
import ConventionAdminDashboard from "@/pages/admin/ConventionAdminDashboard";
import CollegeAdminDashboard from "@/pages/admin/CollegeAdminDashboard";

import MatrizManage from "@/pages/admin/churches/MatrizManage";
import SedeManage from "@/pages/admin/churches/SedeManage";
import SubsedeManage from "@/pages/admin/churches/SubsedeManage";
import CongregationManage from "@/pages/admin/churches/CongregationManage";
import NationalManage from "@/pages/admin/conventions/NationalManage";
import StateManage from "@/pages/admin/conventions/StateManage";
import CoordinationManage from "@/pages/admin/conventions/CoordinationManage";
import CollegeMatrizManage from "@/pages/admin/college/MatrizManage";
import PoloManage from "@/pages/admin/college/PoloManage";
import NucleoManage from "@/pages/admin/college/NucleoManage";
import MultiLevelReports from "@/pages/tesouraria/MultiLevelReports";
import MultiEntityConsolidation from "@/pages/tesouraria/MultiEntityConsolidation";
import ChartAccountsCsv from "@/pages/tesouraria/ChartAccountsCsv";
import CoursesManage from "@/pages/ead/admin/CoursesManage";
import ModulesManage from "@/pages/ead/admin/ModulesManage";
import QuestionsBank from "@/pages/ead/admin/QuestionsBank";
import ExamsManage from "@/pages/ead/admin/ExamsManage";
import Enrollments from "@/pages/ead/polo/Enrollments";
import ExamBuilder from "@/pages/ead/polo/ExamBuilder";
import ContentManage from "@/pages/ead/professor/ContentManage";
import StudentDashboard from "@/pages/ead/student/Dashboard";
import StudentLogin from "@/pages/ead/StudentLogin";
import WelcomeEmailEditor from "@/pages/ead/admin/WelcomeEmailEditor";
import ContentOnboarding from "@/pages/ead/admin/ContentOnboarding";
import FAITELDashboard from "@/pages/ead/FAITELDashboard";
import BachareladoTeologia from "./pages/ead/BachareladoTeologia";
import SeedDemo from "@/pages/ead/admin/SeedDemo";
import ModuleViewer from "@/pages/ead/student/ModuleViewer";
import ExamRunner from "@/pages/ead/student/ExamRunner";
import VideoPlayer from "@/pages/ead/student/VideoPlayer";
import AcademicReports from "@/pages/ead/reports/AcademicReports";
import FinancePanel from "@/pages/ead/admin/FinancePanel";
import Licensing from "@/pages/ead/admin/Licensing";
import SettingsManage from "@/pages/ead/admin/SettingsManage";
import { HomeFloating } from "@/components/layout/HomeFloating";
import EmConstrucao from "@/pages/EmConstrucao";
import AlunoPortal from "@/pages/ead/portals/AlunoPortal";
import ProfessorPortal from "@/pages/ead/portals/ProfessorPortal";
import DiretorPortal from "@/pages/ead/portals/DiretorPortal";
import SuperAdminPortal from "@/pages/ead/portals/SuperAdminPortal";

// New EAD Platform MVP Components
import StudentManager from "@/pages/ead/admin/StudentManager";
import StudentDashboardNew from "@/pages/ead/aluno/StudentDashboard";
import StudentCourseView from "@/pages/ead/aluno/StudentCourseView";
import LessonPlayer from "@/pages/ead/aluno/LessonPlayer";
import CadastrarFaculdade from "@/pages/ead/admin/CadastrarFaculdade";
import FaculdadesManager from "@/pages/ead/admin/FaculdadesManager";
import CadastrarPolo from "@/pages/ead/admin/CadastrarPolo";
import PolosManager from "@/pages/ead/admin/PolosManager";
import CadastrarProfessor from "@/pages/ead/admin/CadastrarProfessor";
import ProfessoresManager from "@/pages/ead/admin/ProfessoresManager";
import ProfessorDashboard from "@/pages/ead/professor/ProfessorDashboard";
import FaitelLandingPage from "@/pages/ead/public/FaitelLandingPage";


const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <RadioPlayer />
              {/* Banner Fixed below Radio Player */}
              <div className="fixed top-16 left-0 right-0 z-30">
                <VisitorBanner />
              </div>
              <HomeFloating />

              <div className="pt-32 min-h-screen flex flex-col">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<FaitelLandingPage />} />
                  <Route path="/auth/login" element={<Login />} />
                  <Route path="/escalas-publicas" element={<PublicSchedulePage />} />
                  <Route path="/agenda-publica" element={<AgendaPublica />} />
                  <Route path="/agenda-publica-cemadeb" element={<AgendaPublicaCemadeb />} />
                  <Route path="/sistema-escalas" element={<LandingEscalas />} />
                  <Route path="/cadastro-membro/:matrizId" element={<CadastroMembroPublico />} />

                  {/* EAD Portal Routes */}
                  <Route path="/aluno" element={<AlunoPortal />} />
                  <Route path="/professor" element={<ProfessorPortal />} />
                  <Route path="/admin/diretor" element={<DiretorPortal />} />
                  <Route path="/admin/super" element={<SuperAdminPortal />} />
                  <Route path="/em-construcao" element={<EmConstrucao />} />

                  <Route path="/recuperar-senha" element={<RecuperarSenha />} />
                  <Route path="/convite/:token" element={<AceitarConvite />} />
                  <Route path="/parceiros" element={<Parceiros />} />
                  <Route path="/parceiros/:id" element={<ParceiroDetalhe />} />
                  <Route path="/redes-sociais" element={<RedesSociais />} />
                  <Route path="/eventos" element={<Eventos />} />
                  <Route path="/cadastrar-igreja" element={<CadastrarIgreja />} />
                  <Route path="/noticias/ago-30-cemadeb" element={<AGO30CEMADEB />} />
                  <Route path="/lideranca" element={<Lideranca />} />
                  <Route path="/galeria-agos" element={<GaleriaAGOs />} />
                  <Route path="/consulta-escalas" element={<ConsultaEscalas />} />
                  {/* <Route path="/sistema-escalas" element={<SistemaEscalas />} /> */}
                  <Route path="/cadastro-membro" element={<CadastroMembro />} />

                  <Route path="/cadastro-sucesso" element={<CadastroSucesso />} />
                  <Route path="/eventos-iadma" element={<EventosIADMA />} />
                  <Route path="/igreja/:id" element={<IgrejaLanding />} />

                  {/* Protected routes */}
                  <Route path="/painel-hierarquico" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/criar-unidade/:nivel" element={<ProtectedRoute><CriarUnidade /></ProtectedRoute>} />
                  <Route path="/igrejas" element={<ProtectedRoute><ListaIgrejas /></ProtectedRoute>} />
                  <Route path="/igreja/:id/detalhes" element={<ProtectedRoute><DetalhesIgrejaHierarquia /></ProtectedRoute>} />
                  <Route path="/cadastrar-membro-admin" element={<ProtectedRoute><CadastrarMembroAdmin /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/igrejas" element={<ProtectedRoute><Igrejas /></ProtectedRoute>} />
                  <Route path="/igrejas/:id" element={<ProtectedRoute><IgrejaDetalhe /></ProtectedRoute>} />
                  <Route path="/membros" element={<ProtectedRoute><Membros /></ProtectedRoute>} />
                  <Route path="/escola" element={<ProtectedRoute><Escola /></ProtectedRoute>} />
                  <Route path="/escalas" element={<ProtectedRoute><Escalas /></ProtectedRoute>} />
                  <Route path="/escalas/novo" element={<ProtectedRoute><CreateSchedulePage /></ProtectedRoute>} />
                  <Route path="/pessoas" element={<ProtectedRoute><Pessoas /></ProtectedRoute>} />
                  <Route path="/comunicacao" element={<ProtectedRoute><Comunicacao /></ProtectedRoute>} />
                  <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
                  <Route path="/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
                  <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
                  <Route path="/auditoria" element={<ProtectedRoute><AuditLogsPage /></ProtectedRoute>} />
                  <Route path="/convites" element={<ProtectedRoute><Convites /></ProtectedRoute>} />
                  <Route path="/igrejas-aprovacao" element={<ProtectedRoute><IgrejasAprovacao /></ProtectedRoute>} />
                  <Route path="/cadastrar-igreja-filha" element={<ProtectedRoute><CadastrarIgrejaFilha /></ProtectedRoute>} />
                  <Route path="/cadastrar-igreja-admin" element={<ProtectedRoute><CadastrarIgrejaAdmin /></ProtectedRoute>} />
                  <Route path="/limpar-dados" element={<ProtectedRoute><LimparDados /></ProtectedRoute>} />
                  <Route path="/cadastrar-estrutura" element={<ProtectedRoute><CadastrarEstrutura /></ProtectedRoute>} />
                  <Route path="/gerenciar-permissoes" element={<ProtectedRoute><GerenciarPermissoes /></ProtectedRoute>} />
                  <Route path="/cadastrar-celula" element={<ProtectedRoute><CadastrarCelula /></ProtectedRoute>} />
                  <Route path="/aprovar-matrizes" element={<ProtectedRoute><AprovarMatrizes /></ProtectedRoute>} />
                  <Route path="/configurar-igreja" element={<ProtectedRoute><ConfigurarIgreja /></ProtectedRoute>} />
                  <Route path="/gerenciar-escalas" element={<ProtectedRoute><GerenciarEscalas /></ProtectedRoute>} />
                  <Route path="/gerenciar-dados" element={<ProtectedRoute><GerenciarDados /></ProtectedRoute>} />



                  {/* SISCOF - Escola de Culto */}
                  <Route path="/escola-culto" element={<ProtectedRoute><EscolaCulto /></ProtectedRoute>} />
                  <Route path="/escola-culto/curso/:id" element={<ProtectedRoute><DetalheCurso /></ProtectedRoute>} />
                  <Route path="/escola-culto/meus-cursos" element={<ProtectedRoute><MeusCursos /></ProtectedRoute>} />
                  <Route path="/escola-culto/certificados" element={<ProtectedRoute><Certificados /></ProtectedRoute>} />
                  <Route path="/financeiro-siscof" element={<ProtectedRoute><FinanceiroSISCOF /></ProtectedRoute>} />

                  {/* SISCOF - Admin Pages */}
                  <Route path="/gerenciar-cursos" element={<ProtectedRoute><GerenciarCursos /></ProtectedRoute>} />
                  <Route path="/escola-culto/curso/:courseId/gerenciar" element={<ProtectedRoute><GerenciarModulosAulas /></ProtectedRoute>} />
                  <Route path="/gerenciar-turmas" element={<ProtectedRoute><GerenciarTurmas /></ProtectedRoute>} />
                  <Route path="/aula/:lessonId/avaliacoes" element={<ProtectedRoute><GerenciarAvaliacoes /></ProtectedRoute>} />
                  <Route path="/turma/:classId/alunos" element={<ProtectedRoute><AlunosMatriculados /></ProtectedRoute>} />
                  {/* SISCOF - Student Pages */}
                  <Route path="/minhas-turmas" element={<ProtectedRoute><MinhasTurmas /></ProtectedRoute>} />
                  <Route path="/curso/:courseId/matricular" element={<ProtectedRoute><MatricularTurma /></ProtectedRoute>} />
                  <Route path="/turma/:classId/aulas" element={<ProtectedRoute><ConteudoTurma /></ProtectedRoute>} />
                  <Route path="/aula/:lessonId/assistir" element={<ProtectedRoute><AssistirAula /></ProtectedRoute>} />

                  {/* SISCOF - New Features from Escalas PRD */}
                  <Route path="/dashboard-melhorado" element={<ProtectedRoute><DashboardMelhorado /></ProtectedRoute>} />
                  <Route path="/configuracoes-notificacoes" element={<ProtectedRoute><ConfiguracoesNotificacoes /></ProtectedRoute>} />
                  <Route path="/configuracoes-visuais" element={<ProtectedRoute><ConfiguracoesVisuais /></ProtectedRoute>} />

                  {/* SISCOF - Assistente e Lembretes */}
                  <Route path="/assistente-lembretes" element={<ProtectedRoute><GetAssistente /></ProtectedRoute>} />
                  <Route path="/contatos-lembretes" element={<ProtectedRoute><ContatosManager /></ProtectedRoute>} />
                  <Route path="/lembretes-automaticos" element={<ProtectedRoute><LembretesAutomaticos /></ProtectedRoute>} />
                  <Route path="/assinaturas" element={<ProtectedRoute><AssinaturasAdmin /></ProtectedRoute>} />
                  <Route path="/perfis-locais/:churchId" element={<ProtectedRoute><PerfisLocais /></ProtectedRoute>} />
                  <Route path="/patrimonio" element={<ProtectedRoute><PatrimonioDashboard /></ProtectedRoute>} />
                  <Route path="/patrimonio/itens" element={<ProtectedRoute><AssetsList /></ProtectedRoute>} />
                  <Route path="/patrimonio/novo" element={<ProtectedRoute><AssetForm /></ProtectedRoute>} />
                  <Route path="/patrimonio/item/:assetId" element={<ProtectedRoute><AssetDetail /></ProtectedRoute>} />
                  <Route path="/patrimonio/movimentar/:assetId" element={<ProtectedRoute><MovementForm /></ProtectedRoute>} />
                  <Route path="/patrimonio/defeitos/:assetId" element={<ProtectedRoute><DefectsRepairs /></ProtectedRoute>} />
                  <Route path="/patrimonio/relatorios" element={<ProtectedRoute><PatrimonioReports /></ProtectedRoute>} />
                  <Route path="/cadastro-membro" element={<CadastroMembro />} />
                  <Route path="/cadastro-ministerial" element={<CadastroMinisterial />} />
                  <Route path="/credencial/:id" element={<ProtectedRoute><MemberCredential /></ProtectedRoute>} />
                  <Route path="/validar-credencial" element={<ValidateCredential />} />
                  <Route path="/validar-assinatura" element={<ValidateSignature />} />
                  <Route path="/export-credencial/:id" element={<ProtectedRoute><CredentialGabaritoExport /></ProtectedRoute>} />
                  <Route path="/arvore-unidades" element={<ProtectedRoute><ChurchesTree /></ProtectedRoute>} />
                  <Route path="/importar-membros" element={<ProtectedRoute><ImportarMembros /></ProtectedRoute>} />
                  <Route path="/modelos-credencial" element={<ProtectedRoute><CredentialTemplatesManager /></ProtectedRoute>} />
                  <Route path="/emissao-credenciais" element={<ProtectedRoute><CredentialBatchIssue /></ProtectedRoute>} />
                  <Route path="/tesouraria" element={<ProtectedRoute><TreasuryDashboard /></ProtectedRoute>} />
                  <Route path="/tesouraria/fechamento" element={<ProtectedRoute><TreasuryClosure /></ProtectedRoute>} />
                  <Route path="/tesouraria/relatorios" element={<ProtectedRoute><MonthlyReports /></ProtectedRoute>} />
                  <Route path="/tesouraria/export-contabil" element={<ProtectedRoute><AccountingExport /></ProtectedRoute>} />
                  <Route path="/tesouraria/export-txt" element={<ProtectedRoute><AccountingSpedExport /></ProtectedRoute>} />
                  <Route path="/tesouraria/centros-custo" element={<ProtectedRoute><CostCenters /></ProtectedRoute>} />
                  <Route path="/tesouraria/plano-contas" element={<ProtectedRoute><ChartAccounts /></ProtectedRoute>} />
                  <Route path="/tesouraria/consolidacao" element={<ProtectedRoute><MultiEntityConsolidation /></ProtectedRoute>} />
                  <Route path="/tesouraria/export-contador" element={<ProtectedRoute><AccountingCustomExport /></ProtectedRoute>} />
                  <Route path="/tesouraria/tendencias" element={<ProtectedRoute><TrendsReports /></ProtectedRoute>} />
                  <Route path="/tesouraria/mapeamento-tipo-conta" element={<ProtectedRoute><FinanceTypeMapping /></ProtectedRoute>} />
                  <Route path="/tesouraria/filtros-avancados" element={<ProtectedRoute><AdvancedFiltersReports /></ProtectedRoute>} />
                  <Route path="/tesouraria/plano-contas-csv" element={<ProtectedRoute><ChartAccountsCsv /></ProtectedRoute>} />
                  <Route path="/tesouraria/heatmap-metas" element={<ProtectedRoute><HeatmapTargets /></ProtectedRoute>} />
                  <Route path="/tesouraria/metas-csv" element={<ProtectedRoute><TargetsCsv /></ProtectedRoute>} />
                  <Route path="/tesouraria/especificacao" element={<ProtectedRoute><AccountingSpecManager /></ProtectedRoute>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/ead/aluno/login" element={<StudentLogin />} />
                  <Route path="/ead/home" element={<StudentLogin />} />
                  <Route path="/admin/global" element={<ProtectedRoute><GlobalAdmin /></ProtectedRoute>} />
                  <Route path="/admin/igreja/:id" element={<ProtectedRoute><ChurchAdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/convencao/:id" element={<ProtectedRoute><ConventionAdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/faculdade/:id" element={<ProtectedRoute><CollegeAdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/igrejas/matriz" element={<ProtectedRoute><MatrizManage /></ProtectedRoute>} />
                  <Route path="/admin/igrejas/sedes" element={<ProtectedRoute><SedeManage /></ProtectedRoute>} />
                  <Route path="/admin/igrejas/subsedes" element={<ProtectedRoute><SubsedeManage /></ProtectedRoute>} />
                  <Route path="/admin/igrejas/congregacoes" element={<ProtectedRoute><CongregationManage /></ProtectedRoute>} />
                  <Route path="/admin/convencoes/nacionais" element={<ProtectedRoute><NationalManage /></ProtectedRoute>} />
                  <Route path="/admin/convencoes/estaduais" element={<ProtectedRoute><StateManage /></ProtectedRoute>} />
                  <Route path="/admin/convencoes/coordenadorias" element={<ProtectedRoute><CoordinationManage /></ProtectedRoute>} />
                  <Route path="/admin/faculdades/matriz" element={<ProtectedRoute><CollegeMatrizManage /></ProtectedRoute>} />
                  <Route path="/admin/faculdades/polos" element={<ProtectedRoute><PoloManage /></ProtectedRoute>} />
                  <Route path="/admin/faculdades/nucleos" element={<ProtectedRoute><NucleoManage /></ProtectedRoute>} />
                  <Route path="/tesouraria/relatorio-multinivel" element={<ProtectedRoute><MultiLevelReports /></ProtectedRoute>} />

                  {/* EAD SISCOF */}
                  <Route path="/ead" element={<ProtectedRoute><FAITELDashboard /></ProtectedRoute>} />
                  <Route path="/ead/bacharelado-teologia" element={<BachareladoTeologia />} />
                  <Route path="/ead/admin/cursos" element={<ProtectedRoute><CoursesManage /></ProtectedRoute>} />
                  <Route path="/ead/admin/modulos" element={<ProtectedRoute><ModulesManage /></ProtectedRoute>} />
                  <Route path="/ead/admin/banco-questoes" element={<ProtectedRoute><QuestionsBank /></ProtectedRoute>} />
                  <Route path="/ead/admin/provas" element={<ProtectedRoute><ExamsManage /></ProtectedRoute>} />
                  <Route path="/ead/polo/matriculas" element={<ProtectedRoute><Enrollments /></ProtectedRoute>} />
                  <Route path="/ead/polo/montar-prova" element={<ProtectedRoute><ExamBuilder /></ProtectedRoute>} />
                  <Route path="/ead/professor/conteudos" element={<ProtectedRoute><ContentManage /></ProtectedRoute>} />
                  <Route path="/ead/aluno" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
                  <Route path="/ead/aluno/dashboard" element={<ProtectedRoute><StudentDashboardNew /></ProtectedRoute>} />
                  <Route path="/ead/aluno/curso/:courseId" element={<ProtectedRoute><StudentCourseView /></ProtectedRoute>} />
                  <Route path="/ead/aluno/aula/:lessonId" element={<ProtectedRoute><LessonPlayer /></ProtectedRoute>} />
                  <Route path="/ead/admin/alunos" element={<ProtectedRoute><StudentManager /></ProtectedRoute>} />
                  <Route path="/ead/admin/cadastrar-faculdade" element={<ProtectedRoute><CadastrarFaculdade /></ProtectedRoute>} />
                  <Route path="/ead/admin/faculdades" element={<ProtectedRoute><FaculdadesManager /></ProtectedRoute>} />
                  <Route path="/ead/admin/cadastrar-polo" element={<ProtectedRoute><CadastrarPolo /></ProtectedRoute>} />
                  <Route path="/ead/admin/polos" element={<ProtectedRoute><PolosManager /></ProtectedRoute>} />
                  <Route path="/ead/admin/cadastrar-professor" element={<ProtectedRoute><CadastrarProfessor /></ProtectedRoute>} />
                  <Route path="/ead/admin/professores" element={<ProtectedRoute><ProfessoresManager /></ProtectedRoute>} />
                  <Route path="/ead/professor/dashboard" element={<ProtectedRoute><ProfessorDashboard /></ProtectedRoute>} />
                  <Route path="/ead/faitel" element={<FaitelLandingPage />} />
                  <Route path="/ead/home" element={<FaitelLandingPage />} />
                  <Route path="/ead/aluno/exam/:moduleId" element={<ProtectedRoute><ExamRunner /></ProtectedRoute>} />
                  <Route path="/ead/aluno/player/:moduleId" element={<ProtectedRoute><VideoPlayer /></ProtectedRoute>} />
                  <Route path="/ead/relatorios/academicos" element={<ProtectedRoute><AcademicReports /></ProtectedRoute>} />
                  <Route path="/ead/admin/financeiro" element={<ProtectedRoute><FinancePanel /></ProtectedRoute>} />
                  <Route path="/ead/admin/licencas" element={<ProtectedRoute><Licensing /></ProtectedRoute>} />
                  <Route path="/ead/admin/configuracoes" element={<ProtectedRoute><SettingsManage /></ProtectedRoute>} />
                  <Route path="/ead/admin/mensagem-boas-vindas" element={<ProtectedRoute><WelcomeEmailEditor /></ProtectedRoute>} />
                  <Route path="/ead/admin/onboarding-conteudo" element={<ProtectedRoute><ContentOnboarding /></ProtectedRoute>} />
                  <Route path="/ead/admin/seed-demo" element={<ProtectedRoute><SeedDemo /></ProtectedRoute>} />

                  {/* SISCOF 3.0 - Dual RBAC & EAD Module */}
                  <Route path="/gerenciar-perfis-globais" element={<ProtectedRoute><GerenciarPerfisGlobais /></ProtectedRoute>} />
                  <Route path="/atribuir-permissoes" element={<ProtectedRoute><AtribuirPermissoes /></ProtectedRoute>} />
                  <Route path="/radio" element={<ProtectedRoute><RadioSISCOF /></ProtectedRoute>} />


                  <Route path="*" element={<NotFound />} />
                </Routes>
                {/* AI Assistant - Available globally when logged in */}
                <SiscofAssistant />
              </div>
              <Toaster />
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
