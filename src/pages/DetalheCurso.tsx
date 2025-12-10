import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, BookOpen, Clock, Users, Play, FileText, CheckCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DetalheCurso() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);

    useEffect(() => {
        if (id) {
            loadCourseDetails();
        }
    }, [id]);

    const loadCourseDetails = async () => {
        try {
            // Carregar curso
            const { data: courseData, error: courseError } = await supabase
                .from("courses")
                .select("*")
                .eq("id", id)
                .single();

            if (courseError) throw courseError;
            setCourse(courseData);

            // Carregar módulos e aulas
            const { data: modulesData, error: modulesError } = await supabase
                .from("course_modules")
                .select(`
          *,
          lessons (*)
        `)
                .eq("course_id", id)
                .order("order_index");

            if (modulesError) throw modulesError;
            setModules(modulesData || []);

            // Carregar turmas disponíveis
            const { data: classesData, error: classesError } = await supabase
                .from("classes")
                .select(`
          *,
          teacher:members!classes_teacher_id_fkey (full_name)
        `)
                .eq("course_id", id)
                .eq("status", "active");

            if (classesError) throw classesError;
            setClasses(classesData || []);

        } catch (error: any) {
            toast({
                title: "Erro ao carregar curso",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            biblica: "bg-blue-100 text-blue-800",
            teologica: "bg-purple-100 text-purple-800",
            ministerial: "bg-green-100 text-green-800",
            discipulado: "bg-orange-100 text-orange-800",
            lideranca: "bg-red-100 text-red-800",
        };
        return colors[category] || "bg-gray-100 text-gray-800";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando curso...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="p-12 text-center max-w-md">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">Curso não encontrado</h3>
                    <Button onClick={() => navigate("/escola-culto")} className="mt-4">
                        Voltar para Escola de Culto
                    </Button>
                </Card>
            </div>
        );
    }

    const totalLessons = modules.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button onClick={() => navigate("/escola-culto")} variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{course.name}</h1>
                            <p className="text-sm text-gray-600">Detalhes do Curso</p>
                        </div>
                    </div>
                    <Button onClick={() => navigate("/")} variant="outline" size="sm">
                        <Home className="h-4 w-4 mr-2" />
                        Home
                    </Button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Course Header */}
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white mb-6">
                        <Badge className={getCategoryColor(course.category)} variant="secondary">
                            {course.category}
                        </Badge>
                        <h1 className="text-4xl font-bold mt-4 mb-2">{course.name}</h1>
                        <p className="text-lg opacity-90">{course.description}</p>

                        <div className="flex items-center gap-6 mt-6">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                <span>{course.duration_hours} horas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                <span>{modules.length} módulos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Play className="h-5 w-5" />
                                <span>{totalLessons} aulas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                <span>{classes.length} turmas ativas</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="conteudo" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
                        <TabsTrigger value="turmas">Turmas</TabsTrigger>
                        <TabsTrigger value="sobre">Sobre</TabsTrigger>
                    </TabsList>

                    {/* Conteúdo do Curso */}
                    <TabsContent value="conteudo">
                        <div className="space-y-4">
                            {modules.length === 0 ? (
                                <Card className="p-12 text-center">
                                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-xl font-semibold mb-2">Nenhum módulo disponível</h3>
                                    <p className="text-gray-600">O conteúdo será adicionado em breve.</p>
                                </Card>
                            ) : (
                                modules.map((module, idx) => (
                                    <Card key={module.id}>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                                                    {idx + 1}
                                                </span>
                                                {module.name}
                                            </CardTitle>
                                            <CardDescription>{module.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {module.lessons && module.lessons.length > 0 ? (
                                                    module.lessons.map((lesson: any, lessonIdx: number) => (
                                                        <div
                                                            key={lesson.id}
                                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {lesson.lesson_type === 'video' ? (
                                                                    <Play className="h-5 w-5 text-primary" />
                                                                ) : lesson.lesson_type === 'quiz' ? (
                                                                    <CheckCircle className="h-5 w-5 text-primary" />
                                                                ) : (
                                                                    <FileText className="h-5 w-5 text-primary" />
                                                                )}
                                                                <div>
                                                                    <div className="font-medium">
                                                                        {lessonIdx + 1}. {lesson.title}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600">
                                                                        {lesson.lesson_type === 'video' && lesson.video_duration_seconds && (
                                                                            <span>{Math.floor(lesson.video_duration_seconds / 60)} min</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Badge variant="outline">
                                                                {lesson.lesson_type}
                                                            </Badge>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-600">Nenhuma aula neste módulo</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    {/* Turmas Disponíveis */}
                    <TabsContent value="turmas">
                        <div className="space-y-4">
                            {classes.length === 0 ? (
                                <Card className="p-12 text-center">
                                    <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-xl font-semibold mb-2">Nenhuma turma aberta</h3>
                                    <p className="text-gray-600">Novas turmas serão abertas em breve.</p>
                                </Card>
                            ) : (
                                classes.map((classItem) => (
                                    <Card key={classItem.id}>
                                        <CardHeader>
                                            <CardTitle>{classItem.name}</CardTitle>
                                            <CardDescription>{classItem.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Professor:</span>
                                                    <span className="font-medium">{classItem.teacher?.full_name || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Início:</span>
                                                    <span className="font-medium">
                                                        {classItem.start_date ? new Date(classItem.start_date).toLocaleDateString('pt-BR') : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Horário:</span>
                                                    <span className="font-medium">{classItem.meeting_schedule || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Vagas:</span>
                                                    <span className="font-medium">{classItem.max_students} alunos</span>
                                                </div>
                                            </div>
                                            <Button className="w-full mt-4">
                                                Inscrever-se
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    {/* Sobre o Curso */}
                    <TabsContent value="sobre">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sobre o Curso</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-2">Descrição</h4>
                                    <p className="text-gray-700">{course.description || 'Sem descrição disponível.'}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Informações</h4>
                                    <dl className="space-y-2">
                                        <div className="flex justify-between">
                                            <dt className="text-gray-600">Categoria:</dt>
                                            <dd className="font-medium">{course.category}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-600">Carga Horária:</dt>
                                            <dd className="font-medium">{course.duration_hours} horas</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-600">Certificado:</dt>
                                            <dd className="font-medium">Sim, ao concluir</dd>
                                        </div>
                                    </dl>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
