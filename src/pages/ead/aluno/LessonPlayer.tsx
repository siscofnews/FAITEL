import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle, FileText, Video } from "lucide-react";

export default function LessonPlayer() {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);

    const [loading, setLoading] = useState(true);
    const [lesson, setLesson] = useState<any>(null);
    const [contents, setContents] = useState<any[]>([]);
    const [studentId, setStudentId] = useState<string>("");
    const [progress, setProgress] = useState<any>(null);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        if (lessonId) {
            fetchLessonData();
        }
    }, [lessonId]);

    // Salvar progresso periodicamente
    useEffect(() => {
        const interval = setInterval(() => {
            saveProgress();
        }, 30000); // A cada 30 segundos

        return () => clearInterval(interval);
    }, [studentId, lessonId]);

    const fetchLessonData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Buscar aluno
            const { data: studentData } = await supabase
                .from('ead_students')
                .select('id')
                .eq('user_id', user?.id)
                .single();

            setStudentId(studentData?.id || "");

            // Buscar aula
            const { data: lessonData } = await supabase
                .from('lessons')
                .select('*, module:modules(id, title, course_id)')
                .eq('id', lessonId)
                .single();

            setLesson(lessonData);

            // Buscar conteúdos da aula
            const { data: contentsData } = await supabase
                .from('ead_lesson_contents')
                .select('*')
                .eq('lesson_id', lessonId)
                .order('ordem');

            setContents(contentsData || []);

            // Buscar progresso existente
            const { data: progressData } = await supabase
                .from('ead_lesson_progress')
                .select('*')
                .eq('student_id', studentData?.id)
                .eq('lesson_id', lessonId)
                .single();

            if (progressData) {
                setProgress(progressData);
                setCompleted(progressData.concluida);

                // Restaurar posição do vídeo
                if (videoRef.current && progressData.ultima_posicao) {
                    videoRef.current.currentTime = progressData.ultima_posicao;
                }
            } else {
                // Criar registro de progresso inicial
                const { data: enrollment } = await supabase
                    .from('ead_enrollments')
                    .select('id')
                    .eq('student_id', studentData?.id)
                    .eq('course_id', lessonData?.module.course_id)
                    .single();

                if (enrollment) {
                    const { data: newProgress } = await supabase
                        .from('ead_lesson_progress')
                        .insert({
                            student_id: studentData?.id,
                            lesson_id: lessonId,
                            enrollment_id: enrollment.id,
                            data_inicio: new Date().toISOString()
                        })
                        .select()
                        .single();

                    setProgress(newProgress);
                }
            }
        } catch (error) {
            console.error('Error fetching lesson:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveProgress = async () => {
        if (!studentId || !lessonId || !progress) return;

        const currentTime = videoRef.current?.currentTime || 0;
        const duration = videoRef.current?.duration || 0;
        const watchedPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

        try {
            await supabase
                .from('ead_lesson_progress')
                .update({
                    ultima_posicao: Math.floor(currentTime),
                    tempo_assistido: Math.floor(currentTime),
                    updated_at: new Date().toISOString()
                })
                .eq('id', progress.id);
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    };

    const markAsCompleted = async () => {
        if (!progress || completed) return;

        try {
            const { error } = await supabase
                .from('ead_lesson_progress')
                .update({
                    concluida: true,
                    data_conclusao: new Date().toISOString()
                })
                .eq('id', progress.id);

            if (error) throw error;

            setCompleted(true);
            toast({
                title: "Aula concluída!",
                description: "Seu progresso foi atualizado"
            });
        } catch (error: any) {
            toast({
                title: "Erro ao marcar como concluída",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const getYouTubeEmbedUrl = (url: string) => {
        const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/)?.[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    };

    const getVimeoEmbedUrl = (url: string) => {
        const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
        return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
            </Button>

            {/* Título da Aula */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{lesson?.title}</h1>
                <p className="text-muted-foreground">{lesson?.module?.title}</p>
            </div>

            {/* Player de Vídeo */}
            {contents.map((content) => (
                <Card key={content.id} className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {content.tipo.includes('video') ? (
                                <Video className="w-5 h-5" />
                            ) : (
                                <FileText className="w-5 h-5" />
                            )}
                            {content.titulo}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Vídeo Upload */}
                        {content.tipo === 'video_upload' && content.video_url && (
                            <video
                                ref={videoRef}
                                controls
                                className="w-full rounded-lg"
                                src={content.video_url}
                                onEnded={markAsCompleted}
                            >
                                Seu navegador não suporta vídeo.
                            </video>
                        )}

                        {/* YouTube */}
                        {content.tipo === 'video_embed' && content.video_provider === 'youtube' && (
                            <div className="relative pt-[56.25%]">
                                <iframe
                                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                                    src={getYouTubeEmbedUrl(content.video_url)}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        )}

                        {/* Vimeo */}
                        {content.tipo === 'video_embed' && content.video_provider === 'vimeo' && (
                            <div className="relative pt-[56.25%]">
                                <iframe
                                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                                    src={getVimeoEmbedUrl(content.video_url)}
                                    allow="autoplay; fullscreen; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        )}

                        {/* PDF */}
                        {content.tipo === 'pdf' && content.arquivo_url && (
                            <div className="space-y-4">
                                <embed
                                    src={content.arquivo_url}
                                    type="application/pdf"
                                    className="w-full h-[600px] rounded-lg"
                                />
                                <Button variant="outline" className="w-full" asChild>
                                    <a href={content.arquivo_url} download target="_blank" rel="noopener noreferrer">
                                        Baixar PDF
                                    </a>
                                </Button>
                            </div>
                        )}

                        {/* Texto */}
                        {content.tipo === 'texto' && content.conteudo_html && (
                            <div
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: content.conteudo_html }}
                            />
                        )}

                        {content.descricao && (
                            <p className="mt-4 text-sm text-muted-foreground">{content.descricao}</p>
                        )}
                    </CardContent>
                </Card>
            ))}

            {/* Botão de Concluir */}
            {!completed && (
                <Button
                    onClick={markAsCompleted}
                    className="w-full"
                    size="lg"
                >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Marcar como Concluída
                </Button>
            )}

            {completed && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-semibold">Aula Concluída!</p>
                </div>
            )}
        </div>
    );
}
