import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Users, Award, TrendingUp } from "lucide-react";

interface DashboardStats {
    totalCursos: number;
    totalAlunos: number;
    aprovacaoMedia: number;
    horasMinistradas: number;
}

export default function ProfessorDashboard() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalCursos: 0,
        totalAlunos: 0,
        aprovacaoMedia: 0,
        horasMinistradas: 0
    });
    const [professor, setProfessor] = useState<any>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Pegar dados do professor logado
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: professorData } = await supabase
                    .from('ead_professors')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                setProfessor(professorData);

                // Buscar estatísticas (exemplo simplificado)
                const { data: cursos } = await supabase
                    .from('courses')
                    .select('id')
                    .eq('professor_id', professorData?.id);

                setStats({
                    totalCursos: cursos?.length || 0,
                    totalAlunos: 0, // Implementar contagem real
                    aprovacaoMedia: 85, // Implementar cálculo real
                    horasMinistradas: 120 // Implementar cálculo real
                });
            }
        } catch (error: any) {
            toast({
                title: "Erro ao carregar dados",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">
                    Bem-vindo, {professor?.nome_completo || 'Professor'}!
                </h1>
                <p className="text-muted-foreground mt-2">
                    Aqui está um resumo das suas atividades
                </p>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Cursos Ativos
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCursos}</div>
                        <p className="text-xs text-muted-foreground">
                            cursos em andamento
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total de Alunos
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalAlunos}</div>
                        <p className="text-xs text-muted-foreground">
                            alunos matriculados
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Taxa de Aprovação
                        </CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.aprovacaoMedia}%</div>
                        <p className="text-xs text-muted-foreground">
                            média geral
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Horas Ministradas
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.horasMinistradas}h</div>
                        <p className="text-xs text-muted-foreground">
                            este semestre
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Próximas Aulas e Atividades */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Próximas Aulas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Nenhuma aula programada para hoje
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Atividades Pendentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Nenhuma atividade pendente de correção
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
