import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Award, 
  BookOpen, 
  Building2, 
  Camera,
  GraduationCap, 
  Heart, 
  MapPin, 
  Scale,
  Shield,
  Users,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import pastorValdinei from "@/assets/pastor-valdinei.jpg";
import pastoraThelma from "@/assets/pastora-thelma.jpg";
import pastorEtienne from "@/assets/pastor-etienne-claude.jpg";
import pastorClaudino from "@/assets/pastor-claudino.jpg";
import pastorAdemir from "@/assets/pastor-ademir-sacramento.jpg";
import pastorHanderson from "@/assets/pastor-handerson.jpg";
import pastoraHaira from "@/assets/pastora-haira.png";
import pastorLeonardo from "@/assets/pastor-leonardo.png";
import logoSiscof from "@/assets/logo-siscof.png";
import logoCemadeb from "@/assets/logo-cemadeb.png";
import logoIadma from "@/assets/logo-iadma.jpg";
import logoFaitel from "@/assets/logo-faitel.png";
import diretores from "@/assets/diretores.jpg";
import encontroFe from "@/assets/encontro-de-fe.jpg";
import temploCentral from "@/assets/templo-central-iadma.jpg";
import agoCemadeb1 from "@/assets/ago/ago-cemadeb-1.jpg";
import agoCemadeb2 from "@/assets/ago/ago-cemadeb-2.jpg";
import agoCemadeb3 from "@/assets/ago/ago-cemadeb-3.jpg";
import agoCemadeb4 from "@/assets/ago/ago-cemadeb-4.jpg";
import agoCemadeb5 from "@/assets/ago/ago-cemadeb-5.jpg";
import agoCemadeb6 from "@/assets/ago/ago-cemadeb-6.jpg";
import agoCemadeb7 from "@/assets/ago/ago-cemadeb-7.jpg";
import agoCemadeb8 from "@/assets/ago/ago-cemadeb-8.jpg";
import agoCemadeb9 from "@/assets/ago/ago-cemadeb-9.jpg";
import agoCemadeb10 from "@/assets/ago/ago-cemadeb-10.jpg";
import agoCemadeb11 from "@/assets/ago/ago-cemadeb-11.jpg";
import agoCemadeb12 from "@/assets/ago/ago-cemadeb-12.jpg";
import agoCemadeb13 from "@/assets/ago/ago-cemadeb-13.jpg";
import agoCemadeb14 from "@/assets/ago/ago-cemadeb-14.jpg";

const galleryImages = [
  {
    src: agoCemadeb6,
    title: "AGO CEMADEB - Louvor",
    description: "Multidão em adoração durante a Assembleia Geral Ordinária"
  },
  {
    src: agoCemadeb8,
    title: "5ª AGO CEMADEB",
    description: "Preparativos do palco para a 5ª Assembleia Geral Ordinária"
  },
  {
    src: agoCemadeb10,
    title: "3ª AGO CEMADEB - Formatura",
    description: "Cerimônia de formatura durante a 3ª AGO da CEMADEB"
  },
  {
    src: agoCemadeb11,
    title: "AGO CEMADEB - Formandos",
    description: "Turma de formandos em teologia durante AGO da CEMADEB"
  },
  {
    src: agoCemadeb14,
    title: "AGO CEMADEB - SETEPOS",
    description: "Formandos do SETEPOS com certificados durante AGO"
  },
  {
    src: agoCemadeb12,
    title: "AGO CEMADEB - Mesa Diretora",
    description: "Mesa diretora durante sessão da Assembleia Geral"
  },
  {
    src: agoCemadeb13,
    title: "AGO CEMADEB - Pastores",
    description: "Pastores reunidos durante trabalhos da AGO"
  },
  {
    src: agoCemadeb7,
    title: "AGO CEMADEB - Delegados",
    description: "Delegados e representantes em evento da CEMADEB"
  },
  {
    src: agoCemadeb9,
    title: "AGO CEMADEB - Plenário Geral",
    description: "Vista do plenário durante confraternização"
  },
  {
    src: agoCemadeb1,
    title: "AGO CEMADEB - Juventude",
    description: "Jovens em oração durante Assembleia Geral Ordinária da CEMADEB"
  },
  {
    src: agoCemadeb2,
    title: "AGO CEMADEB - Plenário",
    description: "Vista geral do plenário durante a Assembleia Geral Ordinária"
  },
  {
    src: agoCemadeb3,
    title: "AGO CEMADEB - Confraternização",
    description: "Momento de confraternização entre os pastores e líderes"
  },
  {
    src: agoCemadeb4,
    title: "AGO CEMADEB - Consagração",
    description: "Momento de imposição de mãos e consagração ministerial"
  },
  {
    src: agoCemadeb5,
    title: "AGO CEMADEB - Assembleia",
    description: "Pastores e obreiros reunidos durante a assembleia"
  },
  {
    src: diretores,
    title: "Diretoria CEMADEB",
    description: "Reunião da diretoria executiva da CEMADEB"
  },
  {
    src: encontroFe,
    title: "Encontro de Fé",
    description: "Evento ministerial com a participação de diversos líderes"
  },
  {
    src: temploCentral,
    title: "Templo Central IADMA",
    description: "Sede principal da Igreja Assembleia de Deus Missão Apostólica"
  },
  {
    src: pastorValdinei,
    title: "Pastor Valdinei Santos",
    description: "Presidente Geral da IADMA e CEMADEB em atividade ministerial"
  },
  {
    src: pastoraThelma,
    title: "Pastora Thelma Santos",
    description: "Vice-Presidente Nacional da CEMADEB"
  },
  {
    src: pastorEtienne,
    title: "Pastor Etienne Claude",
    description: "Presidente da CEMADEB Europa"
  },
  {
    src: pastorHanderson,
    title: "Pastor Handerson de Oliveira",
    description: "Vice-Presidente da CEMADEB Europa"
  }
];

export default function Lideranca() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedImage(index);
  const closeLightbox = () => setSelectedImage(null);
  const goToPrevious = () => setSelectedImage((prev) => (prev !== null && prev > 0 ? prev - 1 : galleryImages.length - 1));
  const goToNext = () => setSelectedImage((prev) => (prev !== null && prev < galleryImages.length - 1 ? prev + 1 : 0));

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

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-navy via-navy-light to-navy text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-gold text-navy mb-4">Liderança</Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Conheça Nossos Líderes
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Homens e mulheres dedicados à obra de Deus, liderando a CEMADEB e a IADMA 
            com excelência, visão e compromisso com o Reino.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <img src={logoCemadeb} alt="CEMADEB" className="h-16 object-contain" />
            <img src={logoIadma} alt="IADMA" className="h-16 object-contain" />
            <img src={logoFaitel} alt="FAITEL" className="h-16 object-contain" />
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        {/* Presidência Nacional */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-10 bg-gold rounded-full"></div>
            <h2 className="text-2xl md:text-3xl font-bold">Presidência Nacional</h2>
          </div>

          {/* Pastor Valdinei */}
          <Card className="mb-8 overflow-hidden border-gold/30">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-3 gap-0">
                <div className="md:col-span-1 bg-gradient-to-br from-navy to-navy-light p-6 flex flex-col items-center justify-center">
                  <img 
                    src={pastorValdinei}
                    alt="Pastor Valdinei da Conceição Santos"
                    className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover border-4 border-gold shadow-xl"
                  />
                  <h3 className="text-xl font-bold text-white mt-4 text-center">
                    Pastor Valdinei da Conceição Santos
                  </h3>
                  <Badge className="bg-gold text-navy mt-2">Presidente Geral</Badge>
                </div>
                <div className="md:col-span-2 p-6 md:p-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-lg text-navy dark:text-gold flex items-center gap-2 mb-3">
                        <Users className="h-5 w-5" />
                        Cargos e Funções
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                          <span>Presidente da IADMA (26 anos)</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                          <span>Presidente da CEMADEB (17 anos)</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                          <span>4.º Secretário Executivo da CADB</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                          <span>2.º Vice-presidente da APEBE</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                          <span>Presidente do SETEPOS</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                          <span>Diretor Fundador da CFIDH</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                          <span>Fundador do ISBAF</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                          <span>Diretor Fundador do SISCOF</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                          <span>Presidente Fundador da FAITEL</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-bold text-lg text-navy dark:text-gold flex items-center gap-2 mb-3">
                        <GraduationCap className="h-5 w-5" />
                        Formação Acadêmica
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Teologia pela FATAD e SETEPOS</li>
                        <li>• Administração pela UCSal – Universidade Católica do Salvador</li>
                        <li>• Técnico em Construção Civil e Calculista de Concreto</li>
                        <li>• Pós-graduando em Ciências da Religião (IPEMIG)</li>
                        <li>• Pós-graduando em Gestão Pública (UNIASSELVI)</li>
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-bold text-lg text-navy dark:text-gold flex items-center gap-2 mb-3">
                        <BookOpen className="h-5 w-5" />
                        Trajetória Ministerial
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Nascido em Esplanada – BA, cristão desde a infância, dedicou-se desde cedo ao estudo das 
                        Sagradas Escrituras. Aos 13 anos, já ministrava a Palavra em sua igreja local. Aos 15 anos, 
                        passou a ser convidado para ministrar em outras localidades. Atualmente, é professor de 
                        teologia com especializações em diversas áreas bíblicas, além de atuar no ensino de Juiz de Paz, 
                        Juiz Arbitral, Capelania e Direitos Humanos.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Entre Rios, Bahia</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pastora Thelma */}
          <Card className="mb-8 overflow-hidden border-gold/30">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-3 gap-0">
                <div className="md:col-span-1 md:order-last bg-gradient-to-br from-gold/20 to-gold/10 p-6 flex flex-col items-center justify-center">
                  <img 
                    src={pastoraThelma}
                    alt="Pastora Thelma Santana Menezes Santos"
                    className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover border-4 border-gold shadow-xl"
                  />
                  <h3 className="text-xl font-bold mt-4 text-center">
                    Pastora Thelma Santana Menezes Santos
                  </h3>
                  <Badge className="bg-gold text-navy mt-2">Vice-Presidente Nacional</Badge>
                </div>
                <div className="md:col-span-2 p-6 md:p-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-lg text-navy dark:text-gold flex items-center gap-2 mb-3">
                        <Users className="h-5 w-5" />
                        Cargos e Funções
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                          <span>Vice-Presidente Nacional da CEMADEB</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                          <span>Co-fundadora e Presidente da IADMA</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                          <span>Presidente da UFEMADEB</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                          <span>Diretora da FAITEL</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                          <span>Líder da SECC</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                          <span>Escritora</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-bold text-lg text-navy dark:text-gold flex items-center gap-2 mb-3">
                        <GraduationCap className="h-5 w-5" />
                        Formação Acadêmica e Profissional
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          Sargento da PM/AL (Polícia Militar de Alagoas)
                        </li>
                        <li className="flex items-center gap-2">
                          <Scale className="h-4 w-4 text-amber-600" />
                          Bacharel em Direito
                        </li>
                        <li className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-purple-600" />
                          Bacharel em Teologia
                        </li>
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-bold text-lg text-navy dark:text-gold flex items-center gap-2 mb-3">
                        <Heart className="h-5 w-5" />
                        Vida Pessoal
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Casada há <strong>26 anos</strong> com o Pastor Valdinei C. Santos, juntos presidem a IADMA 
                        e lideram todas as frentes ministeriais. Mãe de três filhos — Mikaellem Thamily, Mirelly Victória 
                        e Samuel —, sogra do Pastor Fabrício e avó do pequeno Aleph. Uma mulher dedicada à família, 
                        ao ministério e à formação de líderes.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Entre Rios, Bahia</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Família */}
        <section className="mb-16">
          <Card className="bg-gradient-to-br from-gold/10 to-gold/5 border-gold/30">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="h-6 w-6 text-gold" />
                <h3 className="text-xl font-bold">Família Pastoral</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                O Pastor Valdinei e a Pastora Thelma Santos são casados há 26 anos e juntos lideram todas as 
                instituições ministeriais. São pais de três filhos: <strong>Mikaellem Thamily</strong>, 
                <strong> Mirelly Victória</strong> e <strong>Samuel</strong>. Também são sogros do Pastor Fabrício 
                e avós do pequeno Aleph. A família reside atualmente na cidade de Entre Rios, estado da Bahia, 
                de onde coordenam as atividades da CEMADEB, IADMA, FAITEL e demais instituições.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-12" />

        {/* Liderança CEMADEB Europa */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-10 bg-blue-500 rounded-full"></div>
            <h2 className="text-2xl md:text-3xl font-bold">CEMADEB Europa</h2>
          </div>

          <Card className="overflow-hidden border-blue-500/30">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-3 gap-0">
                <div className="md:col-span-1 bg-gradient-to-br from-blue-600 to-blue-800 p-6 flex flex-col items-center justify-center">
                  <img 
                    src={pastorEtienne}
                    alt="Pastor Etienne Claude"
                    className="w-48 h-48 md:w-56 md:h-56 rounded-full object-cover border-4 border-white shadow-xl"
                  />
                  <h3 className="text-xl font-bold text-white mt-4 text-center">
                    Pastor Etienne Claude
                  </h3>
                  <Badge className="bg-white text-blue-700 mt-2">Presidente CEMADEB Europa</Badge>
                </div>
                <div className="md:col-span-2 p-6 md:p-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-lg text-navy dark:text-gold flex items-center gap-2 mb-3">
                        <Users className="h-5 w-5" />
                        Cargos e Funções
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Presidente da CEMADEB Europa</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Diretor da FAITEL – Extensão Europa</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Presidente da Assemblèe de Dieus International ACTes 2.52</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Campeão Internacional de Jiu-Jitsu</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Ministro filiado à CEMADEB e à CADB</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-bold text-lg text-navy dark:text-gold flex items-center gap-2 mb-3">
                        <Building2 className="h-5 w-5" />
                        Missão na Europa
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Empossado durante a 30ª AGO da CEMADEB em setembro de 2025, o Pastor Etienne Claude 
                        tem a missão de levar para o continente europeu todo o material teológico da FAITEL, 
                        os currículos completos da Escola Bíblica e o SECC – Sistema de Educação Continuada Cristã. 
                        Essa expansão educacional representa um passo gigantesco para a convenção, que agora 
                        oferece formação, capacitação e educação teológica padronizada em território europeu.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Pastor Handerson - Vice-Presidente Europa */}
          <Card className="mt-6 overflow-hidden border-blue-500/30">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-3 gap-0">
                <div className="md:col-span-1 md:order-last bg-gradient-to-br from-blue-500 to-blue-700 p-6 flex flex-col items-center justify-center">
                  <img 
                    src={pastorHanderson}
                    alt="Pastor Handerson de Oliveira"
                    className="w-48 h-48 md:w-56 md:h-56 rounded-full object-cover border-4 border-white shadow-xl"
                  />
                  <h3 className="text-xl font-bold text-white mt-4 text-center">
                    Pastor Handerson de Oliveira
                  </h3>
                  <Badge className="bg-white text-blue-700 mt-2">Vice-Presidente CEMADEB Europa</Badge>
                </div>
                <div className="md:col-span-2 p-6 md:p-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-lg text-navy dark:text-gold flex items-center gap-2 mb-3">
                        <Users className="h-5 w-5" />
                        Cargos e Funções
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Vice-Presidente da CEMADEB na Europa</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Vice-Diretor Internacional da FAITEL na Europa</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Pastor da Assemblèe de Dieus International ACTes 2.52 – França</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Ministro filiado à CEMADEB e à CADB</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Empresário</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-bold text-lg text-navy dark:text-gold flex items-center gap-2 mb-3">
                        <Building2 className="h-5 w-5" />
                        Posse e Missão
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Empossado durante a 30ª Assembleia Geral Ordinária (AGO) da CEMADEB na Bahia, 
                        o Pastor Handerson de Oliveira foi indicado e eleito por unanimidade pela Mesa Diretora Nacional 
                        e por todo o plenário. O pastor, que exerce seu ministério na França, pastoreia uma filial da 
                        Assemblèe de Dieus International ACTes 2.52, denominação conduzida mundialmente pelo Pastor 
                        Etienne Claude. Sua atuação como Vice-Diretor Internacional da FAITEL fortalecerá a presença 
                        da faculdade entre pastores, missionários e alunos europeus.
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-bold text-lg text-navy dark:text-gold flex items-center gap-2 mb-3">
                        <Heart className="h-5 w-5" />
                        Vida Pessoal
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Casado com a Pastora Haira Menezes, pai dedicado e empresário. O Pastor Handerson 
                        pastoreia e reside na cidade de Nice, capital do departamento dos Alpes Marítimos, 
                        na Riviera Francesa, onde desenvolve um ministério frutífero, acolhedor e alinhado 
                        aos princípios bíblicos, representando grande responsabilidade na expansão e 
                        fortalecimento da obra ministerial no continente europeu.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Nice, Alpes Marítimos – Riviera Francesa</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pastor Leonardo Kohpcke - Vice-Presidente Europa */}
          <Card className="mt-6 overflow-hidden border-emerald-500/30">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-3 gap-0">
                <div className="md:col-span-1 bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 flex flex-col items-center justify-center">
                  <img 
                    src={pastorLeonardo}
                    alt="Pastor Leonardo Kohpcke"
                    className="w-48 h-48 md:w-56 md:h-56 rounded-full object-cover border-4 border-white shadow-xl"
                    style={{ objectPosition: 'center 10%' }}
                  />
                  <h3 className="text-xl font-bold text-white mt-4 text-center">
                    Pastor Leonardo Kohpcke
                  </h3>
                  <Badge className="bg-white text-emerald-700 mt-2">Vice-Presidente CEMADEB Europa</Badge>
                </div>
                <div className="md:col-span-2 p-6 md:p-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-lg text-navy dark:text-gold flex items-center gap-2 mb-3">
                        <Users className="h-5 w-5" />
                        Cargos e Funções
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>Vice-Presidente da CEMADEB na Europa</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>Líder na Assemblèe de Dieus International ACTes 2.52</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>Empresário</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>Campeão Internacional de Jiu-Jitsu na França</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>Campeão de Surfe</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>Ministro filiado à CEMADEB e à CADB</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-bold text-lg text-navy dark:text-gold flex items-center gap-2 mb-3">
                        <Building2 className="h-5 w-5" />
                        Posse e Missão
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Empossado durante a 30ª Assembleia Geral Ordinária da CEMADEB, o Pastor Leonardo Kohpcke 
                        foi oficialmente reconhecido como Vice-Presidente da CEMADEB na Europa, recebendo a 
                        responsabilidade de contribuir diretamente para o fortalecimento, a organização e a 
                        expansão ministerial no continente. Atua lado a lado com o Pastor Etienne Claude e o 
                        Pastor Handerson de Oliveira, formando um tripé de organização, estratégia e visão 
                        para o crescimento da CEMADEB, da FAITEL e da ACTes 2.52 em território europeu.
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-bold text-lg text-navy dark:text-gold flex items-center gap-2 mb-3">
                        <Award className="h-5 w-5" />
                        Expansão 2025
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Com uma equipe europeia ampla e dinâmica já em pleno funcionamento, a partir de janeiro 
                        iniciaremos uma grande ofensiva espiritual e acadêmica, abrindo frentes de estudo, 
                        capacitação, formação teológica, discipulado e desenvolvimento de lideranças em múltiplos 
                        países da Europa. O Pastor Leonardo, com sua experiência, disciplina esportiva, visão 
                        empresarial e paixão pela obra missionária, representa a nova geração de líderes preparados 
                        para servir com excelência.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>França</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pastora Haira Menezes */}
          <Card className="mt-8 overflow-hidden border-pink-500/30 bg-gradient-to-br from-pink-50/50 to-purple-50/50 dark:from-pink-950/20 dark:to-purple-950/20">
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-5 gap-0">
                {/* Imagem */}
                <div className="lg:col-span-2 relative">
                  <div className="h-full min-h-[400px] bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center p-8">
                    <img 
                      src={pastoraHaira}
                      alt="Pastora Haira Menezes"
                      className="w-72 h-auto object-contain drop-shadow-2xl"
                    />
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-pink-500 text-white shadow-lg">
                      Tradutora Internacional
                    </Badge>
                  </div>
                </div>

                {/* Informações */}
                <div className="lg:col-span-3 p-6 lg:p-8 space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="border-pink-500 text-pink-700 dark:text-pink-400">
                        FAITEL & WST Editora
                      </Badge>
                      <Badge variant="outline" className="border-purple-500 text-purple-700 dark:text-purple-400">
                        Europa
                      </Badge>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-navy dark:text-gold">
                      Pastora Haira Menezes
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      Tradutora Internacional da FAITEL e WST Editora
                    </p>
                  </div>

                  <div className="bg-pink-100/50 dark:bg-pink-900/20 rounded-lg p-4 border-l-4 border-pink-500">
                    <p className="text-sm italic text-muted-foreground">
                      "Mulher dedicada a Deus, mãe, líder e serva incansável, uma referência de graça, 
                      compromisso e sensibilidade ministerial no continente europeu."
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-bold text-lg text-navy dark:text-gold flex items-center gap-2 mb-3">
                      <Award className="h-5 w-5" />
                      Nomeação Internacional
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Durante a 30ª Assembleia Geral Ordinária da CEMADEB, a Pastora Haira Menezes foi 
                      eleita e oficialmente reconhecida como Tradutora Internacional da FAITEL e da 
                      WST Editora e Gráfica no Brasil. A nomeação ocorre devido à necessidade estratégica 
                      de traduzir para o francês todo o vasto material produzido pelas instituições, 
                      acompanhando a expansão da FAITEL na Europa.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg text-navy dark:text-gold flex items-center gap-2 mb-3">
                      <BookOpen className="h-5 w-5" />
                      Materiais a Traduzir
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <Award className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
                        <span>Revistas de Escola Bíblica do SECC – Sistema de Educação Continuada Cristã</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Award className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
                        <span>Livros acadêmicos e teológicos da FAITEL</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Award className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
                        <span>Obras diversas da WST Editora para países francófonos</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-bold text-lg text-navy dark:text-gold flex items-center gap-2 mb-3">
                      <Heart className="h-5 w-5" />
                      Ministério e Vida Pessoal
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Esposa do Pastor Handerson de Oliveira, a Pastora Haira exerce seu ministério 
                      na Assemblèe de Dieus International ACTes 2.52, denominação conduzida mundialmente 
                      pelo Pastor Etienne Claude. Residente em Nice, na Riviera Francesa, ela se destaca 
                      por sua firmeza doutrinária, sua paixão pela Palavra e seu amor pela obra missionária. 
                      Com habilidade linguística, preparo teológico e profundo compromisso com a missão de Deus, 
                      torna-se um elo entre a produção teológica brasileira e o crescente público europeu.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Nice, Alpes Marítimos – Riviera Francesa</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-12" />

        {/* Liderança CEMADEB Bahia */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-10 bg-green-500 rounded-full"></div>
            <h2 className="text-2xl md:text-3xl font-bold">CEMADEB Bahia</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="overflow-hidden border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <img 
                    src={pastorClaudino}
                    alt="Pastor Claudino Naciso Júnior"
                    className="w-20 h-20 rounded-full object-cover border-2 border-green-500"
                  />
                  <div>
                    <Badge className="bg-green-500 text-white mb-2">Presidente CEMADEB Bahia</Badge>
                    <h3 className="font-bold text-lg">Pastor Claudino Naciso Júnior</h3>
                    <p className="text-sm text-muted-foreground">Mandato 2025-2028</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground">
                  Empossado na 30ª AGO da CEMADEB, lidera a convenção no estado da Bahia, 
                  dando continuidade ao trabalho de expansão e fortalecimento das igrejas 
                  associadas em todo o território baiano.
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-navy/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <img 
                    src={pastorAdemir}
                    alt="Pastor Ademir Sacramento"
                    className="w-20 h-20 rounded-full object-cover border-2 border-navy"
                  />
                  <div>
                    <Badge className="bg-navy text-white mb-2">Sede IADMA Bahia</Badge>
                    <h3 className="font-bold text-lg">Pastor Ademir Sacramento</h3>
                    <p className="text-sm text-muted-foreground">Pastora Ruthe Sacramento</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground">
                  O Pastor Ademir e a Pastora Ruthe Sacramento lideram a Sede da IADMA na Bahia, 
                  dando continuidade ao trabalho missionário e pastoral estabelecido pelo 
                  casal fundador.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16">
          <Card className="bg-gradient-to-br from-navy to-navy-light text-white overflow-hidden">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Faça Parte da Nossa História</h3>
              <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                A CEMADEB e a IADMA continuam crescendo e levando a mensagem do Evangelho 
                para o Brasil e o mundo. Junte-se a nós nessa missão!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/cadastrar-igreja">
                  <Button className="bg-gold text-navy hover:bg-gold/90">
                    Cadastrar Igreja
                  </Button>
                </Link>
                <Link to="/noticias/ago-30-cemadeb">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    Leia sobre a 30ª AGO
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Galeria de Fotos */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-10 bg-gold rounded-full"></div>
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Camera className="h-8 w-8 text-gold" />
              Galeria de Eventos e Atividades
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((image, index) => (
              <div 
                key={index}
                className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => openLightbox(index)}
              >
                <img 
                  src={image.src} 
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h4 className="text-white font-bold text-sm md:text-base">{image.title}</h4>
                    <p className="text-white/80 text-xs md:text-sm line-clamp-2">{image.description}</p>
                  </div>
                </div>
                <div className="absolute top-3 right-3 bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="h-4 w-4 text-navy" />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/galeria-agos">
              <Button className="bg-gold text-navy hover:bg-gold/90">
                <Camera className="h-4 w-4 mr-2" />
                Ver Galeria Completa de AGOs
              </Button>
            </Link>
          </div>

          <p className="text-center text-muted-foreground mt-6 text-sm">
            Clique nas imagens para visualizar em tela cheia
          </p>
        </section>
      </main>

      {/* Lightbox Modal */}
      <Dialog open={selectedImage !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-5xl w-full p-0 bg-black/95 border-none">
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 h-12 w-12"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 h-12 w-12"
              onClick={goToNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>

            {selectedImage !== null && (
              <div className="flex flex-col items-center">
                <img 
                  src={galleryImages[selectedImage].src}
                  alt={galleryImages[selectedImage].title}
                  className="max-h-[70vh] max-w-full object-contain rounded-lg"
                />
                <div className="text-center mt-4 text-white">
                  <h3 className="text-xl font-bold">{galleryImages[selectedImage].title}</h3>
                  <p className="text-white/70">{galleryImages[selectedImage].description}</p>
                </div>
              </div>
            )}

            {/* Thumbnails */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    selectedImage === index ? "bg-gold w-4" : "bg-white/50 hover:bg-white/80"
                  }`}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-navy text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/60 text-sm">
            © 2025 SISCOF - Sistema Integrado de Igrejas, Convenções e Faculdades. 
            Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
