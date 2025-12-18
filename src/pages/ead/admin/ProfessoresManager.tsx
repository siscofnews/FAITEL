import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, UserCircle, Plus, Edit, Power } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Professor {
    id: string;
    nome_completo: string;
    email: string;
    telefone: string;
    foto_url: string | null;
    especialidades: string;
    status: string;
    created_at: string;
}

export default function ProfessoresManager() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [professores, setProfessores] = useState<Professor[]>([]);
    const [filteredProfessores, setFilteredProfessores] = useState<Professor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchProfessores();
    }, []);

    useEffect(() => {
        filterProfessores();
    }, [searchTerm, professores]);

    const fetchProfessores = async () => {
        try {
            const { data, error } = await supabase
                .from('ead_professors')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProfessores(data || []);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar professores",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const filterProfessores = () => {
        let filtered = professores;

        if (searchTerm) {
            filtered = filtered.filter(prof =>
                prof.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prof.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prof.especialidades?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredProfessores(filtered);
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';

        try {
            const { error } = await supabase
                .from('ead_professors')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            toast({
                title: "Status atualizado!",
                description: `Professor ${newStatus === 'ativo' ? 'ativado' : 'desativado'}.`
            });

            fetchProfessores();
        } catch (error: any) {
            toast({
                title: "Erro ao atualizar status",
                description: error.message,
                variant: "destructive"
            });
        }
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
                    <h1 className="text-3xl font-bold">Gerenciar Professores</h1>
                    <p className="text-muted-foreground">Total: {professores.length} professores</p>
                </div>
                <Button onClick={() => navigate('/ead/admin/cadastrar-professor')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Professor
                </Button>
            </div>

            {/* Filtros */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome, email ou especialidade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Professores */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProfessores.map((professor) => (
                    <Card key={professor.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start gap-4">
                                {professor.foto_url ? (
                                    <img
                                        src={professor.foto_url}
                                        alt={professor.nome_completo}
                                        className="w-20 h-20 object-cover rounded-full"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                                        <UserCircle className="w-16 h-16 text-primary" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{professor.nome_completo}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{professor.email}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm mb-4">
                                {professor.telefone && <p>📞 {professor.telefone}</p>}
                                {professor.especialidades && (
                                    <p className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                        {professor.especialidades}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`px-2 py-1 rounded text-xs ${professor.status === 'ativo'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {professor.status.toUpperCase()}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleStatus(professor.id, professor.status)}
                                    >
                                        <Power className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/ead/admin/editar-professor/${professor.id}`)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredProfessores.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <UserCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                        <p className="text-muted-foreground">Nenhum professor encontrado</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
