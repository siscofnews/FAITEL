import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, Edit, Trash2, Save, X, Folder, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Course {
    id: string;
    title: string;
    description: string | null;
    duration_hours: number | null;
    thumbnail_url: string | null;
    is_active: boolean;
    created_at: string;
}

export default function GerenciarCursosEAD() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        duration_hours: "",
        thumbnail_url: "",
        is_active: true
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data, error } = await supabase
                .from("courses")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setCourses(data || []);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar cursos",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const courseData = {
                title: formData.title,
                description: formData.description || null,
                duration_hours: formData.duration_hours ? parseFloat(formData.duration_hours) : null,
                thumbnail_url: formData.thumbnail_url || null,
                is_active: formData.is_active
            };

            if (editingCourse) {
                const { error } = await supabase
                    .from("courses")
                    .update(courseData)
                    .eq("id", editingCourse.id);

                if (error) throw error;
                toast({ title: "Curso atualizado com sucesso!" });
            } else {
                const { error } = await supabase
                    .from("courses")
                    .insert(courseData);

                if (error) throw error;
                toast({ title: "Curso criado com sucesso!" });
            }

            setIsDialogOpen(false);
            setEditingCourse(null);
            setFormData({ title: "", description: "", duration_hours: "", thumbnail_url: "", is_active: true });
            fetchCourses();
        } catch (error: any) {
            toast({
                title: "Erro ao salvar curso",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleEdit = (course: Course) => {
        setEditingCourse(course);
        setFormData({
            title: course.title,
            description: course.description || "",
            duration_hours: course.duration_hours?.toString() || "",
            thumbnail_url: course.thumbnail_url || "",
            is_active: course.is_active
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza? Isso excluirá o curso e todo o conteúdo relacionado.")) return;

        try {
            const { error } = await supabase
                .from("courses")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast({ title: "Curso excluído com sucesso!" });
            fetchCourses();
        } catch (error: any) {
            toast({
                title: "Erro ao excluir curso",
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
                    <p className="mt-4 text-muted-foreground">Carregando cursos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">Gerenciar Cursos EAD</h1>
                        <p className="text-muted-foreground">Módulo FAITEL - SISCOF 3.0</p>
                    </div>
                </div>
                <Button onClick={() => {
                    setEditingCourse(null);
                    setFormData({ title: "", description: "", duration_hours: "", thumbnail_url: "", is_active: true });
                    setIsDialogOpen(true);
                }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Curso
                </Button>
            </div>

            {courses.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Nenhum curso cadastrado</h3>
                        <p className="text-muted-foreground mb-4">
                            Comece criando seu primeiro curso clicando no botão acima.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <Card key={course.id} className={`hover:shadow-lg transition-shadow ${!course.is_active ? 'opacity-60' : ''}`}>
                            {course.thumbnail_url && (
                                <div className="aspect-video bg-muted overflow-hidden">
                                    <img
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-xl">{course.title}</CardTitle>
                                        {course.duration_hours && (
                                            <CardDescription className="mt-1">
                                                {course.duration_hours}h de carga horária
                                            </CardDescription>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(course)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(course.id)}
                                            className="text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                    {course.description || "Sem descrição"}
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Folder className="w-4 h-4 mr-2" />
                                        Módulos
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Alunos
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCourse ? "Editar Curso" : "Novo Curso"}
                        </DialogTitle>
                        <DialogDescription>
                            Defina as informações básicas do curso. Módulos e aulas serão adicionados depois.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Título do Curso *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ex: Teologia Sistemática"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descreva o conteúdo do curso"
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="duration">Carga Horária (horas)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    step="0.5"
                                    value={formData.duration_hours}
                                    onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                                    placeholder="40"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="thumbnail">URL da Imagem</Label>
                                <Input
                                    id="thumbnail"
                                    value={formData.thumbnail_url}
                                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <Label htmlFor="is_active" className="cursor-pointer">
                                Curso ativo (visível para alunos)
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
