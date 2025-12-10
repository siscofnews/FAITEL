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
import Login from "./pages/Login";
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

import LandingEscalas from "./pages/public/LandingEscalas";
import CadastroMembroPublico from "./pages/public/CadastroMembroPublico";
import CreateSchedulePage from "./pages/worship/CreateSchedulePage";
import AuditLogsPage from "./pages/admin/AuditLogsPage";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { VisitorBanner } from "@/components/layout/VisitorBanner";
import PublicSchedulePage from "@/pages/public/PublicSchedulePage";
import { RadioPlayer } from "@/components/layout/RadioPlayer";

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

              <div className="pt-32 min-h-screen flex flex-col">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Portal />} />
                  <Route path="/escalas-publicas" element={<PublicSchedulePage />} />
                  <Route path="/sistema-escalas" element={<LandingEscalas />} />
                  <Route path="/cadastro-membro/:matrizId" element={<CadastroMembroPublico />} />
                  <Route path="/login" element={<Login />} />
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

                  <Route path="*" element={<NotFound />} />
                </Routes>
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
