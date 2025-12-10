import { Link } from "react-router-dom";
import { TranslatedText } from "@/components/TranslatedText";
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
    description: "Sistema de Gestão Eclesiástica"
  },
  {
    id: "faitel",
    name: "FAITEL",
    logo: logoFaitel,
    description: "Faculdade Internacional Teológica de Líderes"
  },
  {
    id: "cfidh",
    name: "CFIDH",
    logo: logoCfidh,
    description: "Conselho e Federação Investigativa dos Direitos Humanos"
  },
  {
    id: "cemadeb",
    name: "CEMADEB",
    logo: logoCemadeb,
    description: "18 anos | +1000 pastores | 17 estados | 6 países"
  },
  {
    id: "iadma",
    name: "IADMA",
    logo: logoIadma,
    description: "Igreja Assembleia de Deus Missão Apostólica"
  },
  {
    id: "setepos",
    name: "SETEPOS",
    logo: logoSetepos,
    description: "Seminário Evangélico para Obreiros"
  },
  {
    id: "secc",
    name: "SECC",
    logo: logoSecc,
    description: "Sistema de Educação Continuada Cristã"
  },
  {
    id: "wst",
    name: "WST Gráfica e Editora",
    logo: logoWst,
    description: "Editora e Gráfica especializada em materiais cristãos"
  },
  {
    id: "ibma",
    name: "IBMA",
    logo: logoIbma,
    description: "Instituto Brasil Mão Amiga"
  },
  {
    id: "cec",
    name: "CEC",
    logo: logoCec,
    description: "Conselho de Educação e Cultura da CEMADEB"
  }
];

export function PartnersSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            <TranslatedText>Nossos</TranslatedText> <span className="text-gold"><TranslatedText>Parceiros</TranslatedText></span> <TranslatedText>e Afiliados</TranslatedText>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            <TranslatedText>Instituições comprometidas com a expansão do Reino de Deus e o fortalecimento da Igreja</TranslatedText>
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {partners.map((partner) => (
            <Link
              key={partner.id}
              to={`/parceiros/${partner.id}`}
              className="group flex flex-col items-center p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-border/50"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 mb-4 rounded-xl overflow-hidden bg-muted/50 flex items-center justify-center p-2">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="font-bold text-lg text-navy group-hover:text-gold transition-colors">
                {partner.name}
              </h3>
              <p className="text-xs text-muted-foreground text-center mt-1 line-clamp-2">
                {partner.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-sm text-muted-foreground">
            <TranslatedText>Interessado em fazer parte?</TranslatedText>{" "}
            <Link to="/login" className="text-gold font-semibold hover:underline">
              <TranslatedText>Entre em contato</TranslatedText>
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
