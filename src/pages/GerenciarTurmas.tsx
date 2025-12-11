import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users, Calendar, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
    id: string;
    name: string;
}

interface Class {
    id: string;
    course_id: string;
    name: string;
    professor_name: string;
    start_date: string;
    end_date: string;
    schedule: string;
    max_students: number;
    is_active: boolean;
    created_at: string;
}

export default function GerenciarTurmas() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [courses, setCourses] = useState<Course[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | null>(null);

    const [formData, setFormData] = useState({
        course_id: "",
        name: "",
        professor_name: "",
        start_date: "",
        end_date: "",
        schedule: "",
        max_students: 30,
    });

    useEffect(() => {
        loadCourses();
        loadClasses();
    }, []);

    const loadCourses = async () => {
        try {
            const { data, error } = await supabase
                .from("courses")
                .select("id, name")
                .eq("is_published", true)
                .order("name");

            if (error) throw error;
            setCourses(data || []);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar cursos",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const loadClasses = async () => {
        try {
            const { data, error } = await supabase
                .from("course_classes")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setClasses(data || []);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar turmas",
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
            if (!user) throw new Error("Não autenticado");

            const classData = {
                ...formData,
                max_students: parseInt(formData.max_students.toString()),
                is_active: true,
            };

            if (editingClass) {
                const { error } = await supabase
                    .from("course_classes")
                    .update(classData)
                    .eq("id", editingClass.id);

                if (error) throw error;
                toast({ title: "Turma atualizada!" });
            } else {
                const { error } = await supabase
                    .from("course_classes")
                    .insert([classData]);

                if (error) throw error;
                toast({ title: "Turma criada com sucesso!" });
            }

            setDialogOpen(false);
            resetForm();
            loadClasses();
        } catch (error: any) {
            toast({
                title: "Erro ao salvar turma",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Deletar esta turma? Os alunos matriculados perderão acesso.")) return;

        try {
            const { error } = await supabase
                .from("course_classes")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast({ title: "Turma deletada" });
            loadClasses();
        } catch (error: any) {
            toast({
                title: "Erro ao deletar",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const toggleActive = async (classItem: Class) => {
        try {
            const { error } = await supabase
                .from("course_classes")
                .update({ is_active: !classItem.is_active })
                .eq("id", classItem.id);

            if (error) throw error;
            toast({
                title: classItem.is_active ? "Turma desativada" : "Turma ativada",
            });
            loadClasses();
        } catch (error: any) {
            toast({
                title: "Erro",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const openEditDialog = (classItem: Class) => {
        setEditingClass(classItem);
        setFormData({
            course_id: classItem.course_id,
            name: classItem.name,
            professor_name: classItem.professor_name,
            start_date: classItem.start_date,
            end_date: classItem.end_date,
            schedule: classItem.schedule,
            max_students: classItem.max_students,
        });
        setDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            course_id: "",
            name: "",
            professor_name: "",
            start_date: "",
            end_date: "",
            schedule: "",
            max_students: 30,
        });
        setEditingClass(null);
    };

    const getCourseName = (courseId: string) => {
        return courses.find((c) => c.id === courseId)?.name || "Curso não encontrado";
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Gerenciar Turmas</h1>
                            <p className="text-gray-600 mt-1">Crie e gerencie turmas para os cursos</p>
                        </div>
                        <Button onClick={() => navigate("/dashboard")} variant="outline">
                            <Home className="h-4 w-4 mr-2" />
                            Dashboard
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-sm text-gray-600">
                        Total: <span className="font-semibold">{classes.length}</span> turmas
                    </p>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetForm}>
                                <Plus className="h-4 w-4 mr-2" />
                                Nova Turma
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingClass ? "Editar Turma" : "Criar Nova Turma"}
                                </DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Curso *</label>
                                    <Select
                                        value={formData.course_id}
                                        onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o curso" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map((course) => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    {course.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Nome da Turma *</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Turma A - Manhã"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Professor</label>
                                    <Input
                                        value={formData.professor_name}
                                        onChange={(e) => setFormData({ ...formData, professor_name: e.target.value })}
                                        placeholder="Nome do professor"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Data de Início</label>
                                        <Input
                                            type="date"
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Data de Término</label>
                                        <Input
                                            type="date"
                                            value={formData.end_date}
                                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Horário</label>
                                    <Input
                                        value={formData.schedule}
                                        onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                                        placeholder="Ex: Terças e Quintas, 19h-21h"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Máximo de Alunos
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.max_students}
                                        onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
                                        min="1"
                                        max="100"
                                    />
                                </div>

                                <div className="flex gap-2 justify-end pt-4">
                                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit">
                                        {editingClass ? "Salvar Alterações" : "Criar Turma"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Classes List */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                ) : classes.length === 0 ? (
                    <Card className="p-12 text-center">
                        <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold mb-2">Nenhuma turma cadastrada</h3>
                        <p className="text-gray-600 mb-4">Crie a primeira turma para começar!</p>
                        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Primeira Turma
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {classes.map((classItem) => (
                            <Card key={classItem.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between mb-2">
                                        <Badge variant={classItem.is_active ? "default" : "secondary"}>
                                            {classItem.is_active ? "Ativa" : "Inativa"}
                                        </Badge>
                                    </div>

                                    <CardTitle className="text-lg">{classItem.name}</CardTitle>
                                    <CardDescription>{getCourseName(classItem.course_id)}</CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <div className="space-y-2 text-sm mb-4">
                                        {classItem.professor_name && (
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-gray-400" />
                                                <span>Professor: {classItem.professor_name}</span>
                                            </div>
                                        )}
                                        {classItem.schedule && (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span>{classItem.schedule}</span>
                                            </div>
                                        )}
                                        {classItem.start_date && (
                                            <div className="text-gray-600">
                                                {new Date(classItem.start_date).toLocaleDateString()} até{" "}
                                                {classItem.end_date ? new Date(classItem.end_date).toLocaleDateString() : "..."}
                                            </div>
                                        )}
                                        <div className="text-gray-600">
                                            Vagas: 0/{classItem.max_students}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => openEditDialog(classItem)}
                                        >
                                            <Edit className="h-3 w-3 mr-1" />
                                            Editar
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => toggleActive(classItem)}
                                        >
                                            {classItem.is_active ? "Desativar" : "Ativar"}
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(classItem.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="w-full mt-2"
                                        onClick={() => navigate(`/turma/${classItem.id}/alunos`)}
                                    >
                                        Ver Alunos Matriculados →
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
