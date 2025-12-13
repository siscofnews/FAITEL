import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    Users,
    BookOpen,
    Award,
    TrendingUp,
    Clock,
    CheckCircle,
    Plus,
    BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardStats {
    totalCursos: number;
    cursosPublicados: number;
    totalTurmas: number;
    turmasAtivas: number;
    totalAlunos: number;
    alunosPendentes: number;
    certificadosEmitidos: number;
    avaliacoesPendentes: number;
}

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ElementType;
    gradient: string;
    trend?: string;
    badge?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, gradient, trend, badge }) => (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:transform hover:scale-[1.02] bg-white/80 backdrop-blur-sm border border-slate-200">
        <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 bg-gradient-to-br ${gradient} rounded-full opacity-10`} />
        <CardContent className="p-6 md:p-8">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
                    <div className="text-3xl md:text-4xl font-bold mt-3 text-slate-800">
                        {value}
                    </div>
                    {badge && (
                        <Badge className="mt-3" variant="secondary">{badge}</Badge>
                    )}
                </div>
                <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
                    <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
            </div>
            {trend && (
                <div className="flex items-center mt-4 md:mt-6 text-sm">
                    <TrendingUp className="w-4 h-4 mr-2 text-emerald-500" />
                    <span className="text-emerald-600 font-semibold">{trend}</span>
                </div>
            )}
        </CardContent>
    </Card>
);

export default function ImprovedDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        totalCursos: 0,
        cursosPublicados: 0,
        totalTurmas: 0,
        turmasAtivas: 0,
        totalAlunos: 0,
        alunosPendentes: 0,
        certificadosEmitidos: 0,
        avaliacoesPendentes: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [recentActivities, setRecentActivities] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            // Carregar estatísticas do banco
            const [coursesData, classesData, enrollmentsData, certificatesData] = await Promise.all([
                supabase.from("courses").select("id, is_published"),
                supabase.from("course_classes").select("id, is_active"),
                supabase.from("course_enrollments").select("id, status"),
                supabase.from("student_certificates").select("id")
            ]);

            setStats({
                totalCursos: coursesData.data?.length || 0,
                cursosPublicados: coursesData.data?.filter(c => c.is_published).length || 0,
                totalTurmas: classesData.data?.length || 0,
                turmasAtivas: classesData.data?.filter(c => c.is_active).length || 0,
                totalAlunos: enrollmentsData.data?.length || 0,
                alunosPendentes: enrollmentsData.data?.filter(e => e.status === 'pending').length || 0,
                certificadosEmitidos: certificatesData.data?.length || 0,
                avaliacoesPendentes: 0 // TODO: Implementar quando tiver tabela de avaliações
            });

            // Carregar atividades recentes (últimas matrículas)
            const { data: recentEnrollments } = await supabase
                .from("course_enrollments")
                .select("*, course_classes(name)")
                .order("enrollment_date", { ascending: false })
                .limit(5);

            setRecentActivities(recentEnrollments || []);
        } catch (error) {
            console.error("Erro ao carregar dashboard:", error);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8 md:space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Dashboard SISCOF
                        </h1>
                        <p className="text-lg md:text-xl mt-3 text-slate-600 font-medium">
                            Visão geral do sistema educacional
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/gerenciar-cursos">
                            <Button
                                size="lg"
                                className="px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-[1.05]"
                            >
                                <Plus className="w-5 h-5 md:w-6 md:h-6 mr-3" />
                                Novo Curso
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Estatísticas Principais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <StatCard
                        title="Cursos Ativos"
                        value={stats.cursosPublicados}
                        icon={BookOpen}
                        gradient="from-blue-500 to-indigo-500"
                        trend={`${stats.totalCursos} total`}
                        badge="Publicados"
                    />
                    <StatCard
                        title="Turmas Ativas"
                        value={stats.turmasAtivas}
                        icon={Users}
                        gradient="from-emerald-500 to-teal-500"
                        trend={`${stats.totalTurmas} total`}
                        badge="Abertas"
                    />
                    <StatCard
                        title="Alunos Matriculados"
                        value={stats.totalAlunos}
                        icon={Calendar}
                        gradient="from-orange-500 to-amber-500"
                        trend={`${stats.alunosPendentes} pendentes`}
                    />
                    <StatCard
                        title="Certificados"
                        value={stats.certificadosEmitidos}
                        icon={Award}
                        gradient="from-purple-500 to-violet-500"
                        trend="Emitidos"
                        badge="Concluídos"
                    />
                </div>

                {/* Estatísticas Secundárias */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-pink-600 uppercase">Avaliações Pendentes</p>
                                    <p className="text-3xl font-bold text-pink-800 mt-2">{stats.avaliacoesPendentes}</p>
                                </div>
                                <CheckCircle className="w-12 h-12 text-pink-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-cyan-600 uppercase">Taxa de Conclusão</p>
                                    <p className="text-3xl font-bold text-cyan-800 mt-2">
                                        {stats.totalAlunos > 0
                                            ? Math.round((stats.certificadosEmitidos / stats.totalAlunos) * 100)
                                            : 0}%
                                    </p>
                                </div>
                                <BarChart3 className="w-12 h-12 text-cyan-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-lime-50 to-green-50 border-2 border-lime-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-lime-600 uppercase">Crescimento</p>
                                    <p className="text-3xl font-bold text-lime-800 mt-2">+12%</p>
                                </div>
                                <TrendingUp className="w-12 h-12 text-lime-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Atividades Recentes */}
                <Card className="shadow-2xl bg-white/90 backdrop-blur-sm border border-slate-200">
                    <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-xl">
                        <CardTitle className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <Clock className="w-6 h-6 text-indigo-600" />
                            Atividades Recentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="animate-pulse flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : recentActivities.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                                <p className="text-slate-600">Nenhuma atividade recente</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentActivities.map((activity, index) => (
                                    <div key={activity.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-800">{activity.student_name}</p>
                                            <p className="text-sm text-slate-600">
                                                Matriculado em: {activity.course_classes?.name || 'Turma'}
                                            </p>
                                        </div>
                                        <Badge variant={activity.status === 'active' ? 'default' : 'secondary'}>
                                            {activity.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/gerenciar-cursos">
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:transform hover:scale-[1.02] bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                            <CardContent className="p-8 text-center">
                                <BookOpen className="w-12 h-12 mx-auto mb-4" />
                                <h3 className="text-xl font-bold">Gerenciar Cursos</h3>
                                <p className="text-sm mt-2 opacity-90">Criar e editar cursos</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link to="/gerenciar-turmas">
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:transform hover:scale-[1.02] bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                            <CardContent className="p-8 text-center">
                                <Users className="w-12 h-12 mx-auto mb-4" />
                                <h3 className="text-xl font-bold">Gerenciar Turmas</h3>
                                <p className="text-sm mt-2 opacity-90">Organizar turmas e horários</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link to="/minhas-turmas">
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:transform hover:scale-[1.02] bg-gradient-to-br from-purple-500 to-violet-600 text-white">
                            <CardContent className="p-8 text-center">
                                <Award className="w-12 h-12 mx-auto mb-4" />
                                <h3 className="text-xl font-bold">Área do Aluno</h3>
                                <p className="text-sm mt-2 opacity-90">Acompanhar progresso</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
}
