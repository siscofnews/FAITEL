import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Users, FileEdit, Video, BarChart3, Calendar, Award, Home, LogIn } from "lucide-react";

export default function ProfessorPortal() {
    const navigate = useNavigate();

    const recursos = [
        {
            icon: FileEdit,
            title: "Gerenciar Conteúdo",
            description: "Adicione e edite materiais de aula",
            color: "from-purple-500 to-purple-600",
        },
        {
            icon: Video,
            title: "Upload de Videoaulas",
            description: "Publique suas aulas gravadas",
            color: "from-red-500 to-red-600",
        },
        {
            icon: Users,
            title: "Turmas",
            description: "Acompanhe suas turmas ativas",
            color: "from-blue-500 to-blue-600",
        },
        {
            icon: BarChart3,
            title: "Notas e Avaliações",
            description: "Gerencie avaliações dos alunos",
            color: "from-green-500 to-green-600",
        },
        {
            icon: Calendar,
            title: "Cronograma",
            description: "Planeje suas aulas e atividades",
            color: "from-yellow-500 to-yellow-600",
        },
        {
            icon: Award,
            title: "Relatórios",
            description: "Visualize desempenho das turmas",
            color: "from-indigo-500 to-indigo-600",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900">
            {/* Header */}
            <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6 text-purple-900" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Portal do Professor</h1>
                                <p className="text-sm text-purple-200">FAITEL - EAD</p>
                            </div>
                        </div>
                        <Button onClick={() => navigate("/")} variant="ghost" className="text-white hover:text-purple-200">
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
                            <CardTitle className="text-2xl">Bem-vindo ao Portal do Professor FAITEL</CardTitle>
                            <CardDescription className="text-purple-100">
                                Gerencie suas turmas, materiais e acompanhe o progresso dos seus alunos
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    {/* Login/Access Section */}
                    <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
                        <div className="text-center max-w-2xl mx-auto">
                            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <LogIn className="h-10 w-10 text-purple-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Área do Professor</h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Faça login para acessar suas ferramentas de gerenciamento de ensino
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    onClick={() => navigate("/ead/professor/conteudos")}
                                    size="lg"
                                    className="bg-purple-600 hover:bg-purple-700 text-lg px-8"
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
                            Ferramentas para Professores
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
                    <Card className="bg-purple-50 border-purple-200">
                        <CardContent className="p-6">
                            <h4 className="font-bold text-gray-900 mb-2">💼 Suporte ao Docente</h4>
                            <p className="text-gray-700 text-sm">
                                Tem dúvidas sobre a plataforma? Entre em contato:{" "}
                                <a href="mailto:professores@faitel.edu.br" className="text-purple-600 hover:underline font-semibold">
                                    professores@faitel.edu.br
                                </a>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
