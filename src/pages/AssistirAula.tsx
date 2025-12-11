import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Lesson {
    id: string;
    title: string;
    description: string;
    video_url: string | null;
    duration_minutes: number | null;
}

export default function AssistirAula() {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (lessonId) {
            loadLesson();
        }
    }, [lessonId]);

    const loadLesson = async () => {
        try {
            const { data, error } = await supabase
                .from("course_lessons")
                .select("*")
                .eq("id", lessonId)
                .single();

            if (error) throw error;
            setLesson(data);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar aula",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getEmbedUrl = (url: string) => {
        // Convert YouTube URL to embed format
        if (url.includes("youtube.com/watch")) {
            const videoId = url.split("v=")[1]?.split("&")[0];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        if (url.includes("youtu.be/")) {
            const videoId = url.split("youtu.be/")[1]?.split("?")[0];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        // Convert Vimeo URL to embed format
        if (url.includes("vimeo.com/")) {
            const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
            return `https://player.vimeo.com/video/${videoId}`;
        }
        return url;
    };

    const markAsComplete = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // TODO: Implement lesson completion tracking
            toast({
                title: "Aula concluída!",
                description: "Seu progresso foi atualizado",
            });
        } catch (error: any) {
            toast({
                title: "Erro ao marcar conclusão",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <div className="bg-gray-900 text-white border-b border-gray-800">
                <div className="container mx-auto px-4 py-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="text-white hover:bg-gray-800"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <div className="text-white">Carregando aula...</div>
                </div>
            ) : !lesson ? (
                <div className="flex items-center justify-center h-96">
                    <Card className="p-8 text-center">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold mb-2">Aula não encontrada</h3>
                    </Card>
                </div>
            ) : (
                <div className="container mx-auto px-4 py-8">
                    {/* Video Player */}
                    <div className="mb-8">
                        {lesson.video_url ? (
                            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                                <iframe
                                    src={getEmbedUrl(lesson.video_url)}
                                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        ) : (
                            <div className="bg-gray-900 rounded-lg p-12 text-center">
                                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                                <p className="text-gray-400">Vídeo não disponível para esta aula</p>
                            </div>
                        )}
                    </div>

                    {/* Lesson Info */}
                    <Card className="bg-gray-900 text-white border-gray-800">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
                                    {lesson.description && (
                                        <p className="text-gray-400">{lesson.description}</p>
                                    )}
                                </div>
                                <Button
                                    onClick={markAsComplete}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Marcar como Concluída
                                </Button>
                            </div>

                            {lesson.duration_minutes && (
                                <div className="text-sm text-gray-400">
                                    Duração: {lesson.duration_minutes} minutos
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Additional Resources */}
                    <Card className="mt-4 bg-gray-900 text-white border-gray-800">
                        <CardContent className="p-6">
                            <h3 className="font-semibold mb-4">Recursos Adicionais</h3>
                            <p className="text-gray-400 text-sm">
                                Materiais complementares estarão disponíveis em breve
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
