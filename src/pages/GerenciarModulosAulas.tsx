import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Edit, Trash2, ArrowLeft, Video, FileText, Upload } from "lucide-react";
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
    name: string;
    description: string;
    video_url: string | null;
    video_duration_minutes: number;
    order_index: number;
}

export default function GerenciarModulosAulas() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [courseName, setCourseName] = useState("");
    const [modules, setModules] = useState<Module[]>([]);
    const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
    const [loading, setLoading] = useState(true);

    // Dialog states
    const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
    const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [selectedModuleId, setSelectedModuleId] = useState<string>("");

    // Form states
    const [moduleForm, setModuleForm] = useState({ name: "", description: "" });
    const [lessonForm, setLessonForm] = useState({
        name: "",
        description: "",
        video_url: "",
        video_duration_minutes: 0,
    });

    useEffect(() => {
        if (courseId) {
            loadCourse();
            loadModules();
        }
    }, [courseId]);

    const loadCourse = async () => {
        try {
            const { data, error } = await supabase
                .from("courses")
                .select("name")
                .eq("id", courseId)
                .single();

            if (error) throw error;
            setCourseName(data.name);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar curso",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const loadModules = async () => {
        try {
            const { data, error } = await supabase
                .from("course_modules")
                .select("*")
                .eq("course_id", courseId)
                .order("order_index");

            if (error) throw error;
            setModules(data || []);

            // Load lessons for each module
            if (data) {
                for (const module of data) {
                    await loadLessons(module.id);
                }
            }
        } catch (error: any) {
            toast({
                title: "Erro ao carregar módulos",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const loadLessons = async (moduleId: string) => {
        try {
            const { data, error } = await supabase
                .from("course_lessons")
                .select("*")
                .eq("module_id", moduleId)
                .order("order_index");

            if (error) throw error;
            setLessons((prev) => ({ ...prev, [moduleId]: data || [] }));
        } catch (error: any) {
            console.error("Erro ao carregar aulas:", error);
        }
    };

    const handleSaveModule = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const moduleData = {
                ...moduleForm,
                course_id: courseId,
                order_index: editingModule ? editingModule.order_index : modules.length + 1,
            };

            if (editingModule) {
                const { error } = await supabase
                    .from("course_modules")
                    .update(moduleData)
                    .eq("id", editingModule.id);

                if (error) throw error;
                toast({ title: "Módulo atualizado!" });
            } else {
                const { error } = await supabase
                    .from("course_modules")
                    .insert([moduleData]);

                if (error) throw error;
                toast({ title: "Módulo criado!" });
            }

            setModuleDialogOpen(false);
            resetModuleForm();
            loadModules();
        } catch (error: any) {
            toast({
                title: "Erro ao salvar módulo",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleSaveLesson = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const lessonData = {
                ...lessonForm,
                module_id: selectedModuleId,
                order_index: editingLesson
                    ? editingLesson.order_index
                    : (lessons[selectedModuleId]?.length || 0) + 1,
            };

            if (editingLesson) {
                const { error } = await supabase
                    .from("course_lessons")
                    .update(lessonData)
                    .eq("id", editingLesson.id);

                if (error) throw error;
                toast({ title: "Aula atualizada!" });
            } else {
                const { error } = await supabase
                    .from("course_lessons")
                    .insert([lessonData]);

                if (error) throw error;
                toast({ title: "Aula criada!" });
            }

            setLessonDialogOpen(false);
            resetLessonForm();
            loadLessons(selectedModuleId);
        } catch (error: any) {
            toast({
                title: "Erro ao salvar aula",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleDeleteModule = async (id: string) => {
        if (!confirm("Deletar este módulo e todas as suas aulas?")) return;

        try {
            const { error } = await supabase
                .from("course_modules")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast({ title: "Módulo deletado" });
            loadModules();
        } catch (error: any) {
            toast({
                title: "Erro ao deletar",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleDeleteLesson = async (id: string, moduleId: string) => {
        if (!confirm("Deletar esta aula?")) return;

        try {
            const { error } = await supabase
                .from("course_lessons")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast({ title: "Aula deletada" });
            loadLessons(moduleId);
        } catch (error: any) {
            toast({
                title: "Erro ao deletar",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const openModuleEdit = (module: Module) => {
        setEditingModule(module);
        setModuleForm({ name: module.name, description: module.description });
        setModuleDialogOpen(true);
    };

    const openLessonDialog = (moduleId: string, lesson?: Lesson) => {
        setSelectedModuleId(moduleId);
        if (lesson) {
            setEditingLesson(lesson);
            setLessonForm({
                name: lesson.name,
                description: lesson.description,
                video_url: lesson.video_url || "",
                video_duration_minutes: lesson.video_duration_minutes,
            });
        } else {
            resetLessonForm();
        }
        setLessonDialogOpen(true);
    };

    const resetModuleForm = () => {
        setModuleForm({ name: "", description: "" });
        setEditingModule(null);
    };

    const resetLessonForm = () => {
        setLessonForm({ name: "", description: "", video_url: "", video_duration_minutes: 0 });
        setEditingLesson(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate("/gerenciar-cursos")}
                                className="mb-2"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Button>
                            <h1 className="text-3xl font-bold">{courseName}</h1>
                            <p className="text-gray-600">Gerenciar módulos e aulas</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Add Module Button */}
                <div className="mb-6">
                    <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetModuleForm}>
                                <Plus className="h-4 w-4 mr-2" />
                                Novo Módulo
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingModule ? "Editar Módulo" : "Criar Novo Módulo"}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSaveModule} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Nome do Módulo *</label>
                                    <Input
                                        value={moduleForm.name}
                                        onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
                                        placeholder="Ex: Introdução ao Evangelho de João"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Descrição</label>
                                    <Textarea
                                        value={moduleForm.description}
                                        onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button type="button" variant="outline" onClick={() => setModuleDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit">Salvar</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Modules Accordion */}
                {loading ? (
                    <div>Carregando...</div>
                ) : modules.length === 0 ? (
                    <Card className="p-12 text-center">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold mb-2">Nenhum módulo criado</h3>
                        <p className="text-gray-600 mb-4">Comece criando o primeiro módulo do curso</p>
                    </Card>
                ) : (
                    <Accordion type="single" collapsible className="space-y-4">
                        {modules.map((module, index) => (
                            <AccordionItem key={module.id} value={module.id}>
                                <Card>
                                    <AccordionTrigger className="px-6 hover:no-underline">
                                        <div className="flex items-center justify-between w-full pr-4">
                                            <div className="flex items-center gap-3 text-left">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg">{module.name}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        {lessons[module.id]?.length || 0} aulas
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openModuleEdit(module)}
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDeleteModule(module.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </AccordionTrigger>

                                    <AccordionContent>
                                        <div className="px-6 pb-4">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openLessonDialog(module.id)}
                                                className="mb-4"
                                            >
                                                <Plus className="h-3 w-3 mr-2" />
                                                Nova Aula
                                            </Button>

                                            {lessons[module.id]?.length === 0 ? (
                                                <p className="text-sm text-gray-500 py-4">Nenhuma aula criada ainda</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {lessons[module.id]?.map((lesson, lessonIndex) => (
                                                        <div
                                                            key={lesson.id}
                                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Video className="h-4 w-4 text-gray-400" />
                                                                <div>
                                                                    <p className="font-medium text-sm">{lesson.name}</p>
                                                                    <p className="text-xs text-gray-600">
                                                                        {lesson.video_duration_minutes} minutos
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => openLessonDialog(module.id, lesson)}
                                                                >
                                                                    <Edit className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleDeleteLesson(lesson.id, module.id)}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </Card>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}

                {/* Lesson Dialog */}
                <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingLesson ? "Editar Aula" : "Nova Aula"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSaveLesson} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Título da Aula *</label>
                                <Input
                                    value={lessonForm.name}
                                    onChange={(e) => setLessonForm({ ...lessonForm, name: e.target.value })}
                                    placeholder="Ex: A Vida de Jesus"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Descrição</label>
                                <Textarea
                                    value={lessonForm.description}
                                    onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    URL do Vídeo (YouTube, Vimeo, etc)
                                </label>
                                <Input
                                    value={lessonForm.video_url}
                                    onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                                    placeholder="https://youtube.com/watch?v=..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Duração (minutos)</label>
                                <Input
                                    type="number"
                                    value={lessonForm.video_duration_minutes}
                                    onChange={(e) =>
                                        setLessonForm({ ...lessonForm, video_duration_minutes: parseInt(e.target.value) })
                                    }
                                    min="1"
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => setLessonDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">Salvar</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
