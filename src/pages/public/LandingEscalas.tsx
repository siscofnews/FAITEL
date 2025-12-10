import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
    Check,
    Calendar,
    Users,
    Bell,
    ClipboardCheck,
    BarChart3,
    Smartphone,
    Clock,
    MessageSquare,
    Shield,
    Zap,
    ChevronRight
} from "lucide-react";

export default function LandingEscalas() {
    const navigate = useNavigate();

    const features = [
        {
            icon: Calendar,
            title: "Gestão Completa de Escalas",
            description: "Organize todas as escalas de culto, ensaios, eventos especiais e Santa Ceia em um só lugar"
        },
        {
            icon: Users,
            title: "Equipes Hierárquicas",
            description: "Gerencie equipes de louvor, diaconia, mídia, segurança e mais com estrutura organizacional"
        },
        {
            icon: Bell,
            title: "Notificações Automáticas",
            description: "WhatsApp, Email e Push notifications para lembrar os membros de suas responsabilidades"
        },
        {
            icon: ClipboardCheck,
            title: "Confirmação de Presença",
            description: "Membros confirmam participação com um clique. Admins recebem relatórios em tempo real"
        },
        {
            icon: BarChart3,
            title: "Relatórios e Estatísticas",
            description: "Visualize frequência, participação, e gere relatórios detalhados para liderança"
        },
        {
            icon: Smartphone,
            title: "Acesso Mobile",
            description: "Consulta de escalas pelo celular, tablet ou computador. Sempre disponível onde você estiver"
        },
        {
            icon: Clock,
            title: "Histórico Completo",
            description: "Acompanhe o histórico de todas as escalas, substituições e alterações realizadas"
        },
        {
            icon: MessageSquare,
            title: "Comunicação Integrada",
            description: "Chat entre equipes, avisos urgentes e comunicados diretamente pelo sistema"
        },
        {
            icon: Shield,
            title: "Segurança e Privacidade",
            description: "Dados criptografados, backup automático e conformidade com LGPD"
        }
    ];

    const benefits = [
        "Economize horas de trabalho manual criando escalas",
        "Reduza faltas e esquecimentos com lembretes automáticos",
        "Melhore a organização dos cultos e eventos",
        "Tenha visão completa de toda a equipe ministerial",
        "Substitua planilhas complexas por uma interface intuitiva",
        "Acesse de qualquer dispositivo, a qualquer hora",
        "Suporte técnico dedicado para sua igreja",
        "Atualizações constantes sem custo adicional"
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
                <div className="absolute inset-0 bg-grid-white/5"></div>
                <div className="container mx-auto px-4 py-20 md:py-32 relative">
                    <div className="max-w-4xl mx-auto text-center">
                        <Badge className="mb-6 bg-white/20 text-white border-white/30 text-sm px-4 py-1">
                            🎯 Sistema Completo de Gestão Ministerial
                        </Badge>

                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Transforme a Organização das
                            <span className="block bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                                Escalas de Culto
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
                            Chega de planilhas confusas e mensagens perdidas!<br />
                            Gerencie equipes, envie notificações automáticas e tenha controle total dos seus cultos.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Button
                                size="lg"
                                className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all"
                                onClick={() => navigate('/cadastrar-igreja')}
                            >
                                Começar Grátis por 30 Dias
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="bg-white/10 hover:bg-white/20 border-white/30 text-white font-semibold text-lg px-8 py-6 backdrop-blur-sm"
                                onClick={() => {
                                    const element = document.getElementById('precos');
                                    element?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                Ver Planos e Preços
                            </Button>
                        </div>

                        <p className="mt-6 text-blue-200 text-sm">
                            ✅ Sem cartão de crédito • ✅ Cancelamento quando quiser • ✅ Suporte em português
                        </p>
                    </div>
                </div>

                {/* Wave separator */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 80C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248 250 252)" />
                    </svg>
                </div>
            </section>

            {/* Video Demonstration Section */}
            <section className="py-20 px-4 bg-slate-50">
                <div className="container mx-auto max-w-5xl text-center">
                    <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-300">Demonstração</Badge>
                    <h2 className="text-3xl md:text-4xl font-bold mb-8 text-slate-800">
                        Veja o SISCOF em Ação
                    </h2>

                    <div className="relative aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900">
                        {/* Placeholder para vídeo - Quando tiver o vídeo real, substituir o iframe */}
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                            <div className="text-center p-8">
                                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform cursor-pointer shadow-lg hover:bg-blue-500 group">
                                    <svg className="w-8 h-8 text-white ml-2 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-white text-xl font-semibold mb-2">Vídeo de Apresentação</h3>
                                <p className="text-slate-400 max-w-md mx-auto">
                                    Assista como é simples gerenciar escalas, membros e comunicações com o SISCOF News.
                                </p>
                            </div>
                        </div>

                        {/* Exemplo de como seria o iframe do Youtube */}
                        {/* <iframe 
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/SEU_ID_DO_VIDEO" 
                            title="SISCOF Demo"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe> */}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <Badge className="mb-4">Funcionalidades</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Tudo que sua igreja precisa em um só lugar
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Sistema completo pensado para simplificar a gestão ministerial e fortalecer sua equipe
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <Card key={index} className="border-2 hover:border-blue-500 hover:shadow-lg transition-all duration-300 group">
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <feature.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                    <CardDescription className="text-base">{feature.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 px-4 bg-slate-50">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-12">
                        <Badge className="mb-4 bg-green-100 text-green-700 border-green-300">Benefícios</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Por que mais de 500 igrejas confiam no SISCOF?
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                    <Check className="h-4 w-4 text-green-600" />
                                </div>
                                <p className="text-lg">{benefit}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="precos" className="py-20 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-300">Preços Simples</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Escolha o plano ideal para sua igreja
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            Preços justos e transparentes. Sem taxas ocultas.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Plano Pequeno */}
                        <Card className="border-2 hover:border-blue-500 hover:shadow-2xl transition-all duration-300">
                            <CardHeader className="text-center pb-8">
                                <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                    <Users className="h-8 w-8 text-blue-600" />
                                </div>
                                <CardTitle className="text-2xl mb-2">Plano Comunidade</CardTitle>
                                <CardDescription className="text-base">Ideal para igrejas em crescimento</CardDescription>
                                <div className="mt-6">
                                    <p className="text-sm text-muted-foreground mb-2">Até 100 membros</p>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-5xl font-bold text-blue-600">R$ 30</span>
                                        <span className="text-xl text-muted-foreground">/mês</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                                        <span>Até 100 membros cadastrados</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                                        <span>Escalas ilimitadas</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                                        <span>Notificações por WhatsApp</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                                        <span>Relatórios básicos</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                                        <span>Suporte por email</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                                        <span>1 igreja (matriz)</span>
                                    </li>
                                </ul>
                                <Button className="w-full" size="lg" onClick={() => navigate('/cadastrar-igreja')}>
                                    Começar Agora
                                </Button>
                                <p className="text-center text-sm text-muted-foreground mt-4">
                                    30 dias grátis • Cancele quando quiser
                                </p>
                            </CardContent>
                        </Card>

                        {/* Plano Grande */}
                        <Card className="border-4 border-purple-500 hover:shadow-2xl transition-all duration-300 relative">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 shadow-lg">
                                    🌟 Mais Popular
                                </Badge>
                            </div>
                            <CardHeader className="text-center pb-8 pt-8">
                                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-4">
                                    <Zap className="h-8 w-8 text-white" />
                                </div>
                                <CardTitle className="text-2xl mb-2">Plano Igreja</CardTitle>
                                <CardDescription className="text-base">Para igrejas em pleno crescimento</CardDescription>
                                <div className="mt-6">
                                    <p className="text-sm text-muted-foreground mb-2">Acima de 100 membros</p>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">R$ 50</span>
                                        <span className="text-xl text-muted-foreground">/mês</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                                        <span className="font-semibold">Membros ilimitados</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                                        <span>Tudo do plano Comunidade +</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                                        <span>Hierarquia completa (Sedes/Subsedes)</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                                        <span>Notificações Email + SMS</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                                        <span>Relatórios avançados e dashboards</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                                        <span>Suporte prioritário (WhatsApp)</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                                        <span>Múltiplas igrejas filiais</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                                        <span>API para integrações</span>
                                    </li>
                                </ul>
                                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" size="lg" onClick={() => navigate('/cadastrar-igreja')}>
                                    Começar Agora
                                </Button>
                                <p className="text-center text-sm text-muted-foreground mt-4">
                                    30 dias grátis • Cancele quando quiser
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <p className="text-center text-muted-foreground mt-12 text-lg">
                        💳 Aceitamos PIX, Cartão de Crédito e Boleto Bancário
                    </p>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
                <div className="container mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        Pronto para transformar a gestão da sua igreja?
                    </h2>
                    <p className="text-xl md:text-2xl mb-8 text-blue-100">
                        Junte-se a centenas de igrejas que já descobriram uma forma mais simples de organizar escalas!
                    </p>
                    <Button
                        size="lg"
                        className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold text-xl px-12 py-8 shadow-2xl"
                        onClick={() => navigate('/cadastrar-igreja')}
                    >
                        🚀 Começar Teste Grátis de 30 Dias
                    </Button>
                    <p className="mt-6 text-blue-200">
                        Sem compromisso • Configure em 5 minutos • Comece a usar hoje mesmo
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 py-8 px-4">
                <div className="container mx-auto max-w-6xl text-center">
                    <p className="text-sm">
                        © 2025 SISCOF News - Sistema de Gestão Eclesiástica • Todos os direitos reservados
                    </p>
                    <p className="text-xs mt-2 text-slate-400">
                        Dúvidas? Entre em contato: suporte@siscof.com.br
                    </p>
                </div>
            </footer>
        </div>
    );
}
