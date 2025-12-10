import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  Bell, 
  BarChart3, 
  Globe, 
  Shield, 
  Smartphone,
  Music,
  BookOpen,
  DollarSign,
  UserCheck,
  FileText,
  Zap,
  Heart,
  ChevronRight,
  Play,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import logoSecc from "@/assets/logo-secc.png";

export default function SistemaEscalas() {
  const features = [
    {
      icon: Calendar,
      title: "Escalas Inteligentes",
      description: "Crie e gerencie escalas de culto com facilidade. Defina datas, horários e tipos de serviço automaticamente."
    },
    {
      icon: Users,
      title: "Gestão de Funções",
      description: "Atribua funções litúrgicas como Dirigente, Pregador, Louvor, Porteiros, Ofertório e muito mais."
    },
    {
      icon: Music,
      title: "Hinos com YouTube",
      description: "Vincule hinos diretamente do YouTube às escalas para facilitar a preparação do louvor."
    },
    {
      icon: DollarSign,
      title: "Controle Financeiro",
      description: "Registre dízimos e ofertas de cada culto com conferente identificado."
    },
    {
      icon: UserCheck,
      title: "Controle de Presença",
      description: "Acompanhe quem compareceu, quem faltou e o motivo das ausências."
    },
    {
      icon: Bell,
      title: "Notificações",
      description: "Mantenha toda a equipe informada sobre suas escalas e responsabilidades."
    },
    {
      icon: Globe,
      title: "Consulta Pública",
      description: "Membros podem consultar as escalas online, sem precisar de login."
    },
    {
      icon: BarChart3,
      title: "Relatórios Completos",
      description: "Gere relatórios de ausências, participação e estatísticas do ministério."
    }
  ];

  const roles = [
    "Dirigente", "Pregador", "Ministério de Louvor", "Porteiro/Porteira",
    "Serviço de Água", "Ofertório", "Leitura Oficial", "Hino de Abertura",
    "Hino Cantado", "Encerramento", "Oração", "Testemunho"
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Agilidade",
      description: "Reduza horas de trabalho manual para minutos com automação inteligente."
    },
    {
      icon: Shield,
      title: "Organização",
      description: "Nunca mais esqueça quem está escalado. Tudo registrado e acessível."
    },
    {
      icon: Heart,
      title: "Engajamento",
      description: "Membros se sentem valorizados ao verem suas responsabilidades claras."
    },
    {
      icon: Smartphone,
      title: "Acessibilidade",
      description: "Acesse de qualquer dispositivo, a qualquer hora, de qualquer lugar."
    }
  ];

  const testimonials = [
    {
      name: "Pastor João Silva",
      church: "AD Missão Apostólica",
      text: "O sistema de escalas revolucionou nossa organização. Antes, gastávamos horas no telefone. Agora, tudo está na palma da mão.",
      rating: 5
    },
    {
      name: "Pastora Maria Santos",
      church: "AD Central",
      text: "A transparência financeira e o controle de presença nos ajudaram a ter uma visão clara do envolvimento da igreja.",
      rating: 5
    },
    {
      name: "Ev. Carlos Oliveira",
      church: "AD Vida Nova",
      text: "Os membros adoram poder consultar a escala online. Diminuiu muito as ligações perguntando quem está escalado.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoSecc} alt="SISCOF" className="h-10 w-auto" />
            <span className="font-bold text-xl text-foreground">SISCOF</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/consulta-escalas">
              <Button variant="ghost" className="hidden sm:flex">
                Consultar Escalas
              </Button>
            </Link>
            <Link to="/login">
              <Button className="bg-primary hover:bg-primary/90">
                Acessar Sistema
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2">
              <Calendar className="w-4 h-4 mr-2 inline" />
              Sistema de Escalas SISCOF
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Organize os Cultos da Sua Igreja com{" "}
              <span className="text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Excelência e Simplicidade
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              O sistema completo para gerenciar escalas de culto, funções litúrgicas, 
              controle financeiro e presença. Tudo em um só lugar, acessível de qualquer dispositivo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/cadastrar-igreja">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                  <Play className="w-5 h-5 mr-2" />
                  Começar Agora
                </Button>
              </Link>
              <Link to="/consulta-escalas">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2">
                  <Globe className="w-5 h-5 mr-2" />
                  Ver Demonstração
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Gratuito por 7 dias</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Suporte completo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Por que sua Igreja Precisa de um Sistema de Escalas Online?
            </h2>
            <p className="text-lg text-muted-foreground">
              Muitas igrejas ainda organizam cultos de forma manual, gerando confusão, 
              esquecimentos e sobrecarga para a liderança. Veja os problemas mais comuns:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: "😰", problem: "Ligações intermináveis para confirmar quem está escalado" },
              { icon: "📋", problem: "Papéis perdidos com anotações de escalas antigas" },
              { icon: "😤", problem: "Conflitos por falta de clareza nas responsabilidades" },
              { icon: "💸", problem: "Falta de controle financeiro transparente dos cultos" }
            ].map((item, index) => (
              <Card key={index} className="bg-destructive/5 border-destructive/20 hover:border-destructive/40 transition-colors">
                <CardContent className="p-6 text-center">
                  <span className="text-4xl mb-4 block">{item.icon}</span>
                  <p className="text-foreground font-medium">{item.problem}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution / Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-600 border-green-500/20">
              A Solução Completa
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Tudo que Você Precisa para Organizar seus Cultos
            </h2>
            <p className="text-lg text-muted-foreground">
              O Sistema de Escalas SISCOF foi desenvolvido especialmente para igrejas, 
              com funcionalidades que simplificam a gestão litúrgica e administrativa.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/30"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                  Funções Litúrgicas
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Todas as Funções do Culto em um Só Lugar
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Gerencie facilmente todos os participantes do culto. 
                  Cada pessoa sabe exatamente sua função e responsabilidade.
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {roles.map((role, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="px-3 py-1.5 text-sm bg-background border border-border hover:border-primary/50 transition-colors"
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-2xl" />
                <Card className="relative bg-background/80 backdrop-blur border-primary/20">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Dirigente</p>
                            <p className="text-sm text-muted-foreground">Pr. João Silva</p>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                            <Music className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Ministério de Louvor</p>
                            <p className="text-sm text-muted-foreground">Equipe Adoração</p>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-orange-500" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Pregador</p>
                            <p className="text-sm text-muted-foreground">Ev. Carlos Oliveira</p>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Benefícios que Transformam sua Igreja
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                  <benefit.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Financial Control Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <Card className="bg-background border-border/50">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      Registro Financeiro do Culto
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                        <span className="text-foreground">Dízimos</span>
                        <span className="font-bold text-green-600">R$ 2.450,00</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                        <span className="text-foreground">Ofertas</span>
                        <span className="font-bold text-blue-600">R$ 890,00</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-foreground">Conferente</span>
                        <span className="font-medium text-muted-foreground">Dc. Pedro Santos</span>
                      </div>
                      <div className="border-t border-border pt-4">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-foreground">Total do Culto</span>
                          <span className="font-bold text-xl text-primary">R$ 3.340,00</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="order-1 lg:order-2">
                <Badge className="mb-4 bg-green-500/10 text-green-600 border-green-500/20">
                  Controle Financeiro
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Transparência Total nas Finanças de Cada Culto
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Registre dízimos e ofertas separadamente, identifique o conferente responsável 
                  e tenha um histórico completo de todas as arrecadações.
                </p>
                <ul className="space-y-3">
                  {[
                    "Registro separado de dízimos e ofertas",
                    "Identificação do conferente de cada culto",
                    "Histórico completo por data e tipo de culto",
                    "Relatórios financeiros detalhados"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-foreground">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              O que Dizem Nossos Usuários
            </h2>
            <p className="text-lg text-muted-foreground">
              Pastores e líderes que já transformaram a organização de suas igrejas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-background border-border/50 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.text}"</p>
                  <div className="border-t border-border pt-4">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.church}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Pronto para Transformar a Organização da sua Igreja?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Junte-se a centenas de igrejas que já usam o SISCOF para organizar seus cultos 
              com excelência e praticidade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/cadastrar-igreja">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto shadow-lg">
                  <ChevronRight className="w-5 h-5 mr-2" />
                  Cadastrar Minha Igreja
                </Button>
              </Link>
              <Link to="/consulta-escalas">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto bg-transparent border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Globe className="w-5 h-5 mr-2" />
                  Ver Escalas Públicas
                </Button>
              </Link>
            </div>
            
            <p className="mt-8 text-sm text-primary-foreground/60">
              Apenas R$ 30/mês após o período de teste • Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logoSecc} alt="SISCOF" className="h-8 w-auto" />
              <span className="font-semibold text-foreground">SISCOF - Sistema de Escalas</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Portal</Link>
              <Link to="/consulta-escalas" className="hover:text-foreground transition-colors">Consultar Escalas</Link>
              <Link to="/login" className="hover:text-foreground transition-colors">Acessar Sistema</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} SISCOF. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
