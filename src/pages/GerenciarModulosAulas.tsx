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
import { Plus, Edit, Trash2, ArrowLeft, Video, FileText, Upload, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
    content_type: 'video' | 'pdf';
    content_url: string | null;
    video_url?: string | null; // Keep for backward compatibility if needed
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
        content_type: 'video' as 'video' | 'pdf',
        content_url: "",
        video_duration_minutes: 0,
    });
    const [uploading, setUploading] = useState(false);

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast({
                title: "Arquivo inválido",
                description: "Por favor, selecione um arquivo PDF",
                variant: "destructive"
            });
            return;
        }

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${courseId}/${Date.now()}.${fileExt}`;
            
            // Try uploading to 'course-content' bucket
            // Note: Ensure this bucket exists and is public
            const { error: uploadError } = await supabase.storage
                .from('course-content')
                .upload(fileName, file);

            if (uploadError) {
                // Fallback to church-logos if course-content doesn't exist (temporary hack, better to handle properly)
                // But let's throw error to see what happens or guide user
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('course-content')
                .getPublicUrl(fileName);

            setLessonForm(prev => ({ ...prev, content_url: publicUrl }));
            toast({
                title: "Arquivo enviado!",
                description: "PDF carregado com sucesso."
            });
        } catch (error: any) {
            console.error("Upload error:", error);
            toast({
                title: "Erro no upload",
                description: "Erro ao enviar arquivo. Verifique se o bucket 'course-content' existe e é público.",
                variant: "destructive"
            });
        } finally {
            setUploading(false);
        }
    };

    const handleSaveLesson = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const lessonData = {
                name: lessonForm.name,
                description: lessonForm.description,
                content_type: lessonForm.content_type,
                content_url: lessonForm.content_url,
                video_duration_minutes: lessonForm.video_duration_minutes,
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
                content_type: lesson.content_type || (lesson.video_url ? 'video' : 'pdf'),
                content_url: lesson.content_url || lesson.video_url || "",
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
        setLessonForm({ name: "", description: "", content_type: 'video', content_url: "", video_duration_minutes: 0 });
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
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label>Tipo de Conteúdo</Label>
                                <RadioGroup
                                    value={lessonForm.content_type}
                                    onValueChange={(value: 'video' | 'pdf') => 
                                        setLessonForm({ ...lessonForm, content_type: value, content_url: "" })
                                    }
                                    className="flex space-x-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="video" id="video" />
                                        <Label htmlFor="video" className="flex items-center cursor-pointer">
                                            <Video className="h-4 w-4 mr-2" />
                                            Vídeo
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="pdf" id="pdf" />
                                        <Label htmlFor="pdf" className="flex items-center cursor-pointer">
                                            <FileText className="h-4 w-4 mr-2" />
                                            PDF / Material
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {lessonForm.content_type === 'video' ? (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Link do Vídeo (YouTube/Vimeo)</label>
                                    <Input
                                        value={lessonForm.content_url}
                                        onChange={(e) => setLessonForm({ ...lessonForm, content_url: e.target.value })}
                                        placeholder="https://youtube.com/..."
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Arquivo PDF</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                                id="file-upload"
                                                disabled={uploading}
                                            />
                                            <Label 
                                                htmlFor="file-upload"
                                                className={`flex items-center justify-center w-full h-10 px-4 border rounded-md cursor-pointer hover:bg-gray-50 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {uploading ? (
                                                    <span>Enviando...</span>
                                                ) : (
                                                    <>
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        {lessonForm.content_url ? "Trocar Arquivo" : "Selecionar PDF"}
                                                    </>
                                                )}
                                            </Label>
                                        </div>
                                    </div>
                                    {lessonForm.content_url && (
                                        <p className="text-sm text-green-600 mt-2 flex items-center">
                                            <FileText className="h-3 w-3 mr-1" />
                                            Arquivo vinculado com sucesso
                                        </p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-2">Duração (minutos) {lessonForm.content_type === 'pdf' ? '(Estimada)' : ''}</label>
                                <Input
                                    type="number"
                                    value={lessonForm.video_duration_minutes}
                                    onChange={(e) => setLessonForm({ ...lessonForm, video_duration_minutes: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => setLessonDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={uploading}>
                                    {uploading ? "Aguarde..." : "Salvar"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
