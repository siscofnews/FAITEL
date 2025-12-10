import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Home, BookOpen, Clock, Award, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MeusCursos() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMyEnrollments();
    }, []);

    const loadMyEnrollments = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            // Buscar membro
            const { data: member } = await supabase
                .from("members")
                .select("id")
                .eq("user_id", user.id)
                .single();

            if (!member) throw new Error("Membro não encontrado");

            // Buscar matrículas
            const { data, error } = await supabase
                .from("enrollments")
                .select(`
          *,
          class:classes (
            *,
            course:courses (*)
          )
        `)
                .eq("student_id", member.id)
                .order("enrolled_at", { ascending: false });

            if (error) throw error;
            setEnrollments(data || []);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar cursos",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { label: string; className: string }> = {
            active: { label: "Em Andamento", className: "bg-blue-100 text-blue-800" },
            completed: { label: "Concluído", className: "bg-green-100 text-green-800" },
            dropped: { label: "Cancelado", className: "bg-red-100 text-red-800" },
            suspended: { label: "Suspenso", className: "bg-yellow-100 text-yellow-800" },
        };
        return badges[status] || badges.active;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BookOpen className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Meus Cursos</h1>
                            <p className="text-sm text-gray-600">Acompanhe seu progresso</p>
                        </div>
                    </div>
                    <Button onClick={() => navigate("/")} variant="outline" size="sm">
                        <Home className="h-4 w-4 mr-2" />
                        Home
                    </Button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Cursos Ativos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {enrollments.filter(e => e.status === 'active').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Concluídos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">
                                {enrollments.filter(e => e.status === 'completed').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Progresso Médio</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {enrollments.length > 0
                                    ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / enrollments.length)
                                    : 0}%
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Certificados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-600">
                                {enrollments.filter(e => e.status === 'completed').length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-6">
                    <Button onClick={() => navigate("/escola-culto")}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Explorar Cursos
                    </Button>
                    <Button onClick={() => navigate("/escola-culto/certificados")} variant="outline">
                        <Award className="h-4 w-4 mr-2" />
                        Meus Certificados
                    </Button>
                </div>

                {/* Enrollments List */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Meus Cursos Matriculados</h2>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <Card key={i} className="animate-pulse">
                                    <CardHeader>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-2 bg-gray-200 rounded" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : enrollments.length === 0 ? (
                        <Card className="p-12 text-center">
                            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-xl font-semibold mb-2">Você ainda não está matriculado em nenhum curso</h3>
                            <p className="text-gray-600 mb-4">Explore o catálogo e comece a aprender!</p>
                            <Button onClick={() => navigate("/escola-culto")}>
                                Ver Cursos Disponíveis
                            </Button>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {enrollments.map((enrollment) => {
                                const statusBadge = getStatusBadge(enrollment.status);
                                const course = enrollment.class?.course;

                                return (
                                    <Card
                                        key={enrollment.id}
                                        className="hover:shadow-lg transition-shadow cursor-pointer"
                                        onClick={() => navigate(`/escola-culto/curso/${course?.id}`)}
                                    >
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="flex items-center gap-2">
                                                        {course?.name || 'Curso não encontrado'}
                                                    </CardTitle>
                                                    <CardDescription className="mt-1">
                                                        {enrollment.class?.name || 'Turma não especificada'}
                                                    </CardDescription>
                                                </div>
                                                <Badge className={statusBadge.className}>
                                                    {statusBadge.label}
                                                </Badge>
                                            </div>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="space-y-4">
                                                {/* Progresso */}
                                                <div>
                                                    <div className="flex items-center justify-between text-sm mb-2">
                                                        <span className="text-gray-600">Progresso</span>
                                                        <span className="font-medium">{enrollment.progress_percentage || 0}%</span>
                                                    </div>
                                                    <Progress value={enrollment.progress_percentage || 0} className="h-2" />
                                                </div>

                                                {/* Info */}
                                                <div className="flex items-center gap-6 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{course?.duration_hours || 0}h</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <TrendingUp className="h-4 w-4" />
                                                        <span>Nota: {enrollment.final_grade || '-'}</span>
                                                    </div>
                                                    {enrollment.completion_date && (
                                                        <div className="flex items-center gap-1">
                                                            <Award className="h-4 w-4" />
                                                            <span>Concluído em {new Date(enrollment.completion_date).toLocaleDateString('pt-BR')}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    {enrollment.status === 'active' && (
                                                        <Button className="flex-1">
                                                            Continuar Estudando
                                                        </Button>
                                                    )}
                                                    {enrollment.status === 'completed' && (
                                                        <Button variant="outline" className="flex-1">
                                                            Ver Certificado
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
