import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, PlayCircle, CheckCircle2, Lock, Clock, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Module {
    id: string;
    name: string;
    description: string;
    order_index: number;
}

interface Lesson {
    id: string;
    module_id: string;
    title: string;
    description: string;
    video_url: string | null;
    duration_minutes: number | null;
    order_index: number;
}

export default function ConteudoTurma() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [className, setClassName] = useState("");
    const [courseName, setCourseName] = useState("");
    const [modules, setModules] = useState<Module[]>([]);
    const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (classId) {
            loadClassData();
            loadCourseContent();
        }
    }, [classId]);

    const loadClassData = async () => {
        try {
            const { data: classData, error: classError } = await supabase
                .from("course_classes")
                .select("name, course_id")
                .eq("id", classId)
                .single();

            if (classError) throw classError;
            setClassName(classData.name);

            // Load course name
            const { data: courseData, error: courseError } = await supabase
                .from("courses")
                .select("name")
                .eq("id", classData.course_id)
                .single();

            if (courseError) throw courseError;
            setCourseName(courseData.name);

            // Load student progress
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: enrollment } = await supabase
                    .from("course_enrollments")
                    .select("progress_percentage")
                    .eq("class_id", classId)
                    .eq("student_id", user.id)
                    .single();

                if (enrollment) {
                    setProgress(enrollment.progress_percentage || 0);
                }
            }
        } catch (error: any) {
            toast({
                title: "Erro ao carregar dados da turma",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const loadCourseContent = async () => {
        try {
            // Get course_id from class
            const { data: classData } = await supabase
                .from("course_classes")
                .select("course_id")
                .eq("id", classId)
                .single();

            if (!classData) return;

            // Load modules
            const { data: modulesData, error: modulesError } = await supabase
                .from("course_modules")
                .select("*")
                .eq("course_id", classData.course_id)
                .order("order_index");

            if (modulesError) throw modulesError;
            setModules(modulesData || []);

            // Load lessons for each module
            if (modulesData) {
                const lessonsMap: Record<string, Lesson[]> = {};

                for (const module of modulesData) {
                    const { data: lessonsData, error: lessonsError } = await supabase
                        .from("course_lessons")
                        .select("*")
                        .eq("module_id", module.id)
                        .order("order_index");

                    if (lessonsError) throw lessonsError;
                    lessonsMap[module.id] = lessonsData || [];
                }

                setLessons(lessonsMap);
            }
        } catch (error: any) {
            toast({
                title: "Erro ao carregar conteúdo",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const openLesson = (lessonId: string) => {
        navigate(`/aula/${lessonId}/assistir`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate("/minhas-turmas")}
                                className="mb-2"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Button>
                            <h1 className="text-3xl font-bold">{courseName}</h1>
                            <p className="text-gray-600">{className}</p>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Seu Progresso</span>
                            <span className="text-sm font-bold">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader>
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                ) : modules.length === 0 ? (
                    <Card className="p-12 text-center">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold mb-2">Conteúdo em breve</h3>
                        <p className="text-gray-600">
                            O professor ainda não adicionou conteúdo a este curso
                        </p>
                    </Card>
                ) : (
                    <Accordion type="multiple" className="space-y-4">
                        {modules.map((module, moduleIndex) => {
                            const moduleLessons = lessons[module.id] || [];
                            const completedLessons = 0; // TODO: Track completed lessons

                            return (
                                <AccordionItem
                                    key={module.id}
                                    value={module.id}
                                    className="border rounded-lg overflow-hidden"
                                >
                                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between w-full pr-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold">
                                                    {moduleIndex + 1}
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="font-semibold text-lg">{module.name}</h3>
                                                    {module.description && (
                                                        <p className="text-sm text-gray-600">{module.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge variant="outline">
                                                {completedLessons}/{moduleLessons.length} aulas
                                            </Badge>
                                        </div>
                                    </AccordionTrigger>

                                    <AccordionContent className="px-6 pb-4">
                                        <div className="space-y-2">
                                            {moduleLessons.length === 0 ? (
                                                <p className="text-sm text-gray-500 py-4">
                                                    Nenhuma aula neste módulo ainda
                                                </p>
                                            ) : (
                                                moduleLessons.map((lesson, lessonIndex) => (
                                                    <Card
                                                        key={lesson.id}
                                                        className="hover:shadow-md transition-shadow cursor-pointer"
                                                        onClick={() => openLesson(lesson.id)}
                                                    >
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3 flex-1">
                                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                                                                        <PlayCircle className="h-4 w-4 text-indigo-600" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h4 className="font-medium">
                                                                            {lessonIndex + 1}. {lesson.title}
                                                                        </h4>
                                                                        {lesson.duration_minutes && (
                                                                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                                                                <Clock className="h-3 w-3" />
                                                                                <span>{lesson.duration_minutes} min</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <Button size="sm" variant="ghost">
                                                                    Assistir →
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                )}
            </div>
        </div>
    );
}
