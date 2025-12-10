import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Users, Globe, BookOpen, Award } from "lucide-react";
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

const partners = [
  {
    id: "siscof",
    name: "SISCOF",
    logo: logoSiscof,
    shortDescription: "Sistema de Gestão Eclesiástica",
    fullDescription: "O SISCOF é uma plataforma integrada de gestão eclesiástica que oferece ferramentas completas para administração de igrejas, escolas de culto online, escalas ministeriais e gestão de pessoas. Com tecnologia de ponta, o sistema atende desde pequenas congregações até grandes ministérios.",
    highlights: ["Gestão de múltiplas igrejas", "Escola de Culto Online", "Sistema de Escalas", "Controle Financeiro"],
    stats: { churches: "500+", users: "10.000+", countries: "6" }
  },
  {
    id: "faitel",
    name: "FAITEL",
    logo: logoFaitel,
    shortDescription: "Faculdade Internacional Teológica de Líderes",
    fullDescription: "A FAITEL é uma instituição de ensino superior dedicada à formação teológica e ministerial de líderes cristãos. Com cursos reconhecidos e corpo docente qualificado, a faculdade prepara obreiros para o ministério com excelência acadêmica e espiritual.",
    highlights: ["Cursos de Teologia", "Formação de Líderes", "EAD e Presencial", "Certificação Reconhecida"],
    stats: { students: "2.000+", courses: "15+", graduates: "5.000+" }
  },
  {
    id: "cfidh",
    name: "CFIDH",
    logo: logoCfidh,
    shortDescription: "Conselho e Federação Investigativa dos Direitos Humanos",
    fullDescription: "O CFIDH atua na defesa e promoção dos direitos humanos, com foco especial na comunidade evangélica. A organização trabalha em parceria com igrejas e ministérios para garantir a liberdade religiosa e os direitos fundamentais dos cristãos.",
    highlights: ["Defesa dos Direitos Humanos", "Liberdade Religiosa", "Assessoria Jurídica", "Advocacy"],
    stats: { cases: "1.000+", states: "27", years: "10+" }
  },
  {
    id: "cemadeb",
    name: "CEMADEB",
    logo: logoCemadeb,
    shortDescription: "Convenção Evangélica de Ministros das Assembleias de Deus no Exterior e no Brasil",
    fullDescription: "A CEMADEB é uma convenção evangélica fraternal e interdenominacional, fundada em 14/07/2007. Apesar de ser uma convenção das Assembleias de Deus, filia todas as denominações evangélicas, ajudando igrejas grandes e pequenas no Brasil e no mundo. Com 18 anos de história, possui mais de 1.000 pastores filiados em 17 estados brasileiros, 108 municípios da Bahia e presença em 6 países.",
    highlights: ["Interdenominacional", "Cobertura Pastoral", "Credenciamento", "Rede de Apoio"],
    stats: { pastors: "1.000+", states: "17", countries: "6", municipalities: "108" }
  },
  {
    id: "iadma",
    name: "IADMA",
    logo: logoIadma,
    shortDescription: "Igreja Assembleia de Deus Missão Apostólica",
    fullDescription: "A IADMA é uma denominação comprometida com a proclamação do Evangelho e o discipulado de vidas. Com sede na Bahia, a igreja tem expandido sua atuação por todo o Brasil e exterior, formando discípulos e plantando novas congregações.",
    highlights: ["Evangelismo", "Discipulado", "Plantação de Igrejas", "Missões"],
    stats: { churches: "50+", members: "5.000+", states: "10+" }
  },
  {
    id: "setepos",
    name: "SETEPOS",
    logo: logoSetepos,
    shortDescription: "Seminário Evangélico para Obreiros",
    fullDescription: "O SETEPOS oferece formação teológica e ministerial para obreiros e líderes cristãos. Com cursos práticos e fundamentados nas Escrituras, o seminário prepara homens e mulheres para o serviço no Reino de Deus.",
    highlights: ["Formação Teológica", "Cursos Práticos", "Mentoria Pastoral", "Certificação"],
    stats: { students: "500+", courses: "10+", graduates: "2.000+" }
  },
  {
    id: "secc",
    name: "SECC",
    logo: logoSecc,
    shortDescription: "Sistema de Educação Continuada Cristã",
    fullDescription: "O SECC é uma plataforma de educação continuada voltada para o desenvolvimento espiritual e ministerial de cristãos. Com cursos online e presenciais, oferece capacitação constante para líderes e membros de igrejas.",
    highlights: ["Educação Continuada", "Plataforma Online", "Cursos Diversos", "Atualização Constante"],
    stats: { courses: "50+", students: "3.000+", hours: "500+" }
  },
  {
    id: "wst",
    name: "WST Gráfica e Editora",
    logo: logoWst,
    shortDescription: "Editora e Gráfica especializada em materiais cristãos",
    fullDescription: "A WST Gráfica e Editora é especializada na produção de materiais gráficos para igrejas e ministérios. Com alta qualidade e compromisso com a excelência, oferece serviços completos de impressão e design.",
    highlights: ["Materiais Gráficos", "Design Personalizado", "Alta Qualidade", "Atendimento Dedicado"],
    stats: { years: "10+", clients: "500+", projects: "2.000+" }
  },
  {
    id: "ibma",
    name: "IBMA",
    logo: logoIbma,
    shortDescription: "Instituto Brasil Mão Amiga",
    fullDescription: "O IBMA é uma organização dedicada à assistência social e humanitária, promovendo ações de solidariedade e apoio às comunidades carentes.",
    highlights: ["Assistência Social", "Ação Humanitária", "Solidariedade", "Apoio Comunitário"],
    stats: { families: "1.000+", projects: "50+", volunteers: "200+" }
  },
  {
    id: "cec",
    name: "CEC",
    logo: logoCec,
    shortDescription: "Conselho de Educação e Cultura da CEMADEB",
    fullDescription: "O CEC é o órgão responsável pela coordenação das ações educacionais e culturais da CEMADEB, promovendo a excelência no ensino e na formação de líderes.",
    highlights: ["Educação Cristã", "Cultura", "Formação de Líderes", "Excelência"],
    stats: { courses: "30+", students: "2.000+", events: "100+" }
  }
];

export default function Parceiros() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-navy text-white py-6">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Portal
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">
            Nossos <span className="text-gold">Parceiros</span> e Afiliados
          </h1>
          <p className="text-white/70 mt-2">
            Instituições comprometidas com a expansão do Reino de Deus
          </p>
        </div>
      </header>

      {/* Partners Grid */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {partners.map((partner) => (
            <Link key={partner.id} to={`/parceiros/${partner.id}`}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted/50 flex items-center justify-center p-2">
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-navy group-hover:text-gold transition-colors">
                        {partner.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {partner.shortDescription}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {partner.fullDescription}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {partner.highlights.slice(0, 3).map((highlight) => (
                      <span
                        key={highlight}
                        className="text-xs bg-gold/10 text-gold px-2 py-1 rounded-full"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-navy to-navy/90 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Quer fazer parte da nossa rede?
          </h2>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            Entre em contato conosco e saiba como sua igreja ou ministério pode se filiar
            à nossa rede de parceiros e afiliados.
          </p>
          <Link to="/login">
            <Button variant="gold" size="lg">
              Entre em Contato
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
