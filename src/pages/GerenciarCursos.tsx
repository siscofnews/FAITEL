import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, BookOpen, Home, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
    id: string;
    name: string;
    description: string;
    category: string;
    duration_hours: number;
    level: string;
    is_published: boolean;
    church_id: string;
    created_at: string;
}

export default function GerenciarCursos() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "biblica",
        duration_hours: 40,
        level: "Básico",
    });

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
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
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const courseData = {
                ...formData,
                church_id: user.id, // Temporário - depois pegar da igreja do usuário
            };

            if (editingCourse) {
                // Update
                const { error } = await supabase
                    .from("courses")
                    .update(courseData)
                    .eq("id", editingCourse.id);

                if (error) throw error;

                toast({
                    title: "Curso atualizado!",
                    description: "As alterações foram salvas com sucesso.",
                });
            } else {
                // Insert
                const { error } = await supabase
                    .from("courses")
                    .insert([courseData]);

                if (error) throw error;

                toast({
                    title: "Curso criado!",
                    description: "O novo curso foi adicionado ao catálogo.",
                });
            }

            setDialogOpen(false);
            resetForm();
            loadCourses();
        } catch (error: any) {
            toast({
                title: "Erro ao salvar curso",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja deletar este curso? Esta ação não pode ser desfeita.")) {
            return;
        }

        try {
            const { error } = await supabase
                .from("courses")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast({
                title: "Curso deletado",
                description: "O curso foi removido com sucesso.",
            });

            loadCourses();
        } catch (error: any) {
            toast({
                title: "Erro ao deletar curso",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const togglePublished = async (course: Course) => {
        try {
            const { error } = await supabase
                .from("courses")
                .update({ is_published: !course.is_published })
                .eq("id", course.id);

            if (error) throw error;

            toast({
                title: course.is_published ? "Curso despublicado" : "Curso publicado",
                description: course.is_published
                    ? "O curso não está mais visível para alunos."
                    : "O curso agora está visível para todos.",
            });

            loadCourses();
        } catch (error: any) {
            toast({
                title: "Erro",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const openEditDialog = (course: Course) => {
        setEditingCourse(course);
        setFormData({
            name: course.name,
            description: course.description,
            category: course.category,
            duration_hours: course.duration_hours,
            level: course.level,
        });
        setDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            category: "biblica",
            duration_hours: 40,
            level: "Básico",
        });
        setEditingCourse(null);
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            biblica: "Bíblica",
            teologica: "Teológica",
            ministerial: "Ministerial",
            discipulado: "Discipulado",
            lideranca: "Liderança",
        };
        return labels[category] || category;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Cursos</h1>
                            <p className="text-gray-600 mt-1">Crie e gerencie os cursos da Escola de Culto</p>
                        </div>
                        <Button onClick={() => navigate("/dashboard")} variant="outline">
                            <Home className="h-4 w-4 mr-2" />
                            Dashboard
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Actions */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-sm text-gray-600">
                            Total: <span className="font-semibold">{courses.length}</span> cursos
                        </p>
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetForm}>
                                <Plus className="h-4 w-4 mr-2" />
                                Novo Curso
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingCourse ? "Editar Curso" : "Criar Novo Curso"}
                                </DialogTitle>
                                <DialogDescription>
                                    Preencha as informações básicas do curso. Você poderá adicionar módulos e aulas depois.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Nome do Curso *</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Fundamentos da Fé Cristã"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Descrição</label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Descreva o curso, objetivos e o que os alunos aprenderão..."
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Categoria</label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="biblica">Bíblica</SelectItem>
                                                <SelectItem value="teologica">Teológica</SelectItem>
                                                <SelectItem value="ministerial">Ministerial</SelectItem>
                                                <SelectItem value="discipulado">Discipulado</SelectItem>
                                                <SelectItem value="lideranca">Liderança</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Nível</label>
                                        <Select
                                            value={formData.level}
                                            onValueChange={(value) => setFormData({ ...formData, level: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Básico">Básico</SelectItem>
                                                <SelectItem value="Intermediário">Intermediário</SelectItem>
                                                <SelectItem value="Avançado">Avançado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Carga Horária (h)</label>
                                        <Input
                                            type="number"
                                            value={formData.duration_hours}
                                            onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) })}
                                            min="1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-end pt-4">
                                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit">
                                        {editingCourse ? "Salvar Alterações" : "Criar Curso"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Courses List */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                    <Card className="p-12 text-center">
                        <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold mb-2">Nenhum curso cadastrado</h3>
                        <p className="text-gray-600 mb-4">Comece criando seu primeiro curso!</p>
                        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Primeiro Curso
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <Card key={course.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between mb-2">
                                        <Badge variant={course.is_published ? "default" : "secondary"}>
                                            {course.is_published ? "Publicado" : "Rascunho"}
                                        </Badge>
                                        <Badge variant="outline">{getCategoryLabel(course.category)}</Badge>
                                    </div>

                                    <CardTitle className="text-lg">{course.name}</CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {course.description || "Sem descrição"}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-4">
                                        <span>📚 {course.level}</span>
                                        <span>•</span>
                                        <span>⏱️ {course.duration_hours}h</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => openEditDialog(course)}
                                        >
                                            <Edit className="h-3 w-3 mr-1" />
                                            Editar
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => togglePublished(course)}
                                        >
                                            {course.is_published ? (
                                                <EyeOff className="h-3 w-3" />
                                            ) : (
                                                <Eye className="h-3 w-3" />
                                            )}
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(course.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="w-full mt-2"
                                        onClick={() => navigate(`/escola-culto/curso/${course.id}/gerenciar`)}
                                    >
                                        Gerenciar Módulos e Aulas →
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
