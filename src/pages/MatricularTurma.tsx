import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Users, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendWelcomeEmail } from "@/services/EmailService";

interface CourseClass {
    id: string;
    name: string;
    professor_name: string;
    schedule: string;
    start_date: string;
    end_date: string;
    max_students: number;
    is_active: boolean;
}

export default function MatricularTurma() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [courseName, setCourseName] = useState("");
    const [classes, setClasses] = useState<CourseClass[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        if (courseId) {
            loadCourse();
            loadClasses();
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

    const loadClasses = async () => {
        try {
            const { data, error } = await supabase
                .from("course_classes")
                .select("*")
                .eq("course_id", courseId)
                .eq("is_active", true)
                .order("start_date");

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

  const handleEnroll = async () => {
        if (!selectedClass) {
            toast({
                title: "Selecione uma turma",
                variant: "destructive",
            });
            return;
        }

        setEnrolling(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Não autenticado");

            // Check if already enrolled
            const { data: existing } = await supabase
                .from("course_enrollments")
                .select("id")
                .eq("class_id", selectedClass)
                .eq("student_id", user.id)
                .single();

            if (existing) {
                toast({
                    title: "Você já está matriculado nesta turma",
                    variant: "destructive",
                });
                setEnrolling(false);
                return;
            }

            // Create enrollment
            const { error } = await supabase
                .from("course_enrollments")
                .insert([
                    {
                        class_id: selectedClass,
                        student_id: user.id,
                        student_name: user.email?.split("@")[0] || "Aluno",
                        status: "pending",
                        enrollment_date: new Date().toISOString(),
                        progress_percentage: 0,
                    },
                ]);

            if (error) throw error;

            try {
                const { data: course } = await supabase.from('courses').select('name').eq('id', courseId).single();
                const studentName = user.email?.split('@')[0] || 'Aluno';
                const courseName = course?.name || 'Curso';
                let subject = `Bem-vindo(a) ao curso ${courseName}`;
                let template = `Olá {{student_name}},\n\nSeja muito bem-vindo(a) à FAITEL!\n\nÉ uma alegria tê-lo(a) conosco neste curso {{course_name}}. Nossa missão é servir com excelência.\n\nAssinado,\nChanceler Valdinei da Conceição Santos`;
                try {
                    const { data: tpl } = await supabase.from('welcome_email_templates' as any).select('*').eq('target_type','COURSE').eq('target_id', courseId).maybeSingle();
                    if (tpl) { subject = tpl.subject || subject; template = tpl.template || template; }
                    else {
                        const { data: gtpl } = await supabase.from('welcome_email_templates' as any).select('*').eq('target_type','GLOBAL').maybeSingle();
                        if (gtpl) { subject = gtpl.subject || subject; template = gtpl.template || template; }
                        else {
                            const local = JSON.parse(localStorage.getItem('welcome_templates')||'{}');
                            const kCourse = `COURSE:${courseId}`; const kGlobal = 'GLOBAL';
                            if (local[kCourse]) { subject = local[kCourse].subject || subject; template = local[kCourse].template || template; }
                            else if (local[kGlobal]) { subject = local[kGlobal].subject || subject; template = local[kGlobal].template || template; }
                        }
                    }
                } catch {}
                const body = template.replace(/\{\{student_name\}\}/g, studentName).replace(/\{\{course_name\}\}/g, courseName);
                await sendWelcomeEmail(user.email || '', subject, body);
            } catch {}

            toast({
                title: "Matrícula realizada!",
                description: "Aguarde aprovação do administrador",
            });

            setDialogOpen(false);
            setTimeout(() => {
                navigate("/minhas-turmas");
            }, 1500);
        } catch (error: any) {
            toast({
                title: "Erro ao realizar matrícula",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setEnrolling(false);
        }
    };

    const openEnrollDialog = (classId: string) => {
        setSelectedClass(classId);
        setDialogOpen(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/escola-culto/curso/${courseId}`)}
                                className="mb-2"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Button>
                            <h1 className="text-3xl font-bold">{courseName}</h1>
                            <p className="text-gray-600">Selecione uma turma para se matricular</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
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
                        <h3 className="text-xl font-semibold mb-2">Nenhuma turma disponível</h3>
                        <p className="text-gray-600 mb-4">
                            Não há turmas ativas no momento para este curso
                        </p>
                        <Button onClick={() => navigate("/escola-culto")}>
                            Ver Outros Cursos
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {classes.map((classItem) => (
                            <Card
                                key={classItem.id}
                                className="hover:shadow-lg transition-shadow border-2 border-blue-100"
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between mb-2">
                                        <Badge className="bg-green-500">Vagas Disponíveis</Badge>
                                    </div>
                                    <CardTitle className="text-xl">{classItem.name}</CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <div className="space-y-3 text-sm mb-4">
                                        {classItem.professor_name && (
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-gray-400" />
                                                <span>Professor: {classItem.professor_name}</span>
                                            </div>
                                        )}

                                        {classItem.schedule && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span>{classItem.schedule}</span>
                                            </div>
                                        )}

                                        {classItem.start_date && (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span>
                                                    Início: {new Date(classItem.start_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-gray-400" />
                                            <span>Máximo: {classItem.max_students} alunos</span>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full"
                                        onClick={() => openEnrollDialog(classItem.id)}
                                    >
                                        <Users className="h-4 w-4 mr-2" />
                                        Matricular-se
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Enrollment Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmar Matrícula</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Você está prestes a se matricular em uma turma deste curso. Após a
                                aprovação do administrador, você terá acesso ao conteúdo completo.
                            </p>

                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold mb-2">Informações da Matrícula</h4>
                                <ul className="text-sm space-y-1">
                                    <li>✓ Acesso a todas as aulas</li>
                                    <li>✓ Materiais didáticos</li>
                                    <li>✓ Avaliações e certificado</li>
                                    <li>✓ Suporte do professor</li>
                                </ul>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleEnroll} disabled={enrolling}>
                                    {enrolling ? "Matriculando..." : "Confirmar Matrícula"}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
