import { Button } from "@/components/ui/button";
import { Shield, Award, Users, BookOpen, ArrowRight, Scale } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";

const CFIDHBanner = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-amber-950 via-stone-900 to-stone-950 py-16 md:py-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Glow Effects */}
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-yellow-600/10 rounded-full blur-2xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-2 text-amber-400 text-sm font-medium backdrop-blur-sm">
              <Scale className="w-4 h-4" />
              <span>Decreto Federal Lei 6.044/2007</span>
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-amber-500">C.F.I.D.H.</span>
              <br />
              <span className="text-white">Conselho e Federação</span>
              <br />
              <span className="text-amber-100/90 text-3xl md:text-4xl lg:text-5xl">
                Investigativa dos Direitos Humanos
              </span>
            </h2>

            {/* Description */}
            <p className="text-amber-100/70 text-lg md:text-xl max-w-xl">
              <TranslatedText>Formação profissional em Direitos Humanos com certificação reconhecida. Seja um agente transformador na defesa dos direitos fundamentais.</TranslatedText>
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="flex items-center gap-3 text-amber-100/80">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-sm"><TranslatedText>Certificação Legal</TranslatedText></span>
              </div>
              <div className="flex items-center gap-3 text-amber-100/80">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-sm">100% EAD</span>
              </div>
              <div className="flex items-center gap-3 text-amber-100/80">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-sm"><TranslatedText>Material Completo</TranslatedText></span>
              </div>
              <div className="flex items-center gap-3 text-amber-100/80">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-sm"><TranslatedText>Suporte Integral</TranslatedText></span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-stone-900 font-bold px-8 shadow-lg shadow-amber-500/30 transition-all hover:shadow-amber-500/50 hover:scale-105"
                onClick={() => window.open('https://cfidh-direitos-humans.lovable.app/cadastro', '_blank')}
              >
                <TranslatedText>Fazer Cadastro</TranslatedText>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 px-8"
                onClick={() => window.open('https://cfidh-direitos-humans.lovable.app/#cursos', '_blank')}
              >
                <TranslatedText>Ver Cursos</TranslatedText>
              </Button>
            </div>
          </div>

          {/* Right Content - Badge/Shield Visual */}
          <div className="relative flex justify-center items-center">
            {/* Glow behind badge */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-80 h-80 bg-gradient-to-br from-amber-500/30 to-yellow-600/20 rounded-full blur-3xl animate-pulse" />
            </div>
            
            {/* Badge Image */}
            <div className="relative">
              <img 
                src="https://cfidh-direitos-humans.lovable.app/assets/brasao-cfidh-DM3pGy-T.png" 
                alt="Brasão CFIDH - Conselho e Federação Investigativa dos Direitos Humanos"
                className="w-72 md:w-80 lg:w-96 h-auto drop-shadow-2xl animate-fade-in"
                style={{
                  filter: 'drop-shadow(0 0 40px rgba(217, 119, 6, 0.4))'
                }}
              />
            </div>

            {/* Stats Cards */}
            <div className="absolute -bottom-4 left-0 bg-stone-900/90 backdrop-blur-sm border border-amber-500/30 rounded-xl px-4 py-3 shadow-xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-2xl font-bold text-amber-400">27</div>
              <div className="text-xs text-amber-100/60"><TranslatedText>Diretorias Estaduais</TranslatedText></div>
            </div>

            <div className="absolute -top-4 right-0 bg-stone-900/90 backdrop-blur-sm border border-amber-500/30 rounded-xl px-4 py-3 shadow-xl animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="text-2xl font-bold text-amber-400">2.8k+</div>
              <div className="text-xs text-amber-100/60"><TranslatedText>Filiados Ativos</TranslatedText></div>
            </div>

            <div className="absolute top-1/2 -right-4 bg-stone-900/90 backdrop-blur-sm border border-amber-500/30 rounded-xl px-4 py-3 shadow-xl animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="text-2xl font-bold text-amber-400">156</div>
              <div className="text-xs text-amber-100/60"><TranslatedText>Coordenadorias</TranslatedText></div>
            </div>
          </div>
        </div>

        {/* Bottom Features */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-amber-500/20 pt-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400 mb-1">10+</div>
            <div className="text-sm text-amber-100/60"><TranslatedText>Anos de História</TranslatedText></div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400 mb-1">100%</div>
            <div className="text-sm text-amber-100/60"><TranslatedText>Online ou Presencial</TranslatedText></div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400 mb-1">Federal</div>
            <div className="text-sm text-amber-100/60"><TranslatedText>Reconhecimento</TranslatedText></div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400 mb-1">Nacional</div>
            <div className="text-sm text-amber-100/60"><TranslatedText>Certificação Válida</TranslatedText></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CFIDHBanner;
