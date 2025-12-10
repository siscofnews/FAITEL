import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, Globe, BookOpen, Award, MapPin, Phone, Mail, CheckCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import logoSiscof from "@/assets/logo-siscof.png";
import logoFaitel from "@/assets/logo-faitel.png";
import logoCfidh from "@/assets/logo-cfidh.jpg";
import logoIadma from "@/assets/logo-iadma.jpg";
import logoCemadeb from "@/assets/logo-cemadeb.png";
import logoSetepos from "@/assets/logo-setepos.png";
import logoSecc from "@/assets/logo-secc.png";
import logoWst from "@/assets/logo-wst.jpg";
import logoIbma from "@/assets/logo-ibma.png";
import logoCec from "@/assets/logo-cec.png";

// SECC Magazines
import revistaSecc1 from "@/assets/revistas/revista-secc-1.png";
import revistaSecc2 from "@/assets/revistas/revista-secc-2.png";
import revistaSecc3 from "@/assets/revistas/revista-secc-3.png";
import revistaSecc4 from "@/assets/revistas/revista-secc-4.jpg";
import revistaSecc5 from "@/assets/revistas/revista-secc-5.png";

const seccMagazines = [
  { id: 1, image: revistaSecc1, title: "Revista EBD - Edição 1" },
  { id: 2, image: revistaSecc2, title: "Revista EBD - Edição 2" },
  { id: 3, image: revistaSecc3, title: "Revista Jovens e Adolescentes - 1º Trimestre 2026" },
  { id: 4, image: revistaSecc4, title: "Revista EBD - Edição 4" },
  { id: 5, image: revistaSecc5, title: "Revista EBD - Edição 5" },
];
const partnersData: Record<string, {
  name: string;
  logo: string;
  shortDescription: string;
  fullDescription: string;
  mission: string;
  vision: string;
  highlights: string[];
  services: string[];
  stats: Record<string, string>;
  contact: { email?: string; phone?: string; address?: string };
}> = {
  siscof: {
    name: "SISCOF",
    logo: logoSiscof,
    shortDescription: "Sistema de Gestão Eclesiástica",
    fullDescription: "O SISCOF é uma plataforma integrada de gestão eclesiástica que oferece ferramentas completas para administração de igrejas, escolas de culto online, escalas ministeriais e gestão de pessoas. Com tecnologia de ponta, o sistema atende desde pequenas congregações até grandes ministérios, proporcionando organização, eficiência e crescimento sustentável.",
    mission: "Proporcionar ferramentas tecnológicas que auxiliem no crescimento e organização das igrejas, facilitando a gestão administrativa e ministerial.",
    vision: "Ser a principal plataforma de gestão eclesiástica do Brasil e do mundo, conectando igrejas e fortalecendo o Reino de Deus.",
    highlights: ["Gestão de múltiplas igrejas", "Escola de Culto Online", "Sistema de Escalas", "Controle Financeiro", "Gestão de Membros", "Relatórios Detalhados"],
    services: ["Sistema de Gestão Completo", "Escola de Culto EAD", "Controle de Escalas", "Gestão Financeira", "App Mobile", "Suporte 24/7"],
    stats: { "Igrejas Cadastradas": "500+", "Usuários Ativos": "10.000+", "Países": "6", "Anos de Experiência": "5+" },
    contact: { email: "siscofnews@gmail.com", phone: "+55 71 98338-4883" }
  },
  faitel: {
    name: "FAITEL",
    logo: logoFaitel,
    shortDescription: "Faculdade Internacional Teológica de Líderes",
    fullDescription: "A FAITEL é uma instituição de ensino superior dedicada à formação teológica e ministerial de líderes cristãos. Com cursos reconhecidos e corpo docente qualificado, a faculdade prepara obreiros para o ministério com excelência acadêmica e espiritual, unindo conhecimento teórico e prática ministerial.",
    mission: "Formar líderes cristãos com excelência acadêmica e espiritual, preparando-os para o ministério e para transformar suas comunidades.",
    vision: "Ser referência em educação teológica na América Latina, formando líderes que impactem nações.",
    highlights: ["Cursos de Teologia", "Formação de Líderes", "EAD e Presencial", "Certificação Reconhecida", "Corpo Docente Qualificado", "Biblioteca Digital"],
    services: ["Bacharelado em Teologia", "Cursos Livres", "Pós-Graduação", "Seminários", "Workshops", "Mentoria Pastoral"],
    stats: { "Alunos Matriculados": "2.000+", "Cursos Disponíveis": "15+", "Formados": "5.000+", "Anos de Atuação": "10+" },
    contact: { email: "contato@faitel.edu.br", phone: "+55 71 99682-2782" }
  },
  cfidh: {
    name: "CFIDH",
    logo: logoCfidh,
    shortDescription: "Conselho e Federação Investigativa dos Direitos Humanos",
    fullDescription: "O CFIDH atua na defesa e promoção dos direitos humanos, com foco especial na comunidade evangélica. A organização trabalha em parceria com igrejas e ministérios para garantir a liberdade religiosa e os direitos fundamentais dos cristãos, oferecendo assessoria jurídica e advocacy.",
    mission: "Defender e promover os direitos humanos fundamentais, com ênfase na liberdade religiosa e na proteção da comunidade cristã.",
    vision: "Ser referência nacional e internacional na defesa dos direitos humanos e da liberdade religiosa.",
    highlights: ["Defesa dos Direitos Humanos", "Liberdade Religiosa", "Assessoria Jurídica", "Advocacy", "Educação em Direitos", "Parcerias Internacionais"],
    services: ["Assessoria Jurídica", "Defesa de Direitos", "Capacitação", "Advocacy", "Mediação de Conflitos", "Orientação Legal"],
    stats: { "Casos Atendidos": "1.000+", "Estados com Atuação": "27", "Anos de Experiência": "10+", "Parcerias": "50+" },
    contact: { email: "contato@cfidh.org.br", phone: "+55 75 99101-8395" }
  },
  cemadeb: {
    name: "CEMADEB",
    logo: logoCemadeb,
    shortDescription: "Convenção Evangélica de Ministros das Assembleias de Deus no Exterior e no Brasil",
    fullDescription: "A CEMADEB é uma convenção evangélica fraternal e interdenominacional, fundada em 14/07/2007. Apesar de ser uma convenção das Assembleias de Deus, filia todas as denominações evangélicas, ajudando igrejas grandes e pequenas no Brasil e no mundo. Com 18 anos de história, possui mais de 1.000 pastores filiados em 17 estados brasileiros, 108 municípios da Bahia e presença em 6 países.",
    mission: "Unir, fortalecer e capacitar ministros e ministérios evangélicos, promovendo comunhão e crescimento mútuo.",
    vision: "Ser a maior convenção fraternal interdenominacional, conectando ministérios em todo o mundo.",
    highlights: ["Interdenominacional", "Cobertura Pastoral", "Credenciamento", "Rede de Apoio", "Eventos e Congressos", "Formação Ministerial"],
    services: ["Filiação de Pastores", "Credenciamento de Igrejas", "Cobertura Pastoral", "Congressos Anuais", "Capacitação Ministerial", "Rede de Apoio"],
    stats: { "Pastores Filiados": "1.000+", "Estados": "17", "Países": "6", "Municípios (BA)": "108", "Anos de Fundação": "18" },
    contact: { email: "cemadeb@cemadeb.com.br", phone: "+55 75 99704-0153" }
  },
  iadma: {
    name: "IADMA",
    logo: logoIadma,
    shortDescription: "Igreja Assembleia de Deus Missão Apostólica",
    fullDescription: "A IADMA é uma denominação comprometida com a proclamação do Evangelho e o discipulado de vidas. Com sede na Bahia, a igreja tem expandido sua atuação por todo o Brasil e exterior, formando discípulos e plantando novas congregações, sempre fundamentada nos princípios bíblicos pentecostais.",
    mission: "Proclamar o Evangelho de Jesus Cristo, fazer discípulos e plantar igrejas em todas as nações.",
    vision: "Ser uma igreja que transforma vidas e comunidades através do poder do Evangelho.",
    highlights: ["Evangelismo", "Discipulado", "Plantação de Igrejas", "Missões", "Ensino Bíblico", "Louvor e Adoração"],
    services: ["Cultos e Celebrações", "Escola Bíblica", "Discipulado", "Missões Urbanas", "Missões Rurais", "Ação Social"],
    stats: { "Igrejas": "50+", "Membros": "5.000+", "Estados": "10+", "Missionários": "20+" },
    contact: { email: "contato@iadma.com.br", phone: "+55 75 99843-6345" }
  },
  setepos: {
    name: "SETEPOS",
    logo: logoSetepos,
    shortDescription: "Seminário Evangélico para Obreiros",
    fullDescription: "O SETEPOS oferece formação teológica e ministerial para obreiros e líderes cristãos. Com cursos práticos e fundamentados nas Escrituras, o seminário prepara homens e mulheres para o serviço no Reino de Deus, combinando ensino acadêmico com vivência prática do ministério.",
    mission: "Formar obreiros qualificados e comprometidos com a Palavra de Deus para o ministério cristão.",
    vision: "Ser referência em formação ministerial prática e bíblica no Brasil.",
    highlights: ["Formação Teológica", "Cursos Práticos", "Mentoria Pastoral", "Certificação", "Estágios Ministeriais", "Biblioteca"],
    services: ["Curso de Teologia", "Formação de Obreiros", "Curso de Liderança", "Seminários", "Retiros Espirituais", "Mentoria"],
    stats: { "Alunos": "500+", "Cursos": "10+", "Formados": "2.000+", "Anos de Atuação": "15+" },
    contact: { email: "contato@setepos.com.br", phone: "+55 71 98338-4883" }
  },
  secc: {
    name: "SECC",
    logo: logoSecc,
    shortDescription: "Sistema de Educação Continuada Cristã",
    fullDescription: "O SECC é uma plataforma de educação continuada voltada para o desenvolvimento espiritual e ministerial de cristãos. Com cursos online e presenciais, oferece capacitação constante para líderes e membros de igrejas, promovendo crescimento contínuo na fé e no serviço. Também disponibiliza revistas da Escola Bíblica Dominical para todas as idades.",
    mission: "Proporcionar educação continuada de qualidade para o crescimento espiritual e ministerial de cristãos.",
    vision: "Ser a principal plataforma de educação cristã continuada do Brasil.",
    highlights: ["Educação Continuada", "Plataforma Online", "Cursos Diversos", "Revistas EBD", "Certificados", "Comunidade de Aprendizado"],
    services: ["Cursos Online", "Workshops", "Webinars", "Material Didático", "Revistas EBD", "Certificação"],
    stats: { "Cursos Disponíveis": "50+", "Alunos": "3.000+", "Horas de Conteúdo": "500+", "Revistas EBD": "5+" },
    contact: { email: "contato@secc.edu.br", phone: "+55 71 98338-4843" }
  },
  wst: {
    name: "WST Gráfica e Editora",
    logo: logoWst,
    shortDescription: "Editora e Gráfica especializada em materiais cristãos",
    fullDescription: "A WST Gráfica e Editora é especializada na produção de materiais gráficos de alta qualidade para igrejas, ministérios e organizações cristãs. Com anos de experiência no mercado editorial evangélico, oferece serviços completos de impressão, design gráfico e produção de materiais didáticos, revistas, livros e materiais promocionais.",
    mission: "Produzir materiais gráficos de excelência que glorifiquem a Deus e auxiliem no crescimento do Reino.",
    vision: "Ser a editora e gráfica de referência para o mercado evangélico brasileiro.",
    highlights: ["Impressão de Alta Qualidade", "Design Gráfico", "Materiais Didáticos", "Livros e Revistas", "Materiais Promocionais", "Atendimento Personalizado"],
    services: ["Impressão Offset", "Impressão Digital", "Design Gráfico", "Diagramação", "Produção de Livros", "Materiais para Igrejas"],
    stats: { "Anos de Experiência": "10+", "Clientes Atendidos": "500+", "Projetos Realizados": "2.000+" },
    contact: { email: "contato@wstgrafica.com.br", phone: "+55 71 98338-4883" }
  },
  ibma: {
    name: "IBMA",
    logo: logoIbma,
    shortDescription: "Instituto Brasil Mão Amiga",
    fullDescription: "O Instituto Brasil Mão Amiga (IBMA) é uma organização sem fins lucrativos dedicada à assistência social e humanitária. Atua em diversas frentes de apoio às comunidades carentes, promovendo ações de solidariedade, distribuição de alimentos, assistência médica e educacional para famílias em situação de vulnerabilidade social.",
    mission: "Promover a dignidade humana através de ações de assistência social e humanitária, levando esperança e transformação às comunidades carentes.",
    vision: "Ser referência em assistência social cristã, alcançando vidas e transformando comunidades em todo o Brasil.",
    highlights: ["Assistência Social", "Ação Humanitária", "Distribuição de Alimentos", "Apoio Educacional", "Atendimento Médico", "Voluntariado"],
    services: ["Cesta Básica", "Atendimento Social", "Apoio Educacional", "Campanhas de Doação", "Assistência Médica", "Capacitação Profissional"],
    stats: { "Famílias Atendidas": "1.000+", "Projetos Sociais": "50+", "Voluntários Ativos": "200+" },
    contact: { email: "contato@ibma.org.br", phone: "+55 71 98338-4883" }
  },
  cec: {
    name: "CEC",
    logo: logoCec,
    shortDescription: "Conselho de Educação e Cultura da CEMADEB",
    fullDescription: "O Conselho de Educação e Cultura da CEMADEB (CEC) é o órgão responsável por coordenar e supervisionar todas as ações educacionais e culturais da convenção. Promove a excelência no ensino teológico, na formação de líderes e na preservação e difusão da cultura cristã evangélica.",
    mission: "Coordenar e promover a educação e cultura cristã de excelência, formando líderes capacitados para o ministério.",
    vision: "Ser o órgão de referência em educação e cultura cristã na CEMADEB e nas igrejas filiadas.",
    highlights: ["Educação Cristã", "Cultura Evangélica", "Formação de Líderes", "Supervisão Educacional", "Eventos Culturais", "Material Didático"],
    services: ["Supervisão Educacional", "Formação de Professores", "Eventos Culturais", "Congressos Educacionais", "Material Didático", "Certificação"],
    stats: { "Cursos Oferecidos": "30+", "Alunos Formados": "2.000+", "Eventos Realizados": "100+" },
    contact: { email: "cec@cemadeb.com.br", phone: "+55 71 98338-4883" }
  }
};

export default function ParceiroDetalhe() {
  const { id } = useParams<{ id: string }>();
  const partner = id ? partnersData[id] : null;

  if (!partner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Parceiro não encontrado</h1>
          <Link to="/parceiros">
            <Button variant="gold">Voltar aos Parceiros</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-navy text-white py-8">
        <div className="container mx-auto px-4">
          <Link to="/parceiros" className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Parceiros
          </Link>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-32 h-32 bg-white rounded-2xl p-4 flex items-center justify-center">
              <img src={partner.logo} alt={partner.name} className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{partner.name}</h1>
              <p className="text-gold text-lg mt-1">{partner.shortDescription}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-navy mb-4">Sobre</h2>
                <p className="text-muted-foreground leading-relaxed">{partner.fullDescription}</p>
              </CardContent>
            </Card>

            {/* Mission & Vision */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-navy mb-3">Missão</h3>
                  <p className="text-muted-foreground">{partner.mission}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-navy mb-3">Visão</h3>
                  <p className="text-muted-foreground">{partner.vision}</p>
                </CardContent>
              </Card>
            </div>

            {/* Services */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-navy mb-4">Serviços</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {partner.services.map((service) => (
                    <div key={service} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-gold flex-shrink-0" />
                      <span className="text-muted-foreground">{service}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Highlights */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-navy mb-4">Destaques</h2>
                <div className="flex flex-wrap gap-3">
                  {partner.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="bg-gold/10 text-gold px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SECC Magazines Section */}
            {id === "secc" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-navy mb-4">Revistas da Escola Bíblica Dominical</h2>
                  <p className="text-muted-foreground mb-6">
                    Material didático completo para todas as faixas etárias. Entre em contato para adquirir suas revistas.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                    {seccMagazines.map((magazine) => (
                      <div key={magazine.id} className="group relative">
                        <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted shadow-md hover:shadow-xl transition-shadow">
                          <img
                            src={magazine.image}
                            alt={magazine.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center line-clamp-2">{magazine.title}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gold/10 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="h-6 w-6 text-gold" />
                      <div>
                        <p className="font-semibold text-navy">Quer adquirir as revistas?</p>
                        <p className="text-sm text-muted-foreground">Entre em contato pelo WhatsApp</p>
                      </div>
                    </div>
                    <a
                      href="https://wa.me/5571983384843"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="gold" className="gap-2">
                        <Phone className="h-4 w-4" />
                        +55 71 98338-4843
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-navy mb-4">Números</h3>
                <div className="space-y-4">
                  {Object.entries(partner.stats).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center border-b border-border pb-2 last:border-0">
                      <span className="text-muted-foreground text-sm">{key}</span>
                      <span className="font-bold text-gold text-lg">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-navy mb-4">Contato</h3>
                <div className="space-y-3">
                  {partner.contact.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gold" />
                      <a href={`mailto:${partner.contact.email}`} className="text-muted-foreground hover:text-gold transition-colors text-sm">
                        {partner.contact.email}
                      </a>
                    </div>
                  )}
                  {partner.contact.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gold" />
                      <a href={`https://wa.me/${partner.contact.phone.replace(/\D/g, '')}`} className="text-muted-foreground hover:text-gold transition-colors text-sm">
                        {partner.contact.phone}
                      </a>
                    </div>
                  )}
                </div>
                <div className="mt-6">
                  <Link to="/login">
                    <Button variant="gold" className="w-full">
                      Entrar em Contato
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-gradient-to-br from-navy to-navy/90 text-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3">Quer se filiar?</h3>
                <p className="text-white/70 text-sm mb-4">
                  Entre em contato e saiba como fazer parte dessa rede.
                </p>
                <Link to="/login">
                  <Button variant="gold" className="w-full">
                    Cadastre-se
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
