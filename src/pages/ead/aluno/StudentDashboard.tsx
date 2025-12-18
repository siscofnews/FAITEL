import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, BookOpen, Award, Clock } from "lucide-react";

export default function StudentDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState<any>(null);
    const [enrollments, setEnrollments] = useState<any[]>([]);

    useEffect(() => {
        fetchStudentData();
    }, []);

    const fetchStudentData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                navigate('/login');
                return;
            }

            // Buscar dados do aluno
            const { data: studentData } = await supabase
                .from('ead_students')
                .select('*')
                .eq('user_id', user.id)
                .single();

            setStudent(studentData);

            // Buscar matrículas ativas
            const { data: enrollmentsData } = await supabase
                .from('ead_enrollments')
                .select(`
          id,
          progresso_percentual,
          status,
          data_matricula,
          course:courses(
            id,
            title,
            description,
            carga_horaria
          )
        `)
                .eq('student_id', studentData?.id)
                .eq('status', 'ativa');

            setEnrollments(enrollmentsData || []);
        } catch (error) {
            console.error('Error fetching student data:', error);
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
                <h1 className="text-3xl font-bold mb-2">
                    Olá, {student?.nome_completo?.split(' ')[0]}!  👋
                </h1>
                <p className="text-muted-foreground">
                    Bem-vindo ao seu painel de estudos
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Cursos Ativos</CardTitle>
                            <GraduationCap className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{enrollments.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {enrollments.filter(e => e.progresso_percentual > 0 && e.progresso_percentual < 100).length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                            <Award className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {enrollments.filter(e => e.progresso_percentual === 100).length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Horas de Estudo</CardTitle>
                            <Clock className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {enrollments.reduce((acc, e) => acc + (e.course.carga_horaria || 0), 0)}h
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Meus Cursos */}
            <h2 className="text-2xl font-bold mb-4">Meus Cursos</h2>

            {enrollments.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                        <h3 className="text-xl font-semibold mb-2">Nenhum curso ainda</h3>
                        <p className="text-muted-foreground mb-4">
                            Entre em contato com a secretaria para se matricular em um curso
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrollments.map((enrollment) => (
                        <Card
                            key={enrollment.id}
                            className="hover:shadow-lg transition-all cursor-pointer"
                            onClick={() => navigate(`/ead/aluno/curso/${enrollment.course.id}`)}
                        >
                            <CardHeader>
                                <CardTitle className="text-lg">{enrollment.course.title}</CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {enrollment.course.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-muted-foreground">Progresso</span>
                                        <span className="font-semibold">{enrollment.progresso_percentual}%</span>
                                    </div>
                                    <Progress value={enrollment.progresso_percentual} className="h-2" />
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {enrollment.course.carga_horaria}h
                                    </span>
                                    <Button
                                        variant={enrollment.progresso_percentual === 0 ? "default" : "outline"}
                                        size="sm"
                                    >
                                        {enrollment.progresso_percentual === 0 ? "Começar" : "Continuar"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
