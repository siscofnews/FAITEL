import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Users, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Enrollment {
    id: string;
    student_id: string;
    student_name: string;
    enrollment_date: string;
    status: string;
    progress_percentage: number;
    final_grade: number | null;
}

export default function AlunosMatriculados() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [className, setClassName] = useState("");
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (classId) {
            loadClassData();
            loadEnrollments();
        }
    }, [classId]);

    const loadClassData = async () => {
        try {
            const { data, error } = await supabase
                .from("course_classes")
                .select("name")
                .eq("id", classId)
                .single();

            if (error) throw error;
            setClassName(data.name);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar turma",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const loadEnrollments = async () => {
        try {
            const { data, error } = await supabase
                .from("course_enrollments")
                .select("*")
                .eq("class_id", classId)
                .order("enrollment_date", { ascending: false });

            if (error) throw error;
            setEnrollments(data || []);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar alunos",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (enrollmentId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from("course_enrollments")
                .update({ status: newStatus })
                .eq("id", enrollmentId);

            if (error) throw error;

            toast({
                title: "Status atualizado!",
                description: `Matrícula ${newStatus === "active" ? "aprovada" : "atualizada"}`,
            });

            loadEnrollments();
        } catch (error: any) {
            toast({
                title: "Erro ao atualizar status",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { label: string; className: string }> = {
            pending: { label: "Pendente", className: "bg-yellow-500" },
            active: { label: "Ativo", className: "bg-green-500" },
            completed: { label: "Concluído", className: "bg-blue-500" },
            cancelled: { label: "Cancelado", className: "bg-red-500" },
        };

        const config = variants[status] || { label: status, className: "bg-gray-500" };
        return <Badge className={config.className}>{config.label}</Badge>;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate("/gerenciar-turmas")}
                                className="mb-2"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Button>
                            <h1 className="text-3xl font-bold">Alunos Matriculados</h1>
                            <p className="text-gray-600">{className}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{enrollments.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Pendentes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-600">
                                {enrollments.filter((e) => e.status === "pending").length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Ativos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">
                                {enrollments.filter((e) => e.status === "active").length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Concluídos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">
                                {enrollments.filter((e) => e.status === "completed").length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Enrollments List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                ) : enrollments.length === 0 ? (
                    <Card className="p-12 text-center">
                        <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold mb-2">Nenhum aluno matriculado</h3>
                        <p className="text-gray-600">Esta turma ainda não possui matrículas</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {enrollments.map((enrollment) => (
                            <Card key={enrollment.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold">{enrollment.student_name}</h3>
                                                {getStatusBadge(enrollment.status)}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span>
                                                        Matrícula:{" "}
                                                        {new Date(enrollment.enrollment_date).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4 text-gray-400" />
                                                    <span>Progresso: {enrollment.progress_percentage}%</span>
                                                </div>

                                                {enrollment.final_grade !== null && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">
                                                            Nota Final: {enrollment.final_grade}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {enrollment.status === "pending" && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => updateStatus(enrollment.id, "active")}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Aprovar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => updateStatus(enrollment.id, "cancelled")}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Rejeitar
                                                    </Button>
                                                </>
                                            )}

                                            {enrollment.status === "active" && (
                                                <Select
                                                    value={enrollment.status}
                                                    onValueChange={(value) => updateStatus(enrollment.id, value)}
                                                >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="active">Ativo</SelectItem>
                                                        <SelectItem value="completed">Concluído</SelectItem>
                                                        <SelectItem value="cancelled">Cancelado</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
