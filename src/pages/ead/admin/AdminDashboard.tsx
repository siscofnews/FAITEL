import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    GraduationCap,
    BookOpen,
    Video,
    Users,
    UserCheck,
    MapPin,
    Settings,
    DollarSign,
    BookMarked,
    FileQuestion
} from "lucide-react";

export default function AdminDashboard() {
    const navigate = useNavigate();

    const adminCards = [
        {
            icon: GraduationCap,
            title: "Cursos",
            description: "Criar e gerenciar cursos",
            color: "bg-blue-600 hover:bg-blue-700",
            path: "/ead/admin/cursos"
        },
        {
            icon: BookOpen,
            title: "Matérias",
            description: "Gerenciar matérias dos cursos",
            color: "bg-green-600 hover:bg-green-700",
            path: "/ead/admin/modulos"
        },
        {
            icon: Video,
            title: "Aulas",
            description: "Adicionar vídeos e materiais",
            color: "bg-teal-600 hover:bg-teal-700",
            path: "/ead/admin/onboarding-conteudo"
        },
        {
            icon: Users,
            title: "Alunos",
            description: "Cadastrar e gerenciar alunos",
            color: "bg-purple-600 hover:bg-purple-700",
            path: "/ead/admin/alunos"
        },
        {
            icon: UserCheck,
            title: "Professores",
            description: "Gerenciar professores",
            color: "bg-indigo-600 hover:bg-indigo-700",
            path: "/ead/admin/professores"
        },
        {
            icon: MapPin,
            title: "Polos",
            description: "Gerenciar polos de ensino",
            color: "bg-orange-600 hover:bg-orange-700",
            path: "/ead/admin/polos"
        },
        {
            icon: FileQuestion,
            title: "Sistema de Avaliação",
            description: "Criar provas e questões",
            color: "bg-pink-600 hover:bg-pink-700",
            path: "/ead/admin/provas"
        },
        {
            icon: Settings,
            title: "Configurações",
            description: "Configurar sistema",
            color: "bg-gray-600 hover:bg-gray-700",
            path: "/ead/admin/configuracoes"
        },
        {
            icon: DollarSign,
            title: "Financeiro",
            description: "Gestão financeira",
            color: "bg-emerald-600 hover:bg-emerald-700",
            path: "/ead/admin/financeiro"
        }
    ];

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <Card className="bg-gradient-to-r from-blue-900 to-blue-700 text-white border-0">
                    <CardHeader>
                        <CardTitle className="text-3xl flex items-center gap-3">
                            <BookMarked className="h-8 w-8" />
                            Painel Administrativo EAD FAITEL
                        </CardTitle>
                        <CardDescription className="text-blue-100">
                            Gerencie todos os aspectos da sua plataforma de ensino a distância
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Admin Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adminCards.map((card, index) => (
                        <Card key={index} className="hover:shadow-xl transition-all duration-300">
                            <CardHeader>
                                <div className={`w-16 h-16 rounded-full ${card.color} text-white flex items-center justify-center mb-4`}>
                                    <card.icon className="h-8 w-8" />
                                </div>
                                <CardTitle className="text-xl">{card.title}</CardTitle>
                                <CardDescription className="text-sm">{card.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    onClick={() => navigate(card.path)}
                                    className="w-full"
                                    variant="outline"
                                >
                                    Acessar
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick Info */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold mb-2">💡 Dica Rápida</h3>
                                <p className="text-sm text-muted-foreground">
                                    Use o menu lateral ou os cards acima para navegar pelas diferentes áreas do sistema.
                                </p>
                            </div>
                            <Button variant="secondary" onClick={() => navigate("/ead")}>
                                Voltar ao Painel Principal
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
