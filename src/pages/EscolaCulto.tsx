import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, BookOpen, Clock, Users, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
    id: string;
    name: string;
    description: string;
    category: string;
    duration_hours: number;
    thumbnail_url: string | null;
    church_id: string;
    is_published: boolean;
}

export default function EscolaCulto() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const { data, error } = await supabase
                    .from("courses")
                    .select("*")
                    .eq("is_published", true)
                    .eq("is_active", true)
                    .order("created_at", { ascending: false });

                if (error) throw error;
                setCourses(data || []);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
                toast({
                    title: "Erro ao carregar cursos",
                    description: errorMessage,
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        loadCourses();
    }, [toast]);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header com botão HOME */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <GraduationCap className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Escola de Culto Online</h1>
                            <p className="text-sm text-gray-600">Sistema Integrado de Ensino SISCOF</p>
                        </div>
                    </div>
                    <Button onClick={() => navigate("/")} variant="outline" size="sm">
                        <Home className="h-4 w-4 mr-2" />
                        Home
                    </Button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Total de Cursos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{courses.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Categorias</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {new Set(courses.map(c => c.category)).size}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Horas de Conteúdo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {courses.reduce((sum, c) => sum + (c.duration_hours || 0), 0)}h
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Turmas Ativas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">0</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-6">
                    <Button onClick={() => navigate("/escola-culto/meus-cursos")}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Meus Cursos
                    </Button>
                    <Button onClick={() => navigate("/escola-culto/minhas-turmas")} variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Minhas Turmas
                    </Button>
                    <Button onClick={() => navigate("/escola-culto/certificados")} variant="outline">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Certificados
                    </Button>
                </div>

                {/* Course Grid */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-4">Cursos Disponíveis</h2>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="animate-pulse">
                                    <div className="h-48 bg-gray-200 rounded-t-lg" />
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
                            <h3 className="text-xl font-semibold mb-2">Nenhum curso disponível</h3>
                            <p className="text-gray-600">Novos cursos serão adicionados em breve.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course) => (
                                <Card
                                    key={course.id}
                                    className="hover:shadow-lg transition-shadow cursor-pointer group"
                                    onClick={() => navigate(`/escola-culto/curso/${course.id}`)}
                                >
                                    <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-t-lg flex items-center justify-center">
                                        {course.thumbnail_url ? (
                                            <img
                                                src={course.thumbnail_url}
                                                alt={course.name}
                                                className="w-full h-full object-cover rounded-t-lg"
                                            />
                                        ) : (
                                            <BookOpen className="h-20 w-20 text-white opacity-50" />
                                        )}
                                    </div>

                                    <CardHeader>
                                        <div className="flex items-start justify-between mb-2">
                                            <Badge className={getCategoryColor(course.category)}>
                                                {getCategoryLabel(course.category)}
                                            </Badge>
                                        </div>
                                        <CardTitle className="group-hover:text-primary transition-colors">
                                            {course.name}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {course.description || "Curso completo com certificado"}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                <span>{course.duration_hours}h</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                <span>0 alunos</span>
                                            </div>
                                        </div>

                                        <Button className="w-full mt-4" variant="outline">
                                            Ver Detalhes
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
