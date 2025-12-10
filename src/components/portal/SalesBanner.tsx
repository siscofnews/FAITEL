import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, CheckCircle, Users, Church, Star, GraduationCap, ArrowRight } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";

const stats = [
  { value: "5.000+", label: "Igrejas Cadastradas" },
  { value: "100K+", label: "Membros Ativos" },
  { value: "4.9★", label: "Avaliação Média" },
];

const features = [
  "Gestão completa de membros e visitantes",
  "Controle financeiro com relatórios",
  "Escola de Culto Online (EAD)",
  "Sistema de Escalas ministeriais",
  "App para membros e líderes",
];

export function SalesBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#4a5d23] via-[#5d6f2e] to-[#6b7f3a] py-16 md:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Zap className="h-4 w-4 text-gold" />
              <span className="text-sm font-medium">
                <TranslatedText>Sistema #1 para Gestão de Igrejas</TranslatedText>
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <TranslatedText>O Sistema Mais</TranslatedText>{" "}
              <span className="text-gold italic"><TranslatedText>Completo</TranslatedText></span>{" "}
              <TranslatedText>para sua Igreja</TranslatedText>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
              <TranslatedText>Gerencie membros, finanças, eventos, escola bíblica e muito mais em uma única plataforma moderna, intuitiva e fácil de usar.</TranslatedText>
            </p>
            
            {/* Features List */}
            <ul className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-white/90">
                  <CheckCircle className="h-5 w-5 text-gold flex-shrink-0" />
                  <TranslatedText>{feature}</TranslatedText>
                </li>
              ))}
            </ul>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/login">
                <Button 
                  size="lg" 
                  className="bg-gold hover:bg-gold/90 text-navy font-bold text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  <TranslatedText>Assinar Agora</TranslatedText>
                </Button>
              </Link>
              <a href="#funcionalidades">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white font-semibold text-lg px-8 py-6 rounded-full"
                >
                  <TranslatedText>Ver Funcionalidades</TranslatedText>
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </a>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center sm:text-left">
                  <div className="text-3xl md:text-4xl font-bold text-gold mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/70">
                    <TranslatedText>{stat.label}</TranslatedText>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Image / Dashboard Preview */}
          <div className="relative hidden lg:block">
            <div className="relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop" 
                alt="Dashboard SISCOF - Sistema de Gestão de Igrejas"
                className="rounded-2xl shadow-2xl border-4 border-white/20"
              />
              
              {/* Floating Cards */}
              <div className="absolute -top-6 -left-6 bg-white rounded-xl p-4 shadow-xl animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                    <Church className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <div className="font-bold text-navy">+2.500</div>
                    <div className="text-xs text-muted-foreground">
                      <TranslatedText>Igrejas este mês</TranslatedText>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-4 shadow-xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-bold text-navy"><TranslatedText>EAD Completo</TranslatedText></div>
                    <div className="text-xs text-muted-foreground">
                      <TranslatedText>Escola de Culto Online</TranslatedText>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-1/2 -right-4 bg-white rounded-xl p-4 shadow-xl animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-navy">100K+</div>
                    <div className="text-xs text-muted-foreground">
                      <TranslatedText>Usuários ativos</TranslatedText>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gold/20 blur-3xl rounded-full scale-75" />
          </div>
        </div>
      </div>
      
      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path 
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}
