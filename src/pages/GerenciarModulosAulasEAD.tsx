import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Folder, FileText, Plus, Edit, Trash2, Save, X, ArrowLeft, GripVertical } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    content_url: string | null;
    duration_minutes: number | null;
    order_index: number;
}

export default function GerenciarModulosAulas() {
    const { courseId } = useParams<{ courseId: string }>();
    const [courseName, setCourseName] = useState("");
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
    const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [selectedModuleId, setSelectedModuleId] = useState<string>("");
    const { toast } = useToast();
    const navigate = useNavigate();

    const [moduleForm, setModuleForm] = useState({
        title: "",
        description: ""
    });

    const [lessonForm, setLessonForm] = useState({
        title: "",
        content_type: "video",
        content_url: "",
        duration_minutes: ""
    });

    useEffect(() => {
        if (courseId) {
            fetchCourseData();
        }
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            // Buscar nome do curso
            const { data: courseData } = await supabase
                .from("courses")
                .select("title")
                .eq("id", courseId)
                .single();

            if (courseData) setCourseName(courseData.title);

            // Buscar módulos
            const { data: modulesData, error: modulesError } = await supabase
                .from("modules")
                .select("*")
                .eq("course_id", courseId)
                .order("order_index", { ascending: true });

            if (modulesError) throw modulesError;

            // Buscar aulas para cada módulo
            const modulesWithLessons = await Promise.all(
                (modulesData || []).map(async (module) => {
                    const { data: lessonsData } = await supabase
                        .from("lessons")
                        .select("*")
                        .eq("module_id", module.id)
                        .order("order_index", { ascending: true });

                    return {
                        ...module,
                        lessons: lessonsData || []
                    };
                })
            );

            setModules(modulesWithLessons);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar dados",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveModule = async () => {
        try {
            if (editingModule) {
                // Update
                const { error } = await supabase
                    .from("modules")
                    .update({
                        title: moduleForm.title,
                        description: moduleForm.description
                    })
                    .eq("id", editingModule.id);

                if (error) throw error;
                toast({ title: "Módulo atualizado!" });
            } else {
                // Create
                const maxOrder = modules.length > 0 ? Math.max(...modules.map(m => m.order_index)) : 0;
                const { error } = await supabase
                    .from("modules")
                    .insert({
                        course_id: courseId,
                        title: moduleForm.title,
                        description: moduleForm.description,
                        order_index: maxOrder + 1
                    });

                if (error) throw error;
                toast({ title: "Módulo criado!" });
            }

            setIsModuleDialogOpen(false);
            setEditingModule(null);
            setModuleForm({ title: "", description: "" });
            fetchCourseData();
        } catch (error: any) {
            toast({
                title: "Erro ao salvar módulo",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleSaveLesson = async () => {
        try {
            if (editingLesson) {
                // Update
                const { error } = await supabase
                    .from("lessons")
                    .update({
                        title: lessonForm.title,
                        content_type: lessonForm.content_type,
                        content_url: lessonForm.content_url || null,
                        duration_minutes: lessonForm.duration_minutes ? parseInt(lessonForm.duration_minutes) : null
                    })
                    .eq("id", editingLesson.id);

                if (error) throw error;
                toast({ title: "Aula atualizada!" });
            } else {
                // Create
                const module = modules.find(m => m.id === selectedModuleId);
                const maxOrder = module && module.lessons.length > 0
                    ? Math.max(...module.lessons.map(l => l.order_index))
                    : 0;

                const { error } = await supabase
                    .from("lessons")
                    .insert({
                        module_id: selectedModuleId,
                        title: lessonForm.title,
                        content_type: lessonForm.content_type,
                        content_url: lessonForm.content_url || null,
                        duration_minutes: lessonForm.duration_minutes ? parseInt(lessonForm.duration_minutes) : null,
                        order_index: maxOrder + 1
                    });

                if (error) throw error;
                toast({ title: "Aula criada!" });
            }

            setIsLessonDialogOpen(false);
            setEditingLesson(null);
            setLessonForm({ title: "", content_type: "video", content_url: "", duration_minutes: "" });
            fetchCourseData();
        } catch (error: any) {
            toast({
                title: "Erro ao salvar aula",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleDeleteModule = async (id: string) => {
        if (!confirm("Deletar módulo e todas as aulas?")) return;

        try {
            const { error } = await supabase
                .from("modules")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast({ title: "Módulo excluído!" });
            fetchCourseData();
        } catch (error: any) {
            toast({
                title: "Erro ao excluir",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleDeleteLesson = async (id: string) => {
        if (!confirm("Deletar esta aula?")) return;

        try {
            const { error } = await supabase
                .from("lessons")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast({ title: "Aula excluída!" });
            fetchCourseData();
        } catch (error: any) {
            toast({
                title: "Erro ao excluir",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <Button
                variant="ghost"
                onClick={() => navigate("/gerenciar-cursos-ead")}
                className="mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Cursos
            </Button>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Gerenciar Conteúdo</h1>
                    <p className="text-muted-foreground">{courseName}</p>
                </div>
                <Button onClick={() => {
                    setEditingModule(null);
                    setModuleForm({ title: "", description: "" });
                    setIsModuleDialogOpen(true);
                }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Módulo
                </Button>
            </div>

            {modules.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Folder className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Nenhum módulo cadastrado</h3>
                        <p className="text-muted-foreground">Comece criando o primeiro módulo do curso.</p>
                    </CardContent>
                </Card>
            ) : (
                <Accordion type="multiple" className="space-y-4">
                    {modules.map((module, moduleIndex) => (
                        <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-6">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-4 w-full">
                                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                                    <div className="flex-1 text-left">
                                        <h3 className="font-semibold text-lg">
                                            Módulo {moduleIndex + 1}: {module.title}
                                        </h3>
                                        {module.description && (
                                            <p className="text-sm text-muted-foreground">{module.description}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingModule(module);
                                                setModuleForm({ title: module.title, description: module.description || "" });
                                                setIsModuleDialogOpen(true);
                                            }}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteModule(module.id);
                                            }}
                                            className="text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 pt-4">
                                    <div className="flex justify-end">
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setSelectedModuleId(module.id);
                                                setEditingLesson(null);
                                                setLessonForm({ title: "", content_type: "video", content_url: "", duration_minutes: "" });
                                                setIsLessonDialogOpen(true);
                                            }}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Nova Aula
                                        </Button>
                                    </div>

                                    {module.lessons.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            Nenhuma aula neste módulo
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {module.lessons.map((lesson, lessonIndex) => (
                                                <div
                                                    key={lesson.id}
                                                    className="flex items-center gap-4 p-4 rounded-lg border"
                                                >
                                                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                                                    <FileText className="w-5 h-5 text-primary" />
                                                    <div className="flex-1">
                                                        <h4 className="font-medium">
                                                            {moduleIndex + 1}.{lessonIndex + 1} {lesson.title}
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {lesson.content_type}
                                                            {lesson.duration_minutes && ` · ${lesson.duration_minutes} min`}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setSelectedModuleId(module.id);
                                                                setEditingLesson(lesson);
                                                                setLessonForm({
                                                                    title: lesson.title,
                                                                    content_type: lesson.content_type,
                                                                    content_url: lesson.content_url || "",
                                                                    duration_minutes: lesson.duration_minutes?.toString() || ""
                                                                });
                                                                setIsLessonDialogOpen(true);
                                                            }}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteLesson(lesson.id)}
                                                            className="text-destructive"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}

            {/* Module Dialog */}
            <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingModule ? "Editar Módulo" : "Novo Módulo"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Título *</Label>
                            <Input
                                value={moduleForm.title}
                                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                                placeholder="Ex: Introdução ao Tema"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Descrição</Label>
                            <Textarea
                                value={moduleForm.description}
                                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModuleDialogOpen(false)}>
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveModule}>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Lesson Dialog */}
            <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingLesson ? "Editar Aula" : "Nova Aula"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Título *</Label>
                            <Input
                                value={lessonForm.title}
                                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                                placeholder="Ex: Aula 1 - Conceitos Básicos"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Tipo de Conteúdo *</Label>
                                <Select
                                    value={lessonForm.content_type}
                                    onValueChange={(value) => setLessonForm({ ...lessonForm, content_type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="video">Vídeo (YouTube/Vimeo)</SelectItem>
                                        <SelectItem value="pdf">PDF</SelectItem>
                                        <SelectItem value="document">Documento</SelectItem>
                                        <SelectItem value="html">HTML</SelectItem>
                                        <SelectItem value="text">Texto</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Duração (minutos)</Label>
                                <Input
                                    type="number"
                                    value={lessonForm.duration_minutes}
                                    onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: e.target.value })}
                                    placeholder="30"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>URL do Conteúdo</Label>
                            <Input
                                value={lessonForm.content_url}
                                onChange={(e) => setLessonForm({ ...lessonForm, content_url: e.target.value })}
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                            <p className="text-xs text-muted-foreground">
                                Para vídeos: Cole o link do YouTube ou Vimeo
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsLessonDialogOpen(false)}>
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveLesson}>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
