import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import BannerNiveisFormacao from "@/components/ead/BannerNiveisFormacao";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    GraduationCap,
    Users,
    BookOpen,
    Video,
    Building2,
    ArrowRight,
    BookMarked,
    Heart,
    UserCircle,
    TrendingUp,
    Sparkles
} from "lucide-react";

export default function FAITELDashboard() {
    const navigate = useNavigate();

    const stats = [
        { icon: Building2, label: "Polos Ativos", value: "7", color: "text-blue-600" },
        { icon: Users, label: "Alunos", value: "100+", color: "text-green-600" },
        { icon: BookOpen, label: "Cursos", value: "12", color: "text-purple-600" },
        { icon: Video, label: "Aulas", value: "50+", color: "text-orange-600" },
    ];

    const values = [
        {
            icon: BookMarked,
            title: "Educação como ferramenta de transformação",
            description: "Acreditamos no poder da educação para mudar vidas"
        },
        {
            icon: Sparkles,
            title: "Tecnologia que aproxima, não que afasta",
            description: "Usamos tecnologia para conectar pessoas e facilitar o aprendizado"
        },
        {
            icon: Heart,
            title: "Humanidade em cada atendimento",
            description: "Cada aluno é tratado com atenção e cuidado individual"
        },
        {
            icon: UserCircle,
            title: "Autonomia com suporte de verdade",
            description: "Liberdade para aprender com suporte sempre disponível"
        },
        {
            icon: TrendingUp,
            title: "Compromisso com evolução contínua",
            description: "Sempre buscando melhorar e inovar"
        },
    ];

    const quickActions = [
        {
            label: "Gerenciar Faculdades",
            description: "Matriz, Polos e Núcleos",
            icon: Building2,
            path: "/admin/faculdades/matriz",
            color: "bg-blue-600 hover:bg-blue-700"
        },
        {
            label: "Cursos e Módulos",
            description: "Criar e organizar conteúdo",
            icon: BookOpen,
            path: "/ead/admin/cursos",
            color: "bg-purple-600 hover:bg-purple-700"
        },
        {
            label: "Publicar Aulas",
            description: "Upload de vídeos e materiais",
            icon: Video,
            path: "/ead/admin/onboarding-conteudo",
            color: "bg-orange-600 hover:bg-orange-700"
        },
        {
            label: "Matrículas",
            description: "Gerenciar alunos",
            icon: Users,
            path: "/ead/polo/matriculas",
            color: "bg-green-600 hover:bg-green-700"
        },
    ];

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Hero Section - FAITEL Branding */}
                <Card className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white border-0 overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
                    <CardContent className="p-8 relative z-10">
                        <div className="flex items-start justify-between">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <GraduationCap className="h-12 w-12 text-yellow-400" />
                                        <div>
                                            <h1 className="text-4xl font-bold">FAITEL</h1>
                                            <p className="text-xl text-blue-100">Faculdade Internacional Teológica de Líderes</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 max-w-3xl">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                        <p className="text-sm text-blue-200 mb-1">MISSÃO</p>
                                        <p className="text-white/90 leading-relaxed">
                                            Transformar conhecimento em negócio com tecnologia acessível, confiável e humana.
                                            Oferecemos uma plataforma completa para que educadores, especialistas e instituições
                                            possam ensinar com estrutura, autonomia e suporte de verdade.
                                        </p>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                        <p className="text-sm text-blue-200 mb-1">VISÃO</p>
                                        <p className="text-white/90 leading-relaxed">
                                            Ser a principal referência em tecnologia para educação a distância no Brasil,
                                            conectando quem ensina a quem quer aprender com segurança, autonomia e resultados.
                                        </p>
                                    </div>
                                </div>

                                <div className="text-sm text-blue-200">
                                    <strong>Diretor:</strong> Pastor Valdinei da Conceição Santos • <strong>Fundação:</strong> 23 anos formando líderes
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {stats.map((stat, idx) => (
                        <Card key={idx} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                                        <p className="text-3xl font-bold">{stat.value}</p>
                                    </div>
                                    <stat.icon className={`h-10 w-10 ${stat.color}`} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Banner Níveis de Formação */}
                <BannerNiveisFormacao />

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-yellow-500" />
                            Ações Rápidas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {quickActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => navigate(action.path)}
                                    className={`${action.color} text-white p-6 rounded-lg text-left transition-all hover:scale-105 hover:shadow-xl`}
                                >
                                    <div className="flex items-start gap-4">
                                        <action.icon className="h-8 w-8 flex-shrink-0" />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg mb-1">{action.label}</h3>
                                            <p className="text-sm text-white/80">{action.description}</p>
                                        </div>
                                        <ArrowRight className="h-5 w-5 flex-shrink-0" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Values Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="h-5 w-5 text-red-500" />
                            Nossos Valores
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {values.map((value, idx) => (
                                <div
                                    key={idx}
                                    className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                            <value.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-sm mb-1">{value.title}</h4>
                                            <p className="text-xs text-muted-foreground">{value.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Getting Started Guide */}
                <Card className="border-2 border-blue-200 dark:border-blue-800">
                    <CardHeader className="bg-blue-50 dark:bg-blue-950">
                        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                            <BookOpen className="h-5 w-5" />
                            Primeiros Passos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <ol className="space-y-3">
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                                <div>
                                    <strong>Configure sua Faculdade</strong>
                                    <p className="text-sm text-muted-foreground">Crie a FAITEL Matriz com logo, vídeo institucional e informações completas</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                                <div>
                                    <strong>Adicione Polos e Núcleos</strong>
                                    <p className="text-sm text-muted-foreground">Expanda sua estrutura criando polos em diferentes regiões</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                                <div>
                                    <strong>Crie seus Cursos</strong>
                                    <p className="text-sm text-muted-foreground">Organize o conteúdo em cursos e módulos temáticos</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                                <div>
                                    <strong>Publique Aulas</strong>
                                    <p className="text-sm text-muted-foreground">Faça upload de vídeos e materiais de apoio (PDFs)</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                                <div>
                                    <strong>Matricule Alunos</strong>
                                    <p className="text-sm text-muted-foreground">Comece a formar líderes!</p>
                                </div>
                            </li>
                        </ol>

                        <div className="mt-6 flex gap-3">
                            <Button
                                onClick={() => navigate("/admin/faculdades/matriz")}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Começar Agora
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate("/ead/admin/onboarding-conteudo")}
                            >
                                Ver Tutorial
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
