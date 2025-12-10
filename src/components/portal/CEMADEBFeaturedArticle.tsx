import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Globe, Users, GraduationCap, Church, ArrowRight } from "lucide-react";
import pastorEtienne from "@/assets/pastor-etienne-claude.jpg";
import pastorClaudino from "@/assets/pastor-claudino.jpg";
import pastorJota from "@/assets/pastor-jota.jpg";
import pastorEvilazio from "@/assets/pastor-evilazio.jpg";
import pastorAdemir from "@/assets/pastor-ademir-sacramento.jpg";
import pastoraThelma from "@/assets/pastora-thelma.jpg";

export function CEMADEBFeaturedArticle() {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="w-1 h-8 bg-gold rounded-full"></span>
          Destaque CEMADEB
        </h2>
        <Badge className="bg-red-500 text-white animate-pulse">NOTÍCIA HISTÓRICA</Badge>
      </div>
      
      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-navy via-navy-light to-navy">
        <div className="grid lg:grid-cols-3 gap-0">
          {/* Image Section */}
          <div className="relative lg:col-span-1">
            <img 
              src={pastorEtienne}
              alt="Pastor Etienne Claude"
              className="w-full h-64 lg:h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent lg:bg-gradient-to-r" />
            <div className="absolute bottom-4 left-4 lg:hidden">
              <p className="text-white font-bold">Pastor Etienne Claude</p>
              <p className="text-gold text-sm">Presidente CEMADEB Europa</p>
            </div>
          </div>
          
          {/* Content Section */}
          <div className="lg:col-span-2 p-6 lg:p-8 text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-gold text-navy">30ª AGO</Badge>
                <Badge variant="outline" className="border-gold/50 text-gold">Posse Histórica</Badge>
                <Badge variant="outline" className="border-white/30 text-white/80">Set 2025</Badge>
              </div>
              
              <h3 className="text-2xl lg:text-3xl font-bold mb-4 leading-tight">
                CEMADEB celebra posse histórica do Pastor Etienne Claude e anuncia expansão internacional
              </h3>
              
              <p className="text-white/80 mb-6 line-clamp-3 lg:line-clamp-none">
                A 30ª Assembleia Geral Ordinária da CEMADEB consolidou oficialmente um novo tempo para a instituição, 
                marcada por crescimento, internacionalização e transições estratégicas durante o evento realizado 
                entre 18 e 21 de setembro de 2025 na sede nacional em Entre Rios – BA.
              </p>

              {/* Key Highlights */}
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
                  <Globe className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Presença Internacional</p>
                    <p className="text-white/70 text-xs">7 países, 16 estados, 108 municípios</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
                  <Users className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Ministros Ativos</p>
                    <p className="text-white/70 text-xs">Mais de 1.010 ministros cadastrados</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
                  <GraduationCap className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">FAITEL Europa</p>
                    <p className="text-white/70 text-xs">Extensão oficial para o continente europeu</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
                  <Church className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">IADMA 26 Anos</p>
                    <p className="text-white/70 text-xs">Celebração da trajetória missionária</p>
                  </div>
                </div>
              </div>

              {/* Pastor Info Card */}
              <Card className="bg-white/10 border-gold/30 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={pastorEtienne}
                      alt="Pastor Etienne Claude"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gold hidden lg:block"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-white">Pastor Etienne Claude</p>
                      <p className="text-gold text-sm mb-1">Presidente da Assemblèe de Dieus International ACTes 2.52</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="text-white/70">✅ Presidência CEMADEB Europa</span>
                        <span className="text-white/70">✅ Direção FAITEL Europa</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quote */}
              <blockquote className="border-l-4 border-gold pl-4 italic text-white/80 text-sm mb-6">
                "Poderíamos enviar qualquer um dos nossos pastores, mas Deus escolheu a nós. Esta mudança é exclusivamente 
                para um avanço maior da IADMA e da CEMADEB no Brasil e no exterior."
                <footer className="text-gold mt-2 not-italic font-semibold">
                  — Pastor Valdinei C. Santos e Pastora Thelma Santos
                </footer>
              </blockquote>

              {/* Event Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> 18-21 Set 2025
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> Entre Rios, BA
                </span>
                <Link to="/noticias/ago-30-cemadeb" className="flex items-center gap-1 text-gold hover:underline ml-auto">
                  Ler matéria completa <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* New Leadership */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <Link to="/lideranca" className="block">
          <Card className="bg-muted/50 border-0 hover:bg-muted/70 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <img 
                src={pastoraThelma}
                alt="Pastora Thelma Santana Menezes Santos"
                className="w-14 h-14 rounded-full object-cover border-2 border-gold"
              />
              <div>
                <Badge className="bg-gold/20 text-gold mb-2">Vice-Presidente CEMADEB</Badge>
                <p className="font-bold">Pastora Thelma S. M. Santos</p>
                <p className="text-sm text-muted-foreground">Vice-Presidente Nacional</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/lideranca" className="block">
          <Card className="bg-muted/50 border-0 hover:bg-muted/70 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <img 
                src={pastorJota}
                alt="Pastor Jota"
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500"
              />
              <div>
                <Badge className="bg-emerald-500/20 text-emerald-600 mb-2">CEMADEB Bahia</Badge>
                <p className="font-bold">Pastor Jota</p>
                <p className="text-sm text-muted-foreground">1º Vice-Presidente</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/lideranca" className="block">
          <Card className="bg-muted/50 border-0 hover:bg-muted/70 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <img 
                src={pastorEvilazio}
                alt="Pastor Evilázio"
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-600"
              />
              <div>
                <Badge className="bg-emerald-600/20 text-emerald-700 mb-2">CEMADEB Bahia</Badge>
                <p className="font-bold">Pastor Evilázio</p>
                <p className="text-sm text-muted-foreground">2º Vice-Presidente</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/lideranca" className="block">
          <Card className="bg-muted/50 border-0 hover:bg-muted/70 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <img 
                src={pastorAdemir}
                alt="Pastor Ademir Sacramento"
                className="w-14 h-14 rounded-full object-cover border-2 border-navy"
              />
              <div>
                <Badge className="bg-navy/20 text-navy mb-2">Sede IADMA Bahia</Badge>
                <p className="font-bold">Pastor Ademir Sacramento</p>
                <p className="text-sm text-muted-foreground">Pastora Ruthe Sacramento</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/lideranca" className="block md:col-span-2 lg:col-span-1">
          <Card className="bg-muted/50 border-0 hover:bg-muted/70 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <img 
                src={pastorClaudino}
                alt="Pastor Claudino Naciso Júnior"
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
              />
              <div>
                <Badge className="bg-blue-500/20 text-blue-600 mb-2">CEMADEB Bahia</Badge>
                <p className="font-bold">Pastor Claudino Naciso Júnior</p>
                <p className="text-sm text-muted-foreground">Presidente - Mandato 2025-2028</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      {/* Link to Leadership Page */}
      <div className="mt-4 text-center">
        <Link 
          to="/lideranca" 
          className="inline-flex items-center gap-2 text-gold hover:underline font-semibold"
        >
          Conheça todos os líderes <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
