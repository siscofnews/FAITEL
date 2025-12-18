import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Shield, Database, Users, Settings, Lock, BarChart, Home, LogIn } from "lucide-react";

export default function SuperAdminPortal() {
    const navigate = useNavigate();

    const recursos = [
        {
            icon: Database,
            title: "Gestão Global",
            description: "Controle total do sistema e dados",
            color: "from-red-500 to-red-600",
        },
        {
            icon: Users,
            title: "Administradores",
            description: "Gerenciar todos os níveis de acesso",
            color: "from-orange-500 to-orange-600",
        },
        {
            icon: Settings,
            title: "Configurações Avançadas",
            description: "Parâmetros do sistema",
            color: "from-purple-500 to-purple-600",
        },
        {
            icon: BarChart,
            title: "Analytics Global",
            description: "Visão consolidada de todas unidades",
            color: "from-blue-500 to-blue-600",
        },
        {
            icon: Lock,
            title: "Segurança",
            description: "Logs, permissões e auditoria",
            color: "from-green-500 to-green-600",
        },
        {
            icon: Shield,
            title: "Backups",
            description: "Gestão de backups e recuperação",
            color: "from-indigo-500 to-indigo-600",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-950 via-gray-900 to-black">
            {/* Header */}
            <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Portal Super Admin</h1>
                                <p className="text-sm text-red-200">FAITEL - Sistema Central</p>
                            </div>
                        </div>
                        <Button onClick={() => navigate("/")} variant="ghost" className="text-white hover:text-red-200">
                            <Home className="h-4 w-4 mr-2" />
                            Home
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                <div className="max-w-5xl mx-auto">
                    {/* Security Warning */}
                    <Card className="mb-8 bg-red-500/20 backdrop-blur-md border-red-500/50 text-white">
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Shield className="h-6 w-6" />
                                Área Restrita - Super Administrador
                            </CardTitle>
                            <CardDescription className="text-red-100">
                                ⚠️ Acesso exclusivo para administradores do sistema. Todas as ações são registradas.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    {/* Login/Access Section */}
                    <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
                        <div className="text-center max-w-2xl mx-auto">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <LogIn className="h-10 w-10 text-red-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Acesso Administrativo</h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Autenticação de dois fatores obrigatória para acesso ao painel
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    onClick={() => navigate("/admin/global")}
                                    size="lg"
                                    className="bg-red-600 hover:bg-red-700 text-lg px-8"
                                >
                                    <Shield className="h-5 w-5 mr-2" />
                                    Login Seguro
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
                            Módulos de Administração
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recursos.map((recurso, index) => (
                                <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-gray-700">
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

                    {/* Security Alert */}
                    <Card className="bg-yellow-50 border-yellow-400 border-2">
                        <CardContent className="p-6">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <Lock className="h-5 w-5 text-yellow-600" />
                                Segurança Máxima
                            </h4>
                            <p className="text-gray-700 text-sm">
                                Este acesso possui privilégios máximos no sistema. Todas as ações são monitoradas e registradas para auditoria.
                                Em caso de suspeita de acesso não autorizado, contate imediatamente:{" "}
                                <a href="mailto:seguranca@faitel.edu.br" className="text-red-600 hover:underline font-semibold">
                                    seguranca@faitel.edu.br
                                </a>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
