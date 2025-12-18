import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { BookOpen, Video, FileText, Award, Calendar, MessageSquare, Home, LogIn } from "lucide-react";

export default function AlunoPortal() {
    const navigate = useNavigate();

    const recursos = [
        {
            icon: BookOpen,
            title: "Biblioteca Virtual",
            description: "Acesso a todo material didático e bibliografias",
            color: "from-blue-500 to-blue-600",
        },
        {
            icon: Video,
            title: "Videoaulas",
            description: "Aulas gravadas disponíveis 24/7",
            color: "from-purple-500 to-purple-600",
        },
        {
            icon: FileText,
            title: "Atividades",
            description: "Exercícios e trabalhos avaliativos",
            color: "from-green-500 to-green-600",
        },
        {
            icon: Award,
            title: "Notas e Certificados",
            description: "Acompanhe seu desempenho acadêmico",
            color: "from-yellow-500 to-yellow-600",
        },
        {
            icon: Calendar,
            title: "Calendário",
            description: "Cronograma de aulas e prazos",
            color: "from-red-500 to-red-600",
        },
        {
            icon: MessageSquare,
            title: "Suporte",
            description: "Fale com professores e coordenação",
            color: "from-indigo-500 to-indigo-600",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
            {/* Header */}
            <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-blue-900" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Portal do Aluno</h1>
                                <p className="text-sm text-blue-200">FAITEL - EAD</p>
                            </div>
                        </div>
                        <Button onClick={() => navigate("/")} variant="ghost" className="text-white hover:text-blue-200">
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
                            <CardTitle className="text-2xl">Bem-vindo ao Portal do Aluno FAITEL</CardTitle>
                            <CardDescription className="text-blue-100">
                                Gerencie seus estudos, acesse materiais e acompanhe seu progresso acadêmico
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    {/* Login/Access Section */}
                    <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
                        <div className="text-center max-w-2xl mx-auto">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <LogIn className="h-10 w-10 text-blue-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Área do Aluno</h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Faça login para acessar seu ambiente de estudos ou entre em contato para se matricular
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    onClick={() => navigate("/ead/aluno/login")}
                                    size="lg"
                                    className="bg-blue-600 hover:bg-blue-700 text-lg px-8"
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
                                    Ainda não sou aluno
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-white mb-6 text-center">
                            Recursos Disponíveis para Alunos
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
                    <Card className="bg-yellow-50 border-yellow-200">
                        <CardContent className="p-6">
                            <h4 className="font-bold text-gray-900 mb-2">📞 Precisa de Ajuda?</h4>
                            <p className="text-gray-700 text-sm">
                                Entre em contato com o suporte acadêmico:{" "}
                                <a href="mailto:academico@faitel.edu.br" className="text-blue-600 hover:underline font-semibold">
                                    academico@faitel.edu.br
                                </a>
                                {" "}ou através do WhatsApp: (11) 99999-9999
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
