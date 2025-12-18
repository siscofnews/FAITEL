import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  Search,
  Menu,
  X,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Heart,
  Share2,
  Eye,
  MessageCircle,
  TrendingUp,
  Bookmark,
  Bell,
  ArrowRight,
  Users,
  Church,
  Mic,
  BookOpen,
  Globe,
  ChevronDown
} from "lucide-react";
import { VisitorCounter } from "@/components/portal/VisitorCounter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DirectorWord } from "@/components/portal/DirectorWord";
import { NewsSection } from "@/components/portal/NewsSection";
import { ExternalNewsSection } from "@/components/portal/ExternalNewsSection";
import { SocialMediaSection } from "@/components/portal/SocialMediaSection";
import { SalesBanner } from "@/components/portal/SalesBanner";
import CFIDHBanner from "@/components/portal/CFIDHBanner";
import { PartnersSection } from "@/components/portal/PartnersSection";
import { CEMADEBFeaturedArticle } from "@/components/portal/CEMADEBFeaturedArticle";
import { RadioBanner } from "@/components/portal/RadioBanner";
import { FutureTempleBanner } from "@/components/portal/FutureTempleBanner";
import { BooksSection } from "@/components/portal/BooksSection";
import { CourseBooksSection } from "@/components/ead/CourseBooksSection";
import { LanguageSelector } from "@/components/LanguageSelector";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEvangelicalNews } from "@/hooks/useEvangelicalNews";
import { TranslatedText } from "@/components/TranslatedText";
import { GospelEventsSection } from "@/components/portal/GospelEventsSection";
import logoSiscof from "@/assets/logo-siscof.png";
import santaCeiaIadma from "@/assets/eventos/santa-ceia-iadma.jpg";
import pauloLucasMemorial from "@/assets/eventos/paulo-lucas-memorial.jpg";
import { loadAgendaPublica } from "@/wiring/agenda";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const featuredNews = {
  id: 1,
  title: "Grande Conferência Nacional de Adoração reúne mais de 50 mil pessoas em São Paulo",
  excerpt: "O evento contou com a participação de renomados líderes de louvor e ministérios de todo o Brasil, marcando um momento histórico para a igreja evangélica brasileira.",
  image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=600&fit=crop",
  category: "Eventos",
  author: "Redação SISCOF",
  date: "05 Dez 2025",
  readTime: "5 min",
  views: 12453,
  comments: 234
};

const mainNews = [
  {
    id: 2,
    title: "Pastor Silas Malafaia anuncia nova cruzada evangelística para 2026",
    excerpt: "O evento promete reunir milhares de fiéis em diversas capitais do país durante o primeiro semestre.",
    image: "https://images.unsplash.com/photo-1478147427282-58a87a120781?w=600&h=400&fit=crop",
    category: "Evangelismo",
    date: "05 Dez 2025",
    views: 8932
  },
  {
    id: 3,
    title: "Congresso de Jovens bate recorde de inscrições em todo o Brasil",
    excerpt: "Mais de 100 mil jovens já confirmaram presença no maior encontro de juventude cristã do país.",
    image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&h=400&fit=crop",
    category: "Juventude",
    date: "04 Dez 2025",
    views: 7621
  },
  {
    id: 4,
    title: "Cantora gospel lança álbum inédito com participações especiais",
    excerpt: "O novo trabalho traz colaborações com grandes nomes da música cristã internacional.",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
    category: "Música",
    date: "04 Dez 2025",
    views: 5432
  }
];

const sideNews = [
  {
    id: 5,
    title: "Igreja Batista inaugura novo templo com capacidade para 5 mil pessoas",
    category: "Igrejas",
    date: "04 Dez 2025",
    image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=200&h=150&fit=crop"
  },
  {
    id: 6,
    title: "Seminário sobre família cristã acontece neste final de semana",
    category: "Família",
    date: "03 Dez 2025",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=200&h=150&fit=crop"
  },
  {
    id: 7,
    title: "Missionários brasileiros expandem trabalho na África",
    category: "Missões",
    date: "03 Dez 2025",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=200&h=150&fit=crop"
  },
  {
    id: 8,
    title: "Nova tradução da Bíblia é lançada com linguagem contemporânea",
    category: "Bíblia",
    date: "02 Dez 2025",
    image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=200&h=150&fit=crop"
  }
];

const upcomingEvents = [
  {
    id: 1,
    title: "Culto de Celebração - Igreja Matriz",
    date: "08 Dez 2025",
    time: "19:00",
    location: "São Paulo, SP",
    church: "Igreja Batista Central",
    type: "Culto",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop"
  },
  {
    id: 2,
    title: "Conferência de Líderes 2025",
    date: "15 Dez 2025",
    time: "09:00",
    location: "Rio de Janeiro, RJ",
    church: "Comunidade Cristã",
    type: "Conferência",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop"
  },
  {
    id: 3,
    title: "Retiro Espiritual de Jovens",
    date: "20 Dez 2025",
    time: "08:00",
    location: "Campos do Jordão, SP",
    church: "Igreja Presbiteriana",
    type: "Retiro",
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300&fit=crop"
  },
  {
    id: 4,
    title: "Cantata de Natal",
    date: "24 Dez 2025",
    time: "20:00",
    location: "Belo Horizonte, MG",
    church: "Assembleia de Deus",
    type: "Musical",
    image: "https://images.unsplash.com/photo-1512389142860-9c449e58a814?w=400&h=300&fit=crop"
  }
];

const categories = [
  { name: "Notícias", icon: TrendingUp, count: 156 },
  { name: "Eventos", icon: Calendar, count: 89 },
  { name: "Igrejas", icon: Church, count: 234 },
  { name: "Música Gospel", icon: Mic, count: 67 },
  { name: "Estudos Bíblicos", icon: BookOpen, count: 45 },
  { name: "Comunidade", icon: Users, count: 123 }
];

const trendingTopics = [
  "#ConferênciaNacional2025",
  "#AvivamentoJá",
  "#IgrejasUnidas",
  "#MúsicaGospel",
  "#JuventudeComFé"
];

export default function Portal() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { news, isLoading: newsLoading } = useEvangelicalNews();
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setEventsLoading(true);
      try {
        const data = await loadAgendaPublica();
        const today = new Date();
        const upcoming = (data || [])
          .filter((ev: any) => {
            try { return parseISO(ev.data_inicio) >= today; } catch { return false; }
          })
          .sort((a: any, b: any) => parseISO(a.data_inicio).getTime() - parseISO(b.data_inicio).getTime())
          .slice(0, 3);
        setFeaturedEvents(upcoming);
      } finally {
        setEventsLoading(false);
      }
    };
    run();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Buscando por: ${searchQuery}`);
    }
  };

  const handleShare = (title: string) => {
    if (navigator.share) {
      navigator.share({
        title: title,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado para a área de transferência!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="bg-navy text-white py-2">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="hidden md:inline">📅 {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <LanguageSelector />
            <Link to="/login"><Button variant="gold" size="sm">Login Sistema</Button></Link>
            <Link to="/login?target=faculdade"><Button variant="gold" size="sm">Login Faculdade</Button></Link>
            <Link to="/login?target=convencao"><Button variant="gold" size="sm">Login Convenção</Button></Link>
            <Link to="/login?target=super"><Button variant="gold" size="sm">Super Admin</Button></Link>
            <Link to="/ead/aluno/login"><Button variant="gold" size="sm">Área do Aluno</Button></Link>
            <Link to="/admin/faculdades/matriz?demo=1"><Button variant="gold" size="sm">Visitar Faculdade</Button></Link>
            <Link to="/admin/convencoes/estaduais?demo=1"><Button variant="gold" size="sm">Visitar Convenção</Button></Link>
            <Link to="/cadastrar-igreja"><Button variant="gold" size="sm">Cadastre sua Igreja</Button></Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <img
                src={logoSiscof}
                alt="SISCOF"
                className="w-12 h-12 md:w-14 md:h-14 object-contain"
              />
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-2xl font-bold">
                  <span className="text-gold">SISCOF</span>
                  <span className="text-navy">News</span>
                </h1>
                <p className="text-[10px] md:text-xs text-muted-foreground -mt-1"><TranslatedText>Portal Evangélico</TranslatedText></p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2 flex-1 justify-center min-w-0 overflow-x-auto whitespace-nowrap">
              {[
                { name: "Início", href: "/" },
                { name: "Notícias", href: "#noticias" },
                { name: "Eventos", href: "/eventos" },
                { name: "Agenda Pública", href: "/agenda-publica" },
                { name: "Agenda CEMADEB", href: "/agenda-publica-cemadeb" },
                { name: "Galeria AGOs", href: "/galeria-agos" },
                { name: "Escalas", href: "/consulta-escalas" },
                { name: "Parceiros", href: "/parceiros" },
                { name: "Sistema", href: "/dashboard" }
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="px-4 py-2 text-sm font-medium text-foreground hover:text-gold hover:bg-muted rounded-lg transition-all"
                >
                  <TranslatedText>{item.name}</TranslatedText>
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Search */}
              <div className={`${searchOpen ? 'flex' : 'hidden'} md:flex items-center`}>
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder="Buscar notícias..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-40 md:w-64 pl-10 h-9 rounded-full border-muted"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </form>
              </div>
              <button
                className="md:hidden p-2 hover:bg-muted rounded-lg"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Language Indicator - Visible in Main Header */}
              <LanguageSelector variant="header" className="hidden md:flex" />

              {/* Social Icons */}
              <div className="hidden md:flex items-center gap-1">
                <Link to="/redes-sociais" className="p-2 hover:bg-blue-100 hover:text-blue-600 rounded-full transition-all">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link to="/redes-sociais" className="p-2 hover:bg-pink-100 hover:text-pink-600 rounded-full transition-all">
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link to="/redes-sociais" className="p-2 hover:bg-red-100 hover:text-red-600 rounded-full transition-all">
                  <Youtube className="h-5 w-5" />
                </Link>
              </div>

              {/* Notification Bell */}
              <button className="relative p-2 hover:bg-muted rounded-lg">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="gold" size="sm" className="hidden sm:flex">
                    <TranslatedText>Acessar</TranslatedText>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild><Link to="/login">Login Sistema</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/login?target=faculdade">Login Faculdade</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/login?target=convencao">Login Convenção</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/admin/faculdades/matriz?demo=1">Visitar Faculdade</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/admin/convencoes/estaduais?demo=1">Visitar Convenção</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/cadastrar-igreja">Cadastre sua Igreja</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-border py-4 animate-fade-in">
            <nav className="container mx-auto px-4 flex flex-col gap-2">
              {[
                { name: "Início", href: "/" },
                { name: "Notícias", href: "#noticias" },
                { name: "Eventos", href: "/eventos" },
                { name: "Agenda Pública", href: "/agenda-publica" },
                { name: "Escalas", href: "/consulta-escalas" },
                { name: "Parceiros", href: "/parceiros" },
                { name: "Agenda CEMADEB", href: "/agenda-publica-cemadeb" },
                { name: "Sistema", href: "/dashboard" }
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="px-4 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <TranslatedText>{item.name}</TranslatedText>
                </Link>
              ))}
              <hr className="my-2" />
              <div className="flex items-center gap-3 px-4">
                <Link to="/redes-sociais" className="p-2 bg-blue-100 text-blue-600 rounded-full">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link to="/redes-sociais" className="p-2 bg-pink-100 text-pink-600 rounded-full">
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link to="/redes-sociais" className="p-2 bg-red-100 text-red-600 rounded-full">
                  <Youtube className="h-5 w-5" />
                </Link>
                <Link to="/redes-sociais" className="p-2 bg-sky-100 text-sky-600 rounded-full">
                  <Twitter className="h-5 w-5" />
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Quick Access Badges */}
      <section className="bg-white border-b border-border py-3">
        <div className="container mx-auto px-4 flex flex-wrap items-center gap-2 justify-center">
          <Link to="/agenda-publica">
            <Badge className="bg-gold text-navy px-3 py-1 hover:bg-gold/90 transition-colors cursor-pointer">
              Agenda Pública
            </Badge>
          </Link>
          <Link to="/agenda-publica-cemadeb">
            <Badge className="bg-purple-600 text-white px-3 py-1 hover:bg-purple-700 transition-colors cursor-pointer">
              CEMADEB – Agenda
            </Badge>
          </Link>
        </div>
      </section>

      {/* Breaking News Ticker */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white py-2 overflow-hidden">
        <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
          <span className="bg-white text-red-600 px-3 py-1 rounded text-xs font-bold"><TranslatedText>URGENTE</TranslatedText></span>
          <span><TranslatedText>CEMADEB celebra posse histórica do Pastor Etienne Claude na 30ª AGO</TranslatedText></span>
          <span className="text-red-200">•</span>
          <span><TranslatedText>FAITEL expande para Europa com direção do Pastor Etienne Claude</TranslatedText></span>
          <span className="text-red-200">•</span>
          <span><TranslatedText>CEMADEB presente em 7 países e 16 estados do Brasil com mais de 1.010 ministros</TranslatedText></span>
          <span className="text-red-200">•</span>
          <span><TranslatedText>IADMA celebra 26 anos de trabalho missionário</TranslatedText></span>
        </div>
      </div>

      {/* Sales Banner */}
      <SalesBanner />

      {/* CFIDH Banner */}
      <CFIDHBanner />

      {/* Radio Banner */}
      <RadioBanner />

      {/* Future Temple Banner */}
      <FutureTempleBanner />

      {/* Memorial Banner - Evangelista Paulo Lucas */}
      <section className="py-12 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t-4 border-b-4 border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="lg:w-1/3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl"></div>
                <img
                  src={pauloLucasMemorial}
                  alt="Evangelista Paulo Lucas"
                  className="rounded-2xl shadow-2xl w-full max-w-sm mx-auto border-4 border-white/20"
                />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <Badge className="bg-white text-gray-900 mb-2">Em Memória</Badge>
                  <p className="text-white font-bold text-lg">Evangelista Paulo Lucas</p>
                </div>
              </div>
            </div>
            <div className="lg:w-2/3 text-white">
              <div className="text-center lg:text-left mb-6">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                  <span className="text-3xl">🕊</span>
                  <h2 className="text-2xl md:text-3xl font-bold">
                    Mensagem de Fé e Luto da CEMADEB
                  </h2>
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-gold mb-4">
                  Profundo Pesar e Eterna Gratidão
                </h3>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-4 text-white/90 max-h-[500px] overflow-y-auto">
                <p className="leading-relaxed">
                  A CEMADEB - Convenção Evangélica de Ministros das Igrejas Assembleias de Deus do Exterior e do Brasil se une em um só espírito de dor e esperança para expressar o seu profundo e irremediável pesar pelo passamento do amado <strong className="text-white">Evangelista Paulo Lucas</strong>.
                </p>

                <p className="leading-relaxed">
                  Neste momento em que a tristeza pesa sobre os corações, a Convenção estende o seu mais sincero e fraterno abraço à <strong className="text-white">Família Enlutada</strong>, em especial aos seus pais, <strong className="text-white">Pastor Adevalcir Alves</strong> e <strong className="text-white">Pastora Eunice Alves</strong>, e à sua esposa, que carrega em seu ventre a promessa de uma nova vida. Saibam que as lágrimas da CEMADEB se misturam às vossas, e nossas orações ininterruptas se elevam ao Trono da Graça em favor do vosso consolo.
                </p>

                <p className="leading-relaxed">
                  O Evangelista Paulo Lucas era membro da <strong className="text-white">Igreja AEPD em São João da Boa Vista, São Paulo</strong>, e filho do nosso prezado Pastor Adevalcir Alves. Ele não foi apenas um filiado; foi um irmão valoroso cujo ministério e dedicação deixam marcas indeléveis na obra de Deus. Sua partida prematura nos recorda da fragilidade da vida terrena, mas a firmeza de sua fé nos garante que ele não sucumbiu à morte, mas foi promovido à glória.
                </p>

                <p className="leading-relaxed">
                  Seu legado, pautado na fidelidade ao Reino, permanece como um testemunho vivo de um servo que completou sua carreira com honra.
                </p>

                <p className="leading-relaxed">
                  Em nome da Diretoria e de todos os Ministros da CEMADEB, manifestamos a nossa dor por esta perda de inestimável valor. Que o Consolador Prometido, o Espírito Santo, possa preencher o vazio deixado pela ausência e trazer à vossa memória cada momento de alegria e comunhão.
                </p>

                <div className="bg-gold/20 border-l-4 border-gold p-4 my-4">
                  <p className="text-white italic font-semibold text-center">
                    "Combati o bom combate, acabei a carreira, guardei a fé."
                  </p>
                  <p className="text-white/70 text-sm text-center mt-2">2 Timóteo 4:7</p>
                </div>

                <p className="leading-relaxed">
                  Mais um dos nossos soldados tombou aqui nesta terra, porém, temos a certeza e tranquilidade que ele voltou para sua verdadeira Casa.
                </p>

                <div className="mt-6 pt-6 border-t border-white/30">
                  <p className="font-semibold text-white">Valdinei C. Santos</p>
                  <p className="text-white/70 text-sm">Presidente da CEMADEB</p>
                  <p className="text-white/60 text-xs mt-2">AGUAÍ, 10 de Dezembro de 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Santa Ceia IADMA Banner - Aguaí SP */}
      <section className="py-8 bg-gradient-to-r from-sky-900 via-sky-800 to-sky-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="lg:w-1/2">
              <img
                src={santaCeiaIadma}
                alt="Santa Ceia IADMA - Domingo às 19h"
                className="rounded-2xl shadow-2xl w-full max-w-lg mx-auto hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="lg:w-1/2 text-white text-center lg:text-left">
              <Badge className="bg-gold text-navy mb-4 text-sm">Igreja de Aguaí - SP</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Santa Ceia do Senhor
              </h2>
              <p className="text-xl text-white/90 mb-4">
                Você está convidado a participar da nossa Santa Ceia neste domingo!
              </p>
              <div className="space-y-3 text-white/80 mb-6">
                <p className="flex items-center justify-center lg:justify-start gap-2">
                  <Calendar className="h-5 w-5 text-gold" />
                  <span className="font-semibold">Domingo, 07 de Dezembro às 19h</span>
                </p>
                <p className="flex items-center justify-center lg:justify-start gap-2">
                  <MapPin className="h-5 w-5 text-gold" />
                  <span>Templo Central IADMA - Rua José Antônio Rodrigues Led, 306</span>
                </p>
                <p className="flex items-center justify-center lg:justify-start gap-2">
                  <Church className="h-5 w-5 text-gold" />
                  <span>Bairro Siriri - Aguaí/SP (próximo à borracharia sentido APAI)</span>
                </p>
                <p className="flex items-center justify-center lg:justify-start gap-2">
                  <Users className="h-5 w-5 text-gold" />
                  <span>Pr. Valdinei C. Santos e Pra. Thelma Santos</span>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/eventos-iadma">
                  <Button size="lg" className="bg-gold text-navy hover:bg-gold/90 font-bold">
                    <Calendar className="h-5 w-5 mr-2" />
                    Ver Todos os Eventos
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => window.open("https://www.google.com/maps/search/?api=1&query=Rua+José+Antônio+Rodrigues+Led+306+Siriri+Aguaí+SP", "_blank")}
                >
                  <MapPin className="h-5 w-5 mr-2" />
                  Ver no Mapa
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Featured News */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden group cursor-pointer border-0 shadow-xl">
                <div className="relative">
                  <img
                    src={featuredNews.image}
                    alt={featuredNews.title}
                    className="w-full h-[300px] md:h-[450px] object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                  {/* Play Button for Video */}
                  <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 bg-gold/90 rounded-full flex items-center justify-center hover:bg-gold hover:scale-110 transition-all shadow-2xl">
                    <Play className="h-8 w-8 md:h-10 md:w-10 text-navy ml-1" />
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <Badge className="bg-gold text-navy mb-3"><TranslatedText>{featuredNews.category}</TranslatedText></Badge>
                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight group-hover:text-gold transition-colors">
                      {featuredNews.title}
                    </h2>
                    <p className="text-white/80 text-sm md:text-base mb-4 line-clamp-2">
                      {featuredNews.excerpt}
                    </p>
                    <div className="flex gap-2 mb-3">
                      <Link to="/agenda-publica">
                        <Badge className="bg-gold text-navy px-3 py-1 hover:bg-gold/90 transition-colors">Agenda Pública</Badge>
                      </Link>
                      <Link to="/agenda-publica-cemadeb">
                        <Badge className="bg-purple-600 text-white px-3 py-1 hover:bg-purple-700 transition-colors">CEMADEB – Agenda</Badge>
                      </Link>
                    </div>
                    <div className="flex items-center gap-4 text-white/70 text-sm">
                      <span>{featuredNews.author}</span>
                      <span>•</span>
                      <span>{featuredNews.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" /> {featuredNews.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" /> {featuredNews.comments}
                      </span>
                    </div>
                  </div>

                  {/* Share/Save Actions */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => handleShare(featuredNews.title)}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-colors"
                    >
                      <Share2 className="h-5 w-5 text-white" />
                    </button>
                    <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-colors">
                      <Bookmark className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Side News */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gold" />
                  <TranslatedText>Mais Lidas</TranslatedText>
                </h3>
                <button className="text-sm text-gold hover:underline flex items-center gap-1">
                  <TranslatedText>Ver todas</TranslatedText> <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              {sideNews.map((news, index) => (
                <Card key={news.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-0">
                    <div className="flex gap-3">
                      <div className="relative w-24 h-20 flex-shrink-0">
                        <img
                          src={news.image}
                          alt={news.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <span className="absolute top-1 left-1 bg-navy text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                      </div>
                      <div className="py-2 pr-3 flex flex-col justify-center">
                        <Badge variant="outline" className="w-fit mb-1 text-[10px]">{news.category}</Badge>
                        <h4 className="text-sm font-medium line-clamp-2 group-hover:text-gold transition-colors">
                          {news.title}
                        </h4>
                        <span className="text-xs text-muted-foreground mt-1">{news.date}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Events Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="w-1 h-8 bg-purple-600 rounded-full"></span>
              Eventos em Destaque
            </h2>
            <Link to="/agenda-publica" className="text-purple-600 hover:underline flex items-center gap-1 font-medium">
              Ver todos
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {eventsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <Card key={i} className="h-40"><CardContent className="h-full animate-pulse" /></Card>
              ))}
            </div>
          ) : featuredEvents.length === 0 ? (
            <Card><CardContent className="p-6">Nenhum evento futuro publicado.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredEvents.map(ev => (
                <Card key={ev.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {format(parseISO(ev.data_inicio), "dd/MM/yyyy", { locale: ptBR })}
                      </Badge>
                      {ev.cor && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ev.cor }} />}
                    </div>
                    <h3 className="text-lg font-bold mb-1">{ev.nome_evento || ev.titulo}</h3>
                    {ev.local && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {ev.local}</p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <Link to="/agenda-publica">
                        <Button variant="outline" size="sm">Detalhes</Button>
                      </Link>
                      {ev.is_cemadeb && (
                        <Badge className="bg-purple-600 text-white">CEMADEB</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* System Promotion Video Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=600&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
            <div className="p-8 md:p-12 relative z-10">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="lg:w-1/2 text-white text-center lg:text-left">
                  <Badge className="bg-yellow-400 text-slate-900 mb-6 px-4 py-1 text-sm font-bold border-none hover:bg-yellow-500 transition-colors">
                    🚀 Nova Gestão Ministerial
                  </Badge>
                  <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                    Transforme a Gestão da Sua Igreja Hoje
                  </h2>
                  <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                    Assista ao vídeo e descubra como o SISCOF News automatiza escalas,
                    organiza membros e simplifica a vida ministerial.
                    <span className="text-yellow-400 font-semibold block mt-2">Mais de 500 igrejas já aprovaram!</span>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Link to="/sistema-escalas">
                      <Button size="lg" className="bg-yellow-400 text-slate-900 hover:bg-yellow-500 font-bold w-full sm:w-auto h-14 text-lg shadow-lg hover:shadow-yellow-400/20 transition-all">
                        <TrendingUp className="mr-2 h-5 w-5" />
                        Ver Vídeo e Planos
                      </Button>
                    </Link>
                    <Link to="/cadastrar-igreja">
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto h-14 text-lg">
                        Testar Grátis Agora
                      </Button>
                    </Link>
                    <Link to="/agenda-publica">
                      <Button size="lg" variant="outline" className="border-gold text-gold hover:bg-gold/10 w-full sm:w-auto h-14 text-lg">
                        Agenda Pública
                      </Button>
                    </Link>
                    <Link to="/agenda-publica-cemadeb">
                      <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 w-full sm:w-auto h-14 text-lg">
                        CEMADEB
                      </Button>
                    </Link>
                  </div>
                  <p className="mt-4 text-xs text-slate-400 uppercase tracking-wider">
                    Sem cartão de crédito • Cancelamento a qualquer momento
                  </p>
                </div>

                <div className="lg:w-1/2 w-full">
                  <Link to="/sistema-escalas">
                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border-4 border-slate-700/50 bg-slate-900 group cursor-pointer transform transition-transform hover:-translate-y-1">
                      {/* Video Thumbnail Placeholder */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/80 to-transparent z-10"></div>
                      <img
                        src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80"
                        alt="Vídeo de Demonstração"
                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                      />

                      <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.4)] group-hover:scale-110 transition-transform duration-300 group-hover:bg-yellow-300">
                          <Play className="h-8 w-8 text-slate-900 ml-1 fill-current" />
                        </div>
                      </div>

                      <div className="absolute bottom-6 left-6 right-6 z-20">
                        <div className="bg-slate-900/80 backdrop-blur px-4 py-3 rounded-lg border border-slate-700">
                          <p className="text-white font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            Demonstração do Sistema
                            <span className="text-slate-400 text-sm font-normal ml-auto">2:15 min</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* Main News Grid */}
        <section id="noticias" className="mb-12 scroll-mt-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="w-1 h-8 bg-gold rounded-full"></span>
              <TranslatedText>Últimas Notícias</TranslatedText>
            </h2>
            <button className="text-gold hover:underline flex items-center gap-1 font-medium">
              <TranslatedText>Ver todas</TranslatedText> <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainNews.map((news) => (
              <Card key={news.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-md">
                <div className="relative overflow-hidden">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <Badge className="absolute top-3 left-3 bg-gold text-navy"><TranslatedText>{news.category}</TranslatedText></Badge>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-gold transition-colors">
                    {news.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {news.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{news.date}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {news.views.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Palavra do Diretor - AI Generated */}
        <section className="mb-12">
          <DirectorWord />
        </section>

        {/* Notícias Evangélicas Mundiais */}
        {news && (
          <>
            <NewsSection
              title="Notícias Evangélicas Mundiais"
              icon="globe"
              news={news.mundial}
              isLoading={newsLoading}
            />

            {/* CEMADEB Featured Article */}
            <CEMADEBFeaturedArticle />

            <NewsSection
              title="CEMADEB - Convenção"
              icon="church"
              news={news.cemadeb}
              isLoading={newsLoading}
            />

            <NewsSection
              title="Igrejas de Aguaí - SP"
              icon="map"
              news={news.aguai}
              isLoading={newsLoading}
            />

            <NewsSection
              title="Secretaria de Missões"
              icon="users"
              news={news.secretariaMissoes}
              isLoading={newsLoading}
            />
          </>
        )}

        {/* External News - JM Notícia & Fuxico Gospel */}
        <ExternalNewsSection />

        {/* Gospel Events - Auto-updated every 6 hours */}
        <GospelEventsSection />

        {/* Social Media Section */}
        <SocialMediaSection />

        {/* Events Section */}
        <section id="eventos" className="mb-12 scroll-mt-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="w-1 h-8 bg-gold rounded-full"></span>
              <TranslatedText>Próximos Eventos das Igrejas</TranslatedText>
            </h2>
            <button className="text-gold hover:underline flex items-center gap-1 font-medium">
              <TranslatedText>Ver agenda completa</TranslatedText> <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-md">
                <div className="relative overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white rounded-lg p-2 text-center shadow-lg">
                    <span className="block text-2xl font-bold text-navy">{event.date.split(' ')[0]}</span>
                    <span className="block text-xs text-muted-foreground uppercase">{event.date.split(' ')[1]}</span>
                  </div>
                  <Badge className="absolute top-3 right-3 bg-navy/90 text-white"><TranslatedText>{event.type}</TranslatedText></Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-2 line-clamp-2 group-hover:text-gold transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gold font-medium mb-2">{event.church}</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Categories & Newsletter */}
        <section className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Categories */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-gold rounded-full"></span>
              <TranslatedText>Categorias</TranslatedText>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <Card key={cat.name} className="hover:shadow-lg transition-all cursor-pointer group hover:border-gold">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-gold/10 rounded-xl group-hover:bg-gold/20 transition-colors">
                      <cat.icon className="h-6 w-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-gold transition-colors"><TranslatedText>{cat.name}</TranslatedText></h3>
                      <p className="text-sm text-muted-foreground">{cat.count} <TranslatedText>artigos</TranslatedText></p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <Card className="bg-gradient-to-br from-navy to-navy-light text-white overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">📬 Newsletter</h3>
                  <p className="text-white/70 text-sm mb-4">
                    <TranslatedText>Receba as últimas notícias e eventos do mundo evangélico diretamente no seu e-mail.</TranslatedText>
                  </p>
                  <form onSubmit={(e) => { e.preventDefault(); alert('Inscrito com sucesso!'); }} className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Seu melhor e-mail"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      required
                    />
                    <Button type="submit" variant="gold" className="w-full">
                      <TranslatedText>Inscrever-se</TranslatedText>
                    </Button>
                  </form>
                  <p className="text-xs text-white/50 mt-3">
                    <TranslatedText>Ao se inscrever, você concorda com nossa política de privacidade.</TranslatedText>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gold" />
                  <TranslatedText>Trending Topics</TranslatedText>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendingTopics.map((topic) => (
                    <Badge
                      key={topic}
                      variant="outline"
                      className="cursor-pointer hover:bg-gold hover:text-navy hover:border-gold transition-colors"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="mb-12">
          <Card className="overflow-hidden border-0 shadow-2xl">
            <div className="relative bg-gradient-to-r from-navy via-navy-light to-navy p-8 md:p-12">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200')] opacity-10 bg-cover bg-center" />
              <div className="relative z-10 max-w-3xl mx-auto text-center">
                <Badge className="bg-gold text-navy mb-4"><TranslatedText>Sistema SISCOF</TranslatedText></Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  <TranslatedText>Gerencie sua Igreja de forma Inteligente</TranslatedText>
                </h2>
                <p className="text-white/80 mb-6 text-lg">
                  <TranslatedText>Escalas, eventos, escola de culto, finanças e muito mais em uma única plataforma. Junte-se a mais de 500 igrejas que já transformaram sua gestão.</TranslatedText>
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/login">
                    <Button variant="gold" size="lg" className="w-full sm:w-auto">
                      <TranslatedText>Começar Gratuitamente</TranslatedText>
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-navy">
                      <TranslatedText>Conhecer Recursos</TranslatedText>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </main>

      {/* Books Section */}
      <BooksSection />

      {/* Course Theology Books */}
      <CourseBooksSection />

      {/* Partners Section */}
      <PartnersSection />

      {/* Footer */}
      <footer className="bg-navy text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center">
                  <Church className="h-6 w-6 text-navy" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">SISCOF<span className="text-gold">News</span></h3>
                </div>
              </div>
              <p className="text-white/70 text-sm mb-4">
                <TranslatedText>O maior portal de notícias e eventos do mundo evangélico brasileiro. Conectando igrejas e fortalecendo a fé.</TranslatedText>
              </p>
              <div className="flex gap-3">
                <Link to="/redes-sociais" className="p-2 bg-white/10 rounded-full hover:bg-gold hover:text-navy transition-all">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link to="/redes-sociais" className="p-2 bg-white/10 rounded-full hover:bg-gold hover:text-navy transition-all">
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link to="/redes-sociais" className="p-2 bg-white/10 rounded-full hover:bg-gold hover:text-navy transition-all">
                  <Youtube className="h-5 w-5" />
                </Link>
                <Link to="/redes-sociais" className="p-2 bg-white/10 rounded-full hover:bg-gold hover:text-navy transition-all">
                  <Twitter className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4"><TranslatedText>Links Rápidos</TranslatedText></h4>
              <ul className="space-y-2">
                {[
                  { name: "Notícias", href: "#noticias" },
                  { name: "Eventos", href: "/eventos" },
                  { name: "Parceiros", href: "/parceiros" },
                  { name: "Redes Sociais", href: "/redes-sociais" },
                  { name: "Login", href: "/login" }
                ].map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-white/70 hover:text-gold transition-colors text-sm flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      <TranslatedText>{link.name}</TranslatedText>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sistema */}
            <div>
              <h4 className="font-bold mb-4"><TranslatedText>Sistema SISCOF</TranslatedText></h4>
              <ul className="space-y-2">
                {[
                  { name: "Acessar Sistema", href: "/login" },
                  { name: "Cadastrar Igreja", href: "/login" },
                  { name: "Dashboard", href: "/dashboard" },
                  { name: "Igrejas", href: "/igrejas" },
                  { name: "Escola de Culto", href: "/escola" },
                  { name: "Escalas", href: "/escalas" }
                ].map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-white/70 hover:text-gold transition-colors text-sm flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      <TranslatedText>{link.name}</TranslatedText>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4"><TranslatedText>Contato</TranslatedText></h4>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-gold flex-shrink-0" />
                  <span>Rua Henrique Alves Santos Barbosa, nº 119, Bairro: Siriri, Aguaí-SP, CEP: 13.866-052</span>
                </li>
                <li className="flex items-start gap-2">
                  <MessageCircle className="h-4 w-4 mt-0.5 text-gold flex-shrink-0" />
                  <div className="flex flex-col">
                    <a href="mailto:siscofnews@gmail.com" className="hover:text-gold transition-colors">siscofnews@gmail.com</a>
                    <a href="mailto:pr.vcsantos@gmail.com" className="hover:text-gold transition-colors">pr.vcsantos@gmail.com</a>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-0.5 text-gold flex-shrink-0" />
                  <div className="flex flex-col text-xs">
                    <a href="https://wa.me/5571983384883" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">+55 71 98338-4883</a>
                    <a href="https://wa.me/5571996822782" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">+55 71 99682-2782</a>
                    <a href="https://wa.me/5575991018395" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">+55 75 9 9101-8395</a>
                    <a href="https://wa.me/5575997040153" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">+55 75 99704-0153</a>
                    <a href="https://wa.me/5575998436345" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">+55 75 99843-6345</a>
                  </div>
                </li>
              </ul>
              <div className="mt-4 p-4 bg-white/5 rounded-lg">
                <p className="text-xs text-white/50 mb-2"><TranslatedText>Baixe nosso App</TranslatedText></p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs border-white/20 text-white hover:bg-white hover:text-navy">
                    App Store
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs border-white/20 text-white hover:bg-white hover:text-navy">
                    Play Store
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/50">
              © 2025 SISCOF News. Todos os direitos reservados.
            </p>

            {/* Visitor Counter */}
            <div className="flex items-center gap-2 text-white/70 bg-white/5 px-4 py-2 rounded-lg">
              <Eye className="h-4 w-4 text-gold" />
              <span className="text-sm">Total de Visitantes:</span>
              <VisitorCounter pagePath="/" variant="compact" />
            </div>

            <div className="flex items-center gap-4 text-sm text-white/50">
              <Link to="#" className="hover:text-gold transition-colors">Termos de Uso</Link>
              <Link to="#" className="hover:text-gold transition-colors">Privacidade</Link>
              <Link to="#" className="hover:text-gold transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
