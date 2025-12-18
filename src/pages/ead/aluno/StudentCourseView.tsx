import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Play, CheckCircle, Lock, FileText } from "lucide-react";

export default function StudentCourseView() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [enrollment, setEnrollment] = useState<any>(null);
    const [progress, setProgress] = useState<Map<string, any>>(new Map());

    useEffect(() => {
        if (courseId) {
            fetchCourseData();
        }
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Buscar dados do aluno
            const { data: studentData } = await supabase
                .from('ead_students')
                .select('id')
                .eq('user_id', user?.id)
                .single();

            // Buscar matrícula
            const { data: enrollmentData } = await supabase
                .from('ead_enrollments')
                .select('*')
                .eq('student_id', studentData?.id)
                .eq('course_id', courseId)
                .single();

            if (!enrollmentData) {
                navigate('/ead/aluno/dashboard');
                return;
            }

            setEnrollment(enrollmentData);

            // Buscar curso
            const { data: courseData } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .single();

            setCourse(courseData);

            // Buscar módulos com aulas
            const { data: modulesData } = await supabase
                .from('modules')
                .select(`
          *,
          lessons(
            id,
            title,
            content_type,
            content_url,
            duration_minutes,
            ordem,
            order_index
          )
        `)
                .eq('course_id', courseId)
                .order('ordem', { ascending: true });

            setModules(modulesData || []);

            // Buscar progresso das aulas
            const { data: progressData } = await supabase
                .from('ead_lesson_progress')
                .select('*')
                .eq('student_id', studentData?.id);

            const progressMap = new Map();
            progressData?.forEach(p => {
                progressMap.set(p.lesson_id, p);
            });
            setProgress(progressMap);

        } catch (error) {
            console.error('Error fetching course data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartLesson = (lessonId: string) => {
        navigate(`/ead/aluno/aula/${lessonId}`);
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
            <Button
                variant="ghost"
                onClick={() => navigate('/ead/aluno/dashboard')}
                className="mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Dashboard
            </Button>

            {/* Header do Curso */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">{course?.title}</h1>
                <p className="text-muted-foreground mb-4">{course?.description}</p>

                <div className="flex items-center gap-4 mb-4">
                    <div className="text-sm text-muted-foreground">
                        Progresso do Curso
                    </div>
                    <div className="flex-1 max-w-xs">
                        <Progress value={enrollment?.progresso_percentual || 0} className="h-2" />
                    </div>
                    <div className="text-sm font-semibold">
                        {enrollment?.progresso_percentual || 0}%
                    </div>
                </div>
            </div>

            {/* Módulos e Aulas */}
            {modules.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                        <p className="text-muted-foreground">Este curso ainda não possui módulos cadastrados</p>
                    </CardContent>
                </Card>
            ) : (
                <Accordion type="multiple" className="space-y-4">
                    {modules.map((module, moduleIndex) => (
                        <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-6">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-4 w-full">
                                    <div className="flex-1 text-left">
                                        <h3 className="font-semibold text-lg">
                                            Módulo {moduleIndex + 1}: {module.title}
                                        </h3>
                                        {module.description && (
                                            <p className="text-sm text-muted-foreground">{module.description}</p>
                                        )}
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-2 pt-4">
                                    {module.lessons?.sort((a: any, b: any) => (a.ordem || a.order_index || 0) - (b.ordem || b.order_index || 0)).map((lesson: any, lessonIndex: number) => {
                                        const lessonProgress = progress.get(lesson.id);
                                        const isCompleted = lessonProgress?.concluida;

                                        return (
                                            <div
                                                key={lesson.id}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {isCompleted ? (
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                    ) : (
                                                        <Play className="w-5 h-5 text-primary" />
                                                    )}
                                                    <div>
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
                                                <Button
                                                    size="sm"
                                                    variant={isCompleted ? "outline" : "default"}
                                                    onClick={() => handleStartLesson(lesson.id)}
                                                >
                                                    {isCompleted ? "Revisar" : "Assistir"}
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </div>
    );
}
