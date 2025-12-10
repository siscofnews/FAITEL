import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Globe, 
  Users, 
  GraduationCap, 
  Church, 
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  Quote,
  Award,
  Flag,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import pastorEtienne from "@/assets/pastor-etienne-claude.jpg";
import pastorClaudino from "@/assets/pastor-claudino.jpg";
import pastorJota from "@/assets/pastor-jota.jpg";
import pastorEvilazio from "@/assets/pastor-evilazio.jpg";
import pastorAdemir from "@/assets/pastor-ademir-sacramento.jpg";
import pastoraThelma from "@/assets/pastora-thelma.jpg";
import pastorValdinei from "@/assets/pastor-valdinei.jpg";
import logoSiscof from "@/assets/logo-siscof.png";
import logoCemadeb from "@/assets/logo-cemadeb.png";
import logoFaitel from "@/assets/logo-faitel.png";
import logoIadma from "@/assets/logo-iadma.jpg";

// Gallery images - using relevant church/convention stock images
const galleryImages = [
  {
    id: 1,
    src: pastorEtienne,
    alt: "Pastor Etienne Claude - Presidente CEMADEB Europa",
    caption: "Pastor Etienne Claude assume a presidência da CEMADEB Europa"
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=600&fit=crop",
    alt: "Cerimônia de Abertura",
    caption: "Cerimônia de abertura da 30ª AGO em Entre Rios - BA"
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1524069290683-0457abbd6bf3?w=800&h=600&fit=crop",
    alt: "Assembleia Geral",
    caption: "Autoridades eclesiásticas reunidas durante a assembleia"
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&h=600&fit=crop",
    alt: "Igreja e Adoração",
    caption: "Momento de louvor e adoração durante o evento"
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1560439514-4e9645039924?w=800&h=600&fit=crop",
    alt: "Posse das Novas Lideranças",
    caption: "Cerimônia de posse das novas lideranças - Mandato 2025-2028"
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=600&fit=crop",
    alt: "Encerramento",
    caption: "Momento de encerramento com todas as autoridades presentes"
  }
];

export default function AGO30CEMADEB() {
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = "CEMADEB celebra posse histórica do Pastor Etienne Claude na 30ª AGO";
    
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (platform === 'copy') {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-navy text-white py-4 sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={logoSiscof} alt="SISCOF" className="w-10 h-10 object-contain" />
              <div>
                <span className="text-gold font-bold">SISCOF</span>
                <span className="text-white font-bold">News</span>
              </div>
            </Link>
            <Link to="/">
              <Button variant="ghost" className="text-white hover:text-gold hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1478147427282-58a87a120781?w=1600&h=800&fit=crop"
          alt="30ª AGO CEMADEB"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-gold text-navy">30ª AGO</Badge>
              <Badge className="bg-red-500 text-white">Destaque</Badge>
              <Badge variant="outline" className="border-white/50 text-white">CEMADEB</Badge>
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white max-w-4xl leading-tight">
              CEMADEB celebra posse histórica do Pastor Etienne Claude e anuncia expansão internacional durante a 30ª AGO na Bahia
            </h1>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-2 space-y-8">
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b pb-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                18-21 Setembro 2025
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Entre Rios, Bahia
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Por Redação SISCOF
              </span>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Compartilhar:</span>
              <Button variant="outline" size="icon" onClick={() => handleShare('facebook')} className="hover:bg-blue-100 hover:text-blue-600 hover:border-blue-600">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleShare('twitter')} className="hover:bg-sky-100 hover:text-sky-500 hover:border-sky-500">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleShare('linkedin')} className="hover:bg-blue-100 hover:text-blue-700 hover:border-blue-700">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleShare('copy')}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            {/* Lead Paragraph */}
            <p className="text-xl text-muted-foreground leading-relaxed">
              A 30ª Assembleia Geral Ordinária (AGO) da CEMADEB – Convenção Evangélica de Ministros das 
              Assembleias de Deus da Bahia e Outros consolidou oficialmente um novo tempo para a instituição, 
              marcada por crescimento, internacionalização e transições estratégicas.
            </p>

            <p className="text-lg leading-relaxed">
              O evento, realizado entre 18 e 21 de setembro de 2025 na sede nacional em Entre Rios – BA, 
              reuniu autoridades eclesiásticas de diversas regiões do Brasil e do exterior, celebrando os 
              avanços conquistados ao longo de anos de trabalho.
            </p>

            {/* Statistics Section */}
            <Card className="bg-gradient-to-br from-navy to-navy-light text-white overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-gold" />
                  CEMADEB: presença consolidada no Brasil e no mundo
                </h3>
                <p className="text-white/80 mb-6">
                  Durante a abertura do evento, foi apresentada a atual configuração da Convenção, 
                  demonstrando seu forte alcance ministerial:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <span className="text-3xl font-bold text-gold">108</span>
                    <p className="text-sm text-white/70">Municípios da Bahia</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <span className="text-3xl font-bold text-gold">16</span>
                    <p className="text-sm text-white/70">Estados do Brasil</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <span className="text-3xl font-bold text-gold">7</span>
                    <p className="text-sm text-white/70">Países</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <span className="text-3xl font-bold text-gold">1.010+</span>
                    <p className="text-sm text-white/70">Ministros Cadastrados</p>
                  </div>
                </div>
                <p className="text-white/70 text-sm mt-4 italic">
                  A expansão mostra que a CEMADEB deixou de ser apenas uma convenção estadual para se tornar 
                  uma convenção internacional fraternal, respeitada por sua seriedade, doutrina, unidade e 
                  compromisso com a obra do Senhor.
                </p>
              </CardContent>
            </Card>

            {/* Pastor Etienne Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Award className="h-6 w-6 text-gold" />
                Posse histórica: Pastor Etienne Claude assume a CEMADEB Europa
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-1">
                  <img 
                    src={pastorEtienne}
                    alt="Pastor Etienne Claude"
                    className="w-full rounded-xl shadow-lg object-cover aspect-[3/4]"
                  />
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Pastor Etienne Claude
                  </p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <p className="leading-relaxed">
                    A cerimônia mais marcante da AGO foi a posse do Pastor Etienne Claude, presidente da 
                    Assemblèe de Dieus International ACTes 2.52, que assumiu oficialmente:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span><strong>Presidência da CEMADEB na Europa</strong></span>
                    </li>
                    <li className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span><strong>Direção da FAITEL</strong> – Faculdade Internacional Teológica de Líderes (Extensão Europa)</span>
                    </li>
                  </ul>
                  <p className="leading-relaxed">
                    Ao lado do Pastor Handerson de Oliveira e do Pastor Léo, o Pastor Etienne terá a missão 
                    de levar para o continente europeu:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Todo o material teológico da FAITEL</li>
                    <li>Os currículos completos da Escola Bíblica</li>
                    <li>O SECC – Sistema de Educação Continuada Cristã</li>
                  </ul>
                  <p className="text-gold font-semibold">
                    Essa expansão educacional representa um passo gigantesco para a convenção, que agora passa 
                    a ofertar formação, capacitação e educação teológica padronizada em território europeu.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* IADMA Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Church className="h-6 w-6 text-gold" />
                IADMA: 26 anos expandindo a obra no Brasil
              </h2>
              <p className="leading-relaxed mb-4">
                A AGO também celebrou a trajetória da IADMA – Igreja Assembleia de Deus Missão Apostólica, 
                que há 26 anos desenvolve trabalhos em diversos municípios da Bahia e em outros estados do Brasil.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                A IADMA, fundada com base missionária e visão de crescimento, tornou-se referência por seu 
                modelo de discipulado, missões e formação de obreiros.
              </p>
            </section>

            <Separator />

            {/* FAITEL Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-gold" />
                FAITEL: 23 anos formando líderes no Brasil e no exterior
              </h2>
              <p className="leading-relaxed mb-4">
                A FAITEL – Faculdade Internacional Teológica de Líderes, hoje presente no Brasil e fora dele, possui:
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <Card className="border-gold/30">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-3 bg-gold/10 rounded-lg">
                      <Calendar className="h-6 w-6 text-gold" />
                    </div>
                    <div>
                      <p className="font-bold text-2xl">23</p>
                      <p className="text-sm text-muted-foreground">Anos de atuação</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-gold/30">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-3 bg-gold/10 rounded-lg">
                      <Users className="h-6 w-6 text-gold" />
                    </div>
                    <div>
                      <p className="font-bold text-2xl">100+</p>
                      <p className="text-sm text-muted-foreground">Alunos formados</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <p className="leading-relaxed text-muted-foreground">
                A instituição, que nasceu da necessidade de capacitar ministros, hoje é um dos pilares 
                educacionais da convenção, com reconhecimento por sua seriedade acadêmica e doutrinária.
              </p>
            </section>

            <Separator />

            {/* Leadership Transition */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Flag className="h-6 w-6 text-gold" />
                Liderança Presidencial: Pastor Valdinei e Pastora Thelma Santos
              </h2>
              
              {/* Pastor Valdinei Biography */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-1">
                  <img 
                    src={pastorValdinei}
                    alt="Pastor Valdinei da Conceição Santos"
                    className="w-full rounded-xl shadow-lg object-cover aspect-[3/4]"
                  />
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Pastor Valdinei da Conceição Santos
                  </p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <Badge className="bg-gold text-navy">Presidente Geral IADMA e CEMADEB</Badge>
                  <h3 className="text-xl font-bold">Pastor Valdinei da Conceição Santos</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    Nascido em Esplanada – BA, o Pastor Valdinei é ordenado pela Assembleia de Deus e preside a 
                    <strong> IADMA – Igreja Assembleia de Deus Missão Apostólica há 26 anos</strong>. Atua também como 
                    presidente da <strong>CEMADEB há 17 anos</strong>.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-navy dark:text-gold">Cargos e Funções:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 4.º Secretário Executivo da CADB</li>
                      <li>• 2.º Vice-presidente da APEBE – Associação Pró-Evangélica do Brasil e Exterior</li>
                      <li>• Presidente do SETEPOS – Seminário Evangélico Teológico para Obreiros</li>
                      <li>• Diretor Fundador da CFIDH – Conselho e Federação Investigativa dos Direitos Humanos</li>
                      <li>• Fundador do ISBAF – Instituto Social Brasileiro de Assistência a Famílias</li>
                      <li>• Diretor Fundador do SISCOF – Sistema Integrado de Igrejas, Convenções e Faculdades</li>
                      <li>• Presidente Fundador da FAITEL – Faculdade Internacional Teológica de Líderes</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-navy dark:text-gold">Formação Acadêmica:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Teologia pela FATAD e SETEPOS</li>
                      <li>• Administração pela UCSal – Universidade Católica do Salvador</li>
                      <li>• Técnico em Construção Civil e Calculista de Concreto</li>
                      <li>• Pós-graduando em Ciências da Religião pela IPEMIG</li>
                      <li>• Pós-graduando em Gestão Pública pela UNIASSELVI</li>
                    </ul>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Professor de teologia com especializações em diversas áreas bíblicas, também atua no ensino de 
                    Juiz de Paz, Juiz Arbitral, Capelania e Direitos Humanos. Cristão desde a infância, aos 13 anos 
                    já ministrava a Palavra em sua igreja local e aos 15 anos passou a ser convidado para ministrar 
                    em outras localidades.
                  </p>
                </div>
              </div>

              {/* Pastora Thelma Biography */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-1 md:order-last">
                  <img 
                    src={pastoraThelma}
                    alt="Pastora Thelma Santana Menezes Santos"
                    className="w-full rounded-xl shadow-lg object-cover aspect-[3/4]"
                  />
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Pastora Thelma Santana Menezes Santos
                  </p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <Badge className="bg-gold text-navy">Vice-Presidente Nacional CEMADEB</Badge>
                  <h3 className="text-xl font-bold">Pastora Thelma Santana Menezes Santos</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    Casada há <strong>26 anos</strong> com o Pastor Valdinei C. Santos, ambos presidem a IADMA há 26 anos. 
                    Juntos, lideram todas as frentes ministeriais e institucionais com excelência e dedicação.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-navy dark:text-gold">Cargos e Funções:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Vice-Presidente Nacional da CEMADEB</li>
                      <li>• Co-fundadora e Presidente da IADMA</li>
                      <li>• Presidente da UFEMADEB – União Feminina de Esposas de Ministros das Assembleias de Deus no Exterior e no Brasil</li>
                      <li>• Diretora da FAITEL – Faculdade Internacional Teológica de Líderes</li>
                      <li>• Líder da SECC – Sistema de Educação Continuada Cristã</li>
                      <li>• Escritora</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-navy dark:text-gold">Formação Acadêmica e Profissional:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Sargento da PM/AL (Polícia Militar de Alagoas)</li>
                      <li>• Bacharel em Direito</li>
                      <li>• Bacharel em Teologia</li>
                    </ul>
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    Mãe e avó dedicada, a Pastora Thelma está à frente de todas as instituições na diretoria 
                    ao lado do Pastor Valdinei, contribuindo para o crescimento do Reino de Deus no Brasil e no exterior.
                  </p>
                </div>
              </div>

              {/* Family Info */}
              <Card className="bg-muted/50 border-0 mb-6">
                <CardContent className="p-6">
                  <h4 className="font-bold mb-3 text-navy dark:text-gold">Família</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Casados há 26 anos, o casal pastoral é pai de três filhos — <strong>Mikaellem Thamily</strong>, 
                    <strong> Mirelly Victória</strong> e <strong>Samuel</strong> —, sogros do Pastor Fabrício e avós 
                    do pequeno Aleph. Atualmente residem na cidade de Entre Rios, estado da Bahia.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/50 border-0 mb-6">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-gold mb-4" />
                  <blockquote className="text-lg italic leading-relaxed mb-4">
                    "Poderíamos enviar qualquer um dos nossos pastores, mas Deus escolheu a nós. Esta mudança 
                    é exclusivamente para um avanço maior da IADMA e da CEMADEB no Brasil e no exterior. 
                    Nossa missão agora é expandir o Reino onde Deus nos enviou."
                  </blockquote>
                  <footer className="text-gold font-semibold">
                    — Pastor Valdinei C. Santos e Pastora Thelma Santos
                  </footer>
                </CardContent>
              </Card>

              <p className="leading-relaxed text-muted-foreground">
                A ida do casal presidencial para o Sudeste tem como objetivo abrir novas frentes missionárias, 
                fortalecer a base da convenção e implantar novas igrejas e centros de formação.
              </p>
            </section>

            <Separator />

            {/* V ENAPEB */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-gold" />
                V ENAPEB e decisões estruturais
              </h2>
              <p className="leading-relaxed">
                A V ENAPEB trouxe mudanças importantes, incluindo a aprovação da transformação da organização 
                em federação internacional, fortalecendo ainda mais sua legitimidade e representação.
              </p>
            </section>

            <Separator />

            {/* New Leadership */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Novas lideranças empossadas para o mandato 2025–2028</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-gold/30 md:col-span-2">
                  <CardContent className="p-4 flex items-center gap-4">
                    <img 
                      src={pastoraThelma}
                      alt="Pastora Thelma Santana Menezes Santos"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gold"
                    />
                    <div>
                      <Badge className="bg-gold text-navy mb-3">Vice-Presidente CEMADEB Nacional</Badge>
                      <p className="font-bold text-lg">Pastora Thelma Santana Menezes Santos</p>
                      <p className="text-muted-foreground">Vice-Presidente Nacional da CEMADEB</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Co-fundadora da IADMA • Diretora FAITEL • Líder da SECC
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-navy/30">
                  <CardContent className="p-4 flex items-center gap-3">
                    <img 
                      src={pastorAdemir}
                      alt="Pastor Ademir Sacramento"
                      className="w-14 h-14 rounded-full object-cover border-2 border-navy"
                    />
                    <div>
                      <Badge className="bg-navy text-white mb-3">Sede IADMA Bahia</Badge>
                      <p className="font-bold text-lg">Pastor Ademir Sacramento</p>
                      <p className="text-muted-foreground">Pastora Ruthe Sacramento</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-emerald-500/30">
                  <CardContent className="p-4 flex items-center gap-3">
                    <img 
                      src={pastorJota}
                      alt="Pastor Jota"
                      className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500"
                    />
                    <div>
                      <Badge className="bg-emerald-500 text-white mb-3">CEMADEB Bahia</Badge>
                      <p className="font-bold text-lg">Pastor Jota</p>
                      <p className="text-muted-foreground">1º Vice-Presidente</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-emerald-600/30">
                  <CardContent className="p-4 flex items-center gap-3">
                    <img 
                      src={pastorEvilazio}
                      alt="Pastor Evilázio"
                      className="w-14 h-14 rounded-full object-cover border-2 border-emerald-600"
                    />
                    <div>
                      <Badge className="bg-emerald-600 text-white mb-3">CEMADEB Bahia</Badge>
                      <p className="font-bold text-lg">Pastor Evilázio</p>
                      <p className="text-muted-foreground">2º Vice-Presidente</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-blue-500/30">
                  <CardContent className="p-4 flex items-center gap-3">
                    <img 
                      src={pastorClaudino}
                      alt="Pastor Claudino Naciso Júnior"
                      className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
                    />
                    <div>
                      <Badge className="bg-blue-500 text-white mb-3">CEMADEB Bahia</Badge>
                      <p className="font-bold text-lg">Pastor Claudino Naciso Júnior</p>
                      <p className="text-muted-foreground">Presidente - Mandato 2025-2028</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Photo Gallery */}
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1 h-8 bg-gold rounded-full"></span>
                Galeria de Fotos
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((image, index) => (
                  <div 
                    key={image.id}
                    className="relative group cursor-pointer overflow-hidden rounded-xl aspect-[4/3]"
                    onClick={() => openLightbox(index)}
                  >
                    <img 
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium text-center px-4">
                        {image.caption}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Conclusion */}
            <Card className="bg-gradient-to-br from-gold/10 to-gold/5 border-gold/30 mt-8">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 text-navy">
                  Um novo tempo para a CEMADEB, a IADMA e a FAITEL
                </h3>
                <p className="leading-relaxed mb-4">
                  A 30ª AGO entrou oficialmente para a história como o evento que:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-gold" />
                    <span>Internacionalizou a convenção</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-gold" />
                    <span>Expandiu a FAITEL para a Europa</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-gold" />
                    <span>Reforçou a presença da CEMADEB no Brasil</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-gold" />
                    <span>Celebrou os 26 anos da IADMA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-gold" />
                    <span>Destacou a formação de líderes da FAITEL</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-gold" />
                    <span>Iniciou um novo ciclo de expansão missionária no Sudeste</span>
                  </li>
                </ul>
                <p className="text-gold font-bold text-lg">
                  A CEMADEB segue adiante com o compromisso de alcançar mais estados, mais países e mais vidas para o Reino de Deus.
                </p>
              </CardContent>
            </Card>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Organization Logos */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Organizações Envolvidas</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <img src={logoCemadeb} alt="CEMADEB" className="w-12 h-12 object-contain" />
                    <div>
                      <p className="font-semibold text-sm">CEMADEB</p>
                      <p className="text-xs text-muted-foreground">Convenção Evangélica</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <img src={logoIadma} alt="IADMA" className="w-12 h-12 object-contain" />
                    <div>
                      <p className="font-semibold text-sm">IADMA</p>
                      <p className="text-xs text-muted-foreground">26 anos de história</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <img src={logoFaitel} alt="FAITEL" className="w-12 h-12 object-contain" />
                    <div>
                      <p className="font-semibold text-sm">FAITEL</p>
                      <p className="text-xs text-muted-foreground">Formação Teológica</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Info Card */}
            <Card className="bg-navy text-white">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4 text-gold">Informações do Evento</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gold" />
                    <span className="text-sm">18 a 21 de Setembro de 2025</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gold" />
                    <span className="text-sm">Entre Rios, Bahia</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Church className="h-5 w-5 text-gold" />
                    <span className="text-sm">Sede Nacional CEMADEB</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gold" />
                    <span className="text-sm">1.010+ Ministros Participantes</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {['CEMADEB', 'AGO', 'FAITEL', 'IADMA', 'Europa', 'Expansão', 'Posse', 'Liderança', 'Bahia', 'Internacional'].map(tag => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-gold hover:text-navy hover:border-gold transition-colors"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Related Articles */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Artigos Relacionados</h3>
                <div className="space-y-4">
                  <Link to="/" className="block group">
                    <p className="text-sm font-medium group-hover:text-gold transition-colors line-clamp-2">
                      FAITEL celebra 23 anos de formação teológica
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">20 Set 2025</p>
                  </Link>
                  <Separator />
                  <Link to="/" className="block group">
                    <p className="text-sm font-medium group-hover:text-gold transition-colors line-clamp-2">
                      IADMA completa 26 anos de trabalho missionário
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">15 Set 2025</p>
                  </Link>
                  <Separator />
                  <Link to="/" className="block group">
                    <p className="text-sm font-medium group-hover:text-gold transition-colors line-clamp-2">
                      Expansão europeia: CEMADEB alcança novos territórios
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">10 Set 2025</p>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-navy text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <img src={logoSiscof} alt="SISCOF" className="w-16 h-16 mx-auto mb-4" />
          <p className="text-white/70 text-sm">
            © 2025 SISCOF News - Portal Evangélico. Todos os direitos reservados.
          </p>
          <div className="mt-4">
            <Link to="/" className="text-gold hover:underline text-sm">
              Voltar ao Portal
            </Link>
          </div>
        </div>
      </footer>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button 
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gold transition-colors"
          >
            <X className="h-8 w-8" />
          </button>
          
          <button 
            onClick={prevImage}
            className="absolute left-4 text-white hover:text-gold transition-colors"
          >
            <ChevronLeft className="h-12 w-12" />
          </button>
          
          <div className="max-w-4xl max-h-[80vh]">
            <img 
              src={galleryImages[currentImageIndex].src}
              alt={galleryImages[currentImageIndex].alt}
              className="max-w-full max-h-[70vh] object-contain mx-auto"
            />
            <p className="text-white text-center mt-4">
              {galleryImages[currentImageIndex].caption}
            </p>
            <p className="text-white/50 text-center text-sm mt-2">
              {currentImageIndex + 1} / {galleryImages.length}
            </p>
          </div>
          
          <button 
            onClick={nextImage}
            className="absolute right-4 text-white hover:text-gold transition-colors"
          >
            <ChevronRight className="h-12 w-12" />
          </button>
        </div>
      )}
    </div>
  );
}
