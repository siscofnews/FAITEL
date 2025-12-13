import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, PlayCircle, FileText, CheckCircle2, Lock, ArrowLeft, Clock } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Module {
    id: string;
    title: string;
    description: string | null;
    order_index: number;
    lessons: Lesson[];
}

interface Lesson {
    id: string;
    title: string;
    content_type: string;
    duration_minutes: number | null;
    order_index: number;
    completed: boolean;
}

interface CourseInfo {
    id: string;
    title: string;
    description: string | null;
    duration_hours: number | null;
}

export default function AssistirCursoEAD() {
    const { courseId } = useParams<{ courseId: string }>();
    const [course, setCourse] = useState<CourseInfo | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (courseId) {
            fetchCourseData();
        }
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            // Buscar informações do curso
            const { data: courseData, error: courseError } = await supabase
                .from("courses")
                .select("id, title, description, duration_hours")
                .eq("id", courseId)
                .single();

            if (courseError) throw courseError;
            setCourse(courseData);

            // Buscar módulos
            const { data: modulesData, error: modulesError } = await supabase
                .from("modules")
                .select("*")
                .eq("course_id", courseId)
                .order("order_index", { ascending: true });

            if (modulesError) throw modulesError;

            // Para cada módulo, buscar aulas e progresso
            const modulesWithLessons = await Promise.all(
                (modulesData || []).map(async (module) => {
                    const { data: lessonsData } = await supabase
                        .from("lessons")
                        .select("id, title, content_type, duration_minutes, order_index")
                        .eq("module_id", module.id)
                        .order("order_index", { ascending: true });

                    // Buscar progresso do usuário
                    const { data: session } = await supabase.auth.getSession();
                    const userId = session?.session?.user?.id;

                    let lessonsWithProgress = lessonsData || [];
                    if (userId) {
                        const { data: progressData } = await supabase
                            .from("user_progress")
                            .select("lesson_id, completed")
                            .eq("user_id", userId)
                            .in("lesson_id", lessonsData?.map(l => l.id) || []);

                        lessonsWithProgress = (lessonsData || []).map(lesson => ({
                            ...lesson,
                            completed: progressData?.find(p => p.lesson_id === lesson.id)?.completed || false
                        }));
                    }

                    return {
                        ...module,
                        lessons: lessonsWithProgress
                    };
                })
            );

            setModules(modulesWithLessons);

            // Calcular progresso geral
            const totalLessons = modulesWithLessons.reduce((acc, m) => acc + m.lessons.length, 0);
            const completedLessons = modulesWithLessons.reduce(
                (acc, m) => acc + m.lessons.filter(l => l.completed).length,
                0
            );
            setProgress(totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0);

        } catch (error: any) {
            toast({
                title: "Erro ao carregar curso",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLessonClick = (lessonId: string) => {
        navigate(`/ead/aula/${lessonId}`);
    };

    const getContentIcon = (type: string) => {
        switch (type) {
            case "video":
                return <PlayCircle className="w-5 h-5" />;
            case "pdf":
            case "document":
                return <FileText className="w-5 h-5" />;
            default:
                return <BookOpen className="w-5 h-5" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Carregando curso...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container mx-auto py-8 px-4">
                <Card>
                    <CardContent className="py-12 text-center">
                        <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Curso não encontrado</h3>
                        <Button onClick={() => navigate("/meus-cursos")} className="mt-4">
                            Voltar para Meus Cursos
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            <Button
                variant="ghost"
                onClick={() => navigate("/meus-cursos")}
                className="mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Meus Cursos
            </Button>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-3xl">{course.title}</CardTitle>
                    <CardDescription className="text-base mt-2">
                        {course.description}
                    </CardDescription>
                    {course.duration_hours && (
                        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration_hours}h de carga horária</span>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span>Progresso do Curso</span>
                            <span className="font-semibold">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Conteúdo do Curso</h2>

                {modules.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Nenhum conteúdo disponível</h3>
                            <p className="text-muted-foreground">
                                Este curso ainda não possui módulos cadastrados.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Accordion type="multiple" className="space-y-4">
                        {modules.map((module, moduleIndex) => (
                            <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-6">
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                                            {moduleIndex + 1}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h3 className="font-semibold text-lg">{module.title}</h3>
                                            {module.description && (
                                                <p className="text-sm text-muted-foreground">{module.description}</p>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {module.lessons.filter(l => l.completed).length}/{module.lessons.length} aulas
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-2 pt-4">
                                        {module.lessons.map((lesson, lessonIndex) => (
                                            <div
                                                key={lesson.id}
                                                onClick={() => handleLessonClick(lesson.id)}
                                                className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                                            >
                                                <div className="flex-shrink-0">
                                                    {lesson.completed ? (
                                                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30" />
                                                    )}
                                                </div>
                                                <div className="flex-shrink-0">
                                                    {getContentIcon(lesson.content_type)}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium">
                                                        {moduleIndex + 1}.{lessonIndex + 1} {lesson.title}
                                                    </h4>
                                                    {lesson.duration_minutes && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {lesson.duration_minutes} minutos
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </div>
        </div>
    );
}
