import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle2, BookOpen, FileText, PlayCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LessonData {
    id: string;
    title: string;
    content_type: string;
    content_url: string | null;
    content_text: string | null;
    duration_minutes: number | null;
    module: {
        id: string;
        title: string;
        course: {
            id: string;
            title: string;
        };
    };
}

export default function VisualizarAulaEAD() {
    const { lessonId } = useParams<{ lessonId: string }>();
    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [currentProgress, setCurrentProgress] = useState(0);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                // Buscar dados da aula
                const { data: lessonData, error: lessonError } = await supabase
                    .from("lessons")
                    .select(`
          id,
          title,
          content_type,
          content_url,
          content_text,
          duration_minutes,
          module:modules!inner (
            id,
            title,
            course:courses!inner (
              id,
              title
            )
          )
        `)
                    .eq("id", lessonId)
                    .single();

                if (lessonError) throw lessonError;
                setLesson(lessonData);

                // Verificar progresso do usuário
                const { data: session } = await supabase.auth.getSession();
                const userId = session?.session?.user?.id;

                if (userId) {
                    const { data: progressData } = await supabase
                        .from("user_progress")
                        .select("completed, last_position, time_watched")
                        .eq("user_id", userId)
                        .eq("lesson_id", lessonId)
                        .single();

                    if (progressData) {
                        setCompleted(progressData.completed);
                        setCurrentProgress(progressData.last_position || 0);
                    }
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
                toast({
                    title: "Erro ao carregar aula",
                    description: errorMessage,
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        if (lessonId) {
            fetchLesson();
        }
    }, [lessonId, toast]);

    const handleMarkAsComplete = async () => {
        try {
            const { data: session } = await supabase.auth.getSession();
            const userId = session?.session?.user?.id;

            if (!userId || !lessonId) return;

            const { error } = await supabase
                .from("user_progress")
                .upsert({
                    user_id: userId,
                    lesson_id: lessonId,
                    completed: true,
                    last_position: 0,
                    time_watched: lesson?.duration_minutes ? lesson.duration_minutes * 60 : 0,
                    last_accessed: new Date().toISOString()
                }, {
                    onConflict: "user_id,lesson_id"
                });

            if (error) throw error;

            setCompleted(true);
            toast({ title: "Aula marcada como concluída!" });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            toast({
                title: "Erro ao marcar aula",
                description: errorMessage,
                variant: "destructive"
            });
        }
    };

    const renderContent = () => {
        if (!lesson) return null;

        switch (lesson.content_type) {
            case "video": {
                if (!lesson.content_url) {
                    return (
                        <div className="aspect-video bg-muted flex items-center justify-center">
                            <p className="text-muted-foreground">Vídeo não disponível</p>
                        </div>
                    );
                }

                // Suporta YouTube e Vimeo
                let embedUrl = lesson.content_url;
                if (lesson.content_url.includes("youtube.com") || lesson.content_url.includes("youtu.be")) {
                    const videoId = lesson.content_url.includes("youtu.be")
                        ? lesson.content_url.split("/").pop()
                        : new URLSearchParams(new URL(lesson.content_url).search).get("v");
                    embedUrl = `https://www.youtube.com/embed/${videoId}`;
                } else if (lesson.content_url.includes("vimeo.com")) {
                    const videoId = lesson.content_url.split("/").pop();
                    embedUrl = `https://player.vimeo.com/video/${videoId}`;
                }

                return (
                    <div className="aspect-video">
                        <iframe
                            src={embedUrl}
                            className="w-full h-full rounded-lg"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                );
            }

            case "pdf":
                return (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        {lesson.content_url ? (
                            <iframe
                                src={`${lesson.content_url}#toolbar=0&navpanes=0`}
                                className="w-full h-full rounded-lg"
                                style={{ minHeight: "600px" }}
                            />
                        ) : (
                            <p className="text-muted-foreground">PDF não disponível</p>
                        )}
                    </div>
                );

            case "html":
            case "text":
                return (
                    <Card>
                        <CardContent className="pt-6">
                            <div
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: lesson.content_text || "Conteúdo não disponível" }}
                            />
                        </CardContent>
                    </Card>
                );

            default:
                return (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Tipo de conteúdo não suportado</p>
                        </CardContent>
                    </Card>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Carregando aula...</p>
                </div>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="container mx-auto py-8 px-4">
                <Card>
                    <CardContent className="py-12 text-center">
                        <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Aula não encontrada</h3>
                        <Button onClick={() => navigate(-1)} className="mt-4">
                            Voltar
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const module = Array.isArray(lesson.module) ? lesson.module[0] : lesson.module;
    const course = Array.isArray(module?.course) ? module.course[0] : module?.course;

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <Button
                variant="ghost"
                onClick={() => navigate(`/ead/curso/${course?.id}`)}
                className="mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para {course?.title}
            </Button>

            <div className="grid gap-6">
                {/* Header */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <CardDescription className="mb-2">
                                    {course?.title} / {module?.title}
                                </CardDescription>
                                <CardTitle className="text-3xl">{lesson.title}</CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                                {completed ? (
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span className="font-semibold">Concluída</span>
                                    </div>
                                ) : (
                                    <Button onClick={handleMarkAsComplete}>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Marcar como Concluída
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Content */}
                {renderContent()}

                {/* Additional Info */}
                {lesson.duration_minutes && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Informações da Aula</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <PlayCircle className="w-4 h-4" />
                                <span>Duração estimada: {lesson.duration_minutes} minutos</span>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
