import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, CheckCircle, AlertCircle } from "lucide-react";

interface EnrollmentManagerProps {
    studentId?: string;
}

export default function EnrollmentManager({ studentId }: EnrollmentManagerProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState(studentId || "");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [enrollments, setEnrollments] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            fetchEnrollments();
        }
    }, [selectedStudent]);

    const fetchData = async () => {
        try {
            // Buscar alunos
            const { data: studentsData } = await supabase
                .from('ead_students')
                .select('id, nome_completo, email')
                .eq('status', 'ativo')
                .order('nome_completo');

            // Buscar cursos ativos
            const { data: coursesData } = await supabase
                .from('courses')
                .select('id, title, description')
                .eq('status', 'ativo')
                .order('title');

            setStudents(studentsData || []);
            setCourses(coursesData || []);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar dados",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const fetchEnrollments = async () => {
        if (!selectedStudent) return;

        try {
            const { data, error } = await supabase
                .from('ead_enrollments')
                .select(`
          id,
          status,
          data_matricula,
          progresso_percentual,
          course:courses(id, title, description)
        `)
                .eq('student_id', selectedStudent);

            if (error) throw error;
            setEnrollments(data || []);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar matrículas",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleEnroll = async () => {
        if (!selectedStudent || !selectedCourse) {
            toast({
                title: "Atenção",
                description: "Selecione um aluno e um curso",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);

        try {
            // Verificar se já existe matrícula
            const { data: existing } = await supabase
                .from('ead_enrollments')
                .select('id')
                .eq('student_id', selectedStudent)
                .eq('course_id', selectedCourse)
                .single();

            if (existing) {
                toast({
                    title: "Aluno já matriculado",
                    description: "Este aluno já está matriculado neste curso",
                    variant: "destructive"
                });
                return;
            }

            // Criar matrícula
            const { error } = await supabase
                .from('ead_enrollments')
                .insert({
                    student_id: selectedStudent,
                    course_id: selectedCourse,
                    instituicao_tipo: 'faculdade', // ou pegar dinamicamente
                    status: 'ativa',
                    progresso_percentual: 0
                });

            if (error) throw error;

            toast({
                title: "Matrícula realizada!",
                description: "Aluno matriculado com sucesso"
            });

            setSelectedCourse("");
            fetchEnrollments();
        } catch (error: any) {
            toast({
                title: "Erro ao matricular",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Seleção de Aluno e Curso */}
            <Card>
                <CardHeader>
                    <CardTitle>Nova Matrícula</CardTitle>
                    <CardDescription>Matricule um aluno em um curso</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Aluno</label>
                            <Select
                                value={selectedStudent}
                                onValueChange={setSelectedStudent}
                                disabled={!!studentId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o aluno" />
                                </SelectTrigger>
                                <SelectContent>
                                    {students.map((student) => (
                                        <SelectItem key={student.id} value={student.id}>
                                            {student.nome_completo} ({student.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Curso</label>
                            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o curso" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button
                        onClick={handleEnroll}
                        disabled={loading || !selectedStudent || !selectedCourse}
                        className="w-full"
                    >
                        {loading ? "Matriculando..." : "Matricular Aluno"}
                    </Button>
                </CardContent>
            </Card>

            {/* Lista de Matrículas */}
            {selectedStudent && (
                <Card>
                    <CardHeader>
                        <CardTitle>Matrículas Ativas</CardTitle>
                        <CardDescription>Cursos em que o aluno está matriculado</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {enrollments.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p>Nenhuma matrícula encontrada</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {enrollments.map((enrollment: any) => (
                                    <div
                                        key={enrollment.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <GraduationCap className="w-8 h-8 text-primary" />
                                            <div>
                                                <h4 className="font-semibold">{enrollment.course.title}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Progresso: {enrollment.progresso_percentual}%
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {enrollment.status === 'ativa' ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-yellow-600" />
                                            )}
                                            <span className="text-sm font-medium capitalize">
                                                {enrollment.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
