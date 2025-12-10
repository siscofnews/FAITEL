import { Church, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TranslatedText } from "@/components/TranslatedText";
import temploImage from "@/assets/templo-central-iadma.jpg";
import logoIadma from "@/assets/logo-iadma.jpg";
import logoCemadeb from "@/assets/logo-cemadeb.png";

export function FutureTempleBanner() {
  return (
    <section className="py-12 bg-gradient-to-br from-navy via-navy-light to-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-gold blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Image */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-gold to-gold-dark rounded-2xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />
            <img 
              src={temploImage}
              alt="Futuro Templo Central IADMA e CEMADEB"
              className="w-full rounded-2xl shadow-2xl border-4 border-white/10 relative z-10"
            />
            <Badge className="absolute top-4 left-4 bg-gold text-navy font-bold z-20">
              Projeto
            </Badge>
          </div>

          {/* Content */}
          <div className="text-white text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
              <img src={logoIadma} alt="IADMA" className="w-16 h-16 rounded-full border-2 border-gold object-cover" />
              <img src={logoCemadeb} alt="CEMADEB" className="w-16 h-16 rounded-full border-2 border-gold object-contain bg-white p-1" />
            </div>

            <Badge className="bg-gold/20 text-gold border-gold/30 mb-4">
              <Church className="h-3 w-3 mr-1" />
              <TranslatedText>Em Construção</TranslatedText>
            </Badge>

            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">
              <TranslatedText>Futuro Templo Central</TranslatedText>
            </h2>
            
            <h3 className="text-xl md:text-2xl text-gold font-semibold mb-4">
              <TranslatedText>Igreja Assembleia de Deus Missão Apostólica</TranslatedText>
            </h3>

            <p className="text-white/80 text-lg mb-6 max-w-xl">
              <TranslatedText>Sede da IADMA e CEMADEB - Um espaço dedicado à adoração, formação ministerial e expansão do Reino de Deus no Brasil e no mundo.</TranslatedText>
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8">
              <span className="flex items-center gap-2 text-white/70">
                <MapPin className="h-4 w-4 text-gold" />
                Aguaí, São Paulo - Brasil
              </span>
            </div>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Button variant="gold" size="lg" className="gap-2">
                <Heart className="h-4 w-4" />
                <TranslatedText>Contribuir com a Obra</TranslatedText>
              </Button>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                <TranslatedText>Saiba Mais</TranslatedText>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
