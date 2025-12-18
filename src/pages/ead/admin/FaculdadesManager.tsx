import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Building2, Plus, Edit, Power } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Faculdade {
    id: string;
    nome_fantasia: string;
    razao_social: string;
    cnpj: string;
    email: string;
    telefone: string;
    logo_url: string | null;
    diretor_nome: string;
    status: string;
    created_at: string;
}

export default function FaculdadesManager() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [faculdades, setFaculdades] = useState<Faculdade[]>([]);
    const [filteredFaculdades, setFilteredFaculdades] = useState<Faculdade[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchFaculdades();
    }, []);

    useEffect(() => {
        filterFaculdades();
    }, [searchTerm, faculdades]);

    const fetchFaculdades = async () => {
        try {
            const { data, error } = await supabase
                .from('ead_faculdades')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setFaculdades(data || []);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar faculdades",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const filterFaculdades = () => {
        let filtered = faculdades;

        if (searchTerm) {
            filtered = filtered.filter(fac =>
                fac.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
                fac.cnpj.includes(searchTerm)
            );
        }

        setFilteredFaculdades(filtered);
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';

        try {
            const { error } = await supabase
                .from('ead_faculdades')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            toast({
                title: "Status atualizado!",
                description: `Faculdade ${newStatus === 'ativo' ? 'ativada' : 'desativada'} com sucesso.`
            });

            fetchFaculdades();
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
                    <h1 className="text-3xl font-bold">Gerenciar Faculdades</h1>
                    <p className="text-muted-foreground">Total: {faculdades.length} instituições</p>
                </div>
                <Button onClick={() => navigate('/ead/admin/cadastrar-faculdade')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Faculdade
                </Button>
            </div>

            {/* Filtros */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome ou CNPJ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Faculdades */}
            <div className="grid md:grid-cols-2 gap-4">
                {filteredFaculdades.map((faculdade) => (
                    <Card key={faculdade.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start gap-4">
                                {faculdade.logo_url ? (
                                    <img
                                        src={faculdade.logo_url}
                                        alt={faculdade.nome_fantasia}
                                        className="w-20 h-20 object-contain rounded border"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded border bg-primary/10 flex items-center justify-center">
                                        <Building2 className="w-10 h-10 text-primary" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{faculdade.nome_fantasia}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{faculdade.cnpj}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm mb-4">
                                <p>📧 {faculdade.email}</p>
                                {faculdade.telefone && <p>📞 {faculdade.telefone}</p>}
                                <p>👤 Diretor: {faculdade.diretor_nome}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`px-2 py-1 rounded text-xs ${faculdade.status === 'ativo'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {faculdade.status.toUpperCase()}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleStatus(faculdade.id, faculdade.status)}
                                    >
                                        <Power className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/ead/admin/editar-faculdade/${faculdade.id}`)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredFaculdades.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                        <p className="text-muted-foreground">Nenhuma faculdade encontrada</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
