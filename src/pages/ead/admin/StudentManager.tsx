import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StudentForm from "@/components/ead/StudentForm";

interface Student {
    id: string;
    nome_completo: string;
    email: string;
    telefone: string;
    foto_url: string | null;
    status: string;
    created_at: string;
}

export default function StudentManager() {
    const { toast } = useToast();
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("todos");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        filterStudents();
    }, [searchTerm, statusFilter, students]);

    const fetchStudents = async () => {
        try {
            const { data, error } = await supabase
                .from('ead_students')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setStudents(data || []);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar alunos",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const filterStudents = () => {
        let filtered = students;

        if (searchTerm) {
            filtered = filtered.filter(student =>
                student.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== "todos") {
            filtered = filtered.filter(student => student.status === statusFilter);
        }

        setFilteredStudents(filtered);
    };

    const handleStudentAdded = () => {
        setIsAddDialogOpen(false);
        fetchStudents();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Gerenciar Alunos</h1>
                    <p className="text-muted-foreground">Total: {students.length} alunos</p>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Novo Aluno
                </Button>
            </div>

            {/* Filtros */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nome ou email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos</SelectItem>
                                <SelectItem value="ativo">Ativos</SelectItem>
                                <SelectItem value="inativo">Inativos</SelectItem>
                                <SelectItem value="suspenso">Suspensos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Alunos */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student) => (
                    <Card key={student.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start gap-3">
                                {student.foto_url ? (
                                    <img
                                        src={student.foto_url}
                                        alt={student.nome_completo}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-primary">
                                            {student.nome_completo.charAt(0)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{student.nome_completo}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{student.email}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                {student.telefone && (
                                    <p>📞 {student.telefone}</p>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className={`px-2 py-1 rounded text-xs ${student.status === 'ativo' ? 'bg-green-100 text-green-800' :
                                        student.status === 'inativo' ? 'bg-gray-100 text-gray-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {student.status.toUpperCase()}
                                    </span>
                                    <Button variant="outline" size="sm">
                                        Ver Detalhes
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredStudents.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">Nenhum aluno encontrado</p>
                    </CardContent>
                </Card>
            )}

            {/* Dialog de Cadastro */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
                    </DialogHeader>
                    <StudentForm onSuccess={handleStudentAdded} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
