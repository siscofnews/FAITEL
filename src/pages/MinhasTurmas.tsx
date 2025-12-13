import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Users, Play, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Enrollment {
    id: string;
    class_id: string;
    student_name: string;
    status: string;
    enrollment_date: string;
    progress_percentage: number;
    final_grade: number | null;
}

interface Class {
    id: string;
    name: string;
    course_id: string;
    professor_name: string;
    schedule: string;
}

export default function MinhasTurmas() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [classes, setClasses] = useState<Record<string, Class>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadEnrollments = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Não autenticado");

                // Load enrollments
                const { data: enrollmentsData, error: enrollmentsError } = await supabase
                    .from("course_enrollments")
                    .select("*")
                    .eq("student_id", user.id)
                    .order("enrollment_date", { ascending: false });

                if (enrollmentsError) throw enrollmentsError;
                setEnrollments(enrollmentsData || []);

                // Load classes details
                if (enrollmentsData) {
                    const classIds = [...new Set(enrollmentsData.map((e) => e.class_id))];
                    const { data: classesData, error: classesError } = await supabase
                        .from("course_classes")
                        .select("*")
                        .in("id", classIds);

                    if (classesError) throw classesError;

                    const classesMap: Record<string, Class> = {};
                    classesData?.forEach((c) => {
                        classesMap[c.id] = c;
                    });
                    setClasses(classesMap);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
                toast({
                    title: "Erro ao carregar turmas",
                    description: errorMessage,
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        loadEnrollments();
    }, [toast]);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
            pending: { label: "Pendente", variant: "secondary" },
            approved: { label: "Aprovado", variant: "default" },
            active: { label: "Ativo", variant: "default" },
            completed: { label: "Concluído", variant: "outline" },
            cancelled: { label: "Cancelado", variant: "destructive" },
        };

        const config = variants[status] || { label: status, variant: "secondary" };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return "bg-green-500";
        if (progress >= 50) return "bg-blue-500";
        if (progress >= 25) return "bg-yellow-500";
        return "bg-gray-300";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Minhas Turmas</h1>
                            <p className="text-gray-600 mt-1">Acompanhe seu progresso nos cursos</p>
                        </div>
                        <Button onClick={() => navigate("/escola-culto")} variant="outline">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Explorar Cursos
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Turmas Ativas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {enrollments.filter((e) => e.status === "active").length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Concluídas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {enrollments.filter((e) => e.status === "completed").length}
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
                                    ? Math.round(
                                        enrollments.reduce((sum, e) => sum + e.progress_percentage, 0) /
                                        enrollments.length
                                    )
                                    : 0}
                                %
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Pendentes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {enrollments.filter((e) => e.status === "pending").length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Enrollments List */}
                {loading ? (
                    <div className="grid grid-cols-1 gap-6">
                        {[1, 2].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                ) : enrollments.length === 0 ? (
                    <Card className="p-12 text-center">
                        <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold mb-2">Nenhuma turma matriculada</h3>
                        <p className="text-gray-600 mb-4">
                            Explore os cursos disponíveis e inscreva-se em uma turma
                        </p>
                        <Button onClick={() => navigate("/escola-culto")}>
                            <BookOpen className="h-4 w-4 mr-2" />
                            Ver Cursos Disponíveis
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {enrollments.map((enrollment) => {
                            const classData = classes[enrollment.class_id];

                            return (
                                <Card
                                    key={enrollment.id}
                                    className="hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => navigate(`/turma/${enrollment.class_id}/aulas`)}
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between mb-2">
                                            {getStatusBadge(enrollment.status)}
                                            {enrollment.progress_percentage === 100 && (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            )}
                                        </div>

                                        <CardTitle className="text-xl">
                                            {classData?.name || "Carregando..."}
                                        </CardTitle>
                                        <CardDescription>
                                            {classData?.professor_name && `Professor: ${classData.professor_name}`}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* Progress */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium">Progresso</span>
                                                    <span className="text-sm font-bold">
                                                        {enrollment.progress_percentage}%
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={enrollment.progress_percentage}
                                                    className="h-2"
                                                />
                                            </div>

                                            {/* Info Grid */}
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                {classData?.schedule && (
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-gray-400" />
                                                        <span>{classData.schedule}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-gray-400" />
                                                    <span>
                                                        Matriculado em{" "}
                                                        {new Date(enrollment.enrollment_date).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                {enrollment.final_grade !== null && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">
                                                            Nota Final: {enrollment.final_grade}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 pt-2">
                                                {enrollment.status === "active" && (
                                                    <Button
                                                        className="flex-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/turma/${enrollment.class_id}/aulas`);
                                                        }}
                                                    >
                                                        <Play className="h-4 w-4 mr-2" />
                                                        Continuar Estudando
                                                    </Button>
                                                )}

                                                {enrollment.status === "pending" && (
                                                    <div className="flex items-center gap-2 text-amber-600">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span className="text-sm">Aguardando aprovação</span>
                                                    </div>
                                                )}

                                                {enrollment.status === "completed" && (
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate("/escola-culto/certificados");
                                                        }}
                                                    >
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
    );
}
