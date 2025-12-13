import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Clock, Award, PlayCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EnrolledCourse {
    id: string;
    course: {
        id: string;
        title: string;
        description: string | null;
        duration_hours: number | null;
        thumbnail_url: string | null;
    };
    enrolled_at: string;
    completed_at: string | null;
    certificate_issued: boolean;
    progress: number;
}

export default function MeusCursosEAD() {
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyCourses();
    }, []);

    const fetchMyCourses = async () => {
        try {
            const { data: session } = await supabase.auth.getSession();
            const userId = session?.session?.user?.id;

            if (!userId) {
                toast({
                    title: "Não autenticado",
                    description: "Faça login para ver seus cursos",
                    variant: "destructive"
                });
                navigate("/login");
                return;
            }

            // Buscar cursos matriculados
            const { data: coursesData, error: coursesError } = await supabase
                .from("user_course_access")
                .select(`
          id,
          course:courses (
            id,
            title,
            description,
            duration_hours,
            thumbnail_url
          ),
          enrolled_at,
          completed_at,
          certificate_issued
        `)
                .eq("user_id", userId);

            if (coursesError) throw coursesError;

            // Para cada curso, calcular progresso
            const coursesWithProgress = await Promise.all(
                (coursesData || []).map(async (enrollment) => {
                    const course = Array.isArray(enrollment.course) ? enrollment.course[0] : enrollment.course;

                    // Buscar total de aulas do curso
                    const { data: modulesData } = await supabase
                        .from("modules")
                        .select("id")
                        .eq("course_id", course.id);

                    const moduleIds = (modulesData || []).map(m => m.id);

                    const { data: lessonsData } = await supabase
                        .from("lessons")
                        .select("id")
                        .in("module_id", moduleIds);

                    const totalLessons = (lessonsData || []).length;

                    // Buscar aulas concluídas
                    const lessonIds = (lessonsData || []).map(l => l.id);
                    const { data: progressData } = await supabase
                        .from("user_progress")
                        .select("lesson_id")
                        .eq("user_id", userId)
                        .eq("completed", true)
                        .in("lesson_id", lessonIds);

                    const completedLessons = (progressData || []).length;
                    const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

                    return {
                        ...enrollment,
                        course,
                        progress
                    };
                })
            );

            setEnrolledCourses(coursesWithProgress);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar cursos",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCourseClick = (courseId: string) => {
        navigate(`/ead/curso/${courseId}`);
    };

    const activeCourses = enrolledCourses.filter(c => !c.completed_at);
    const completedCourses = enrolledCourses.filter(c => c.completed_at);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Carregando seus cursos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">Meus Cursos</h1>
                        <p className="text-muted-foreground">Módulo EAD - FAITEL</p>
                    </div>
                </div>
            </div>

            {enrolledCourses.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Você ainda não está matriculado em nenhum curso</h3>
                        <p className="text-muted-foreground mb-4">
                            Entre em contato com a administração para se matricular em cursos disponíveis.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Tabs defaultValue="active" className="w-full">
                    <TabsList className="mb-6">
                        <TabsTrigger value="active">
                            Em Andamento ({activeCourses.length})
                        </TabsTrigger>
                        <TabsTrigger value="completed">
                            Concluídos ({completedCourses.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active">
                        {activeCourses.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">Nenhum curso em andamento</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {activeCourses.map((enrollment) => (
                                    <Card
                                        key={enrollment.id}
                                        className="hover:shadow-lg transition-shadow cursor-pointer"
                                        onClick={() => handleCourseClick(enrollment.course.id)}
                                    >
                                        {enrollment.course.thumbnail_url && (
                                            <div className="aspect-video bg-muted overflow-hidden">
                                                <img
                                                    src={enrollment.course.thumbnail_url}
                                                    alt={enrollment.course.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <CardHeader>
                                            <CardTitle className="text-xl">{enrollment.course.title}</CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {enrollment.course.description || "Sem descrição"}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex items-center justify-between text-sm mb-2">
                                                        <span>Progresso</span>
                                                        <span className="font-semibold">{Math.round(enrollment.progress)}%</span>
                                                    </div>
                                                    <Progress value={enrollment.progress} className="h-2" />
                                                </div>

                                                {enrollment.course.duration_hours && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{enrollment.course.duration_hours}h</span>
                                                    </div>
                                                )}

                                                <Button className="w-full">
                                                    <PlayCircle className="w-4 h-4 mr-2" />
                                                    Continuar
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="completed">
                        {completedCourses.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">Nenhum curso concluído ainda</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {completedCourses.map((enrollment) => (
                                    <Card
                                        key={enrollment.id}
                                        className="hover:shadow-lg transition-shadow cursor-pointer"
                                        onClick={() => handleCourseClick(enrollment.course.id)}
                                    >
                                        {enrollment.course.thumbnail_url && (
                                            <div className="aspect-video bg-muted overflow-hidden relative">
                                                <img
                                                    src={enrollment.course.thumbnail_url}
                                                    alt={enrollment.course.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                                    <Award className="w-3 h-3" />
                                                    Concluído
                                                </div>
                                            </div>
                                        )}
                                        <CardHeader>
                                            <CardTitle className="text-xl">{enrollment.course.title}</CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {enrollment.course.description || "Sem descrição"}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div>
                                                    <Progress value={100} className="h-2" />
                                                </div>

                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        Concluído em {new Date(enrollment.completed_at!).toLocaleDateString("pt-BR")}
                                                    </span>
                                                </div>

                                                {enrollment.certificate_issued && (
                                                    <Button className="w-full" variant="outline">
                                                        <Award className="w-4 h-4 mr-2" />
                                                        Ver Certificado
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
