import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Users, Building2, FileSpreadsheet, Settings, UserCog, TrendingUp, Home, LogIn } from "lucide-react";

export default function DiretorPortal() {
    const navigate = useNavigate();

    const recursos = [
        {
            icon: Users,
            title: "Gestão de Alunos",
            description: "Matrículas, transferências e históricos",
            color: "from-blue-500 to-blue-600",
        },
        {
            icon: UserCog,
            title: "Gestão de Professores",
            description: "Contratos, atribuições e avaliações",
            color: "from-purple-500 to-purple-600",
        },
        {
            icon: Building2,
            title: "Polos e Unidades",
            description: "Administre polos e núcleos regionais",
            color: "from-green-500 to-green-600",
        },
        {
            icon: FileSpreadsheet,
            title: "Relatórios Gerenciais",
            description: "Dashboards e análises completas",
            color: "from-yellow-500 to-yellow-600",
        },
        {
            icon: TrendingUp,
            title: "Desempenho Acadêmico",
            description: "Métricas de qualidade de ensino",
            color: "from-red-500 to-red-600",
        },
        {
            icon: Settings,
            title: "Configurações",
            description: "Parâmetros institucionais",
            color: "from-indigo-500 to-indigo-600",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
            {/* Header */}
            <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-gray-900" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Portal do Diretor</h1>
                                <p className="text-sm text-gray-200">FAITEL - Gestão Acadêmica</p>
                            </div>
                        </div>
                        <Button onClick={() => navigate("/")} variant="ghost" className="text-white hover:text-gray-200">
                            <Home className="h-4 w-4 mr-2" />
                            Home
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                <div className="max-w-5xl mx-auto">
                    {/* Welcome Card */}
                    <Card className="mb-8 bg-white/10 backdrop-blur-md border-white/20 text-white">
                        <CardHeader>
                            <CardTitle className="text-2xl">Bem-vindo ao Portal do Diretor FAITEL</CardTitle>
                            <CardDescription className="text-gray-100">
                                Gerencie toda a operação acadêmica e administrativa da instituição
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    {/* Login/Access Section */}
                    <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
                        <div className="text-center max-w-2xl mx-auto">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <LogIn className="h-10 w-10 text-gray-700" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Área de Gestão</h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Acesso exclusivo para diretores e coordenadores acadêmicos
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    onClick={() => navigate("/login")}
                                    size="lg"
                                    className="bg-gray-800 hover:bg-gray-900 text-lg px-8"
                                >
                                    <LogIn className="h-5 w-5 mr-2" />
                                    Fazer Login
                                </Button>
                                <Button
                                    onClick={() => navigate("/")}
                                    size="lg"
                                    variant="outline"
                                    className="text-lg px-8"
                                >
                                    Voltar ao Início
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-white mb-6 text-center">
                            Módulos de Gestão
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recursos.map((recurso, index) => (
                                <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    <CardHeader>
                                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${recurso.color} flex items-center justify-center mb-3`}>
                                            <recurso.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <CardTitle className="text-lg">{recurso.title}</CardTitle>
                                        <CardDescription>{recurso.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Support Info */}
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-6">
                            <h4 className="font-bold text-gray-900 mb-2">🔒 Acesso Restrito</h4>
                            <p className="text-gray-700 text-sm">
                                Este portal é exclusivo para membros da direção acadêmica. Para suporte técnico:{" "}
                                <a href="mailto:ti@faitel.edu.br" className="text-blue-600 hover:underline font-semibold">
                                    ti@faitel.edu.br
                                </a>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
