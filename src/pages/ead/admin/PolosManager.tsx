import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, MapPin, Plus, Edit, Power } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

interface Polo {
    id: string;
    faculdade_id: string;
    nome: string;
    email: string;
    telefone: string;
    logo_url: string | null;
    diretor_nome: string;
    status: string;
    cidade: string;
    estado: string;
}

interface Faculdade {
    id: string;
    nome_fantasia: string;
}

export default function PolosManager() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [polos, setPolos] = useState<Polo[]>([]);
    const [faculdades, setFaculdades] = useState<Faculdade[]>([]);
    const [filteredPolos, setFilteredPolos] = useState<Polo[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [faculdadeFilter, setFaculdadeFilter] = useState("todos");

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterPolos();
    }, [searchTerm, faculdadeFilter, polos]);

    const fetchData = async () => {
        try {
            const [polosResult, faculdadesResult] = await Promise.all([
                supabase.from('ead_polos').select('*').order('created_at', { ascending: false }),
                supabase.from('ead_faculdades').select('id, nome_fantasia').eq('status', 'ativo')
            ]);

            if (polosResult.error) throw polosResult.error;
            if (faculdadesResult.error) throw faculdadesResult.error;

            setPolos(polosResult.data || []);
            setFaculdades(faculdadesResult.data || []);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar dados",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const filterPolos = () => {
        let filtered = polos;

        if (searchTerm) {
            filtered = filtered.filter(polo =>
                polo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                polo.cidade.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (faculdadeFilter !== "todos") {
            filtered = filtered.filter(polo => polo.faculdade_id === faculdadeFilter);
        }

        setFilteredPolos(filtered);
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';

        try {
            const { error } = await supabase
                .from('ead_polos')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            toast({
                title: "Status atualizado!",
                description: `Polo ${newStatus === 'ativo' ? 'ativado' : 'desativado'}.`
            });

            fetchData();
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
                    <h1 className="text-3xl font-bold">Gerenciar Polos</h1>
                    <p className="text-muted-foreground">Total: {polos.length} polos</p>
                </div>
                <Button onClick={() => navigate('/ead/admin/cadastrar-polo')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Polo
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
                                    placeholder="Buscar por nome ou cidade..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={faculdadeFilter} onValueChange={setFaculdadeFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrar por Faculdade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todas as Faculdades</SelectItem>
                                {faculdades.map((fac) => (
                                    <SelectItem key={fac.id} value={fac.id}>
                                        {fac.nome_fantasia}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Polos */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPolos.map((polo) => (
                    <Card key={polo.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start gap-3">
                                {polo.logo_url ? (
                                    <img
                                        src={polo.logo_url}
                                        alt={polo.nome}
                                        className="w-16 h-16 object-contain rounded border"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded border bg-primary/10 flex items-center justify-center">
                                        <MapPin className="w-8 h-8 text-primary" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{polo.nome}</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {polo.cidade} - {polo.estado}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm mb-4">
                                <p>📧 {polo.email}</p>
                                {polo.telefone && <p>📞 {polo.telefone}</p>}
                                <p>👤 {polo.diretor_nome}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`px-2 py-1 rounded text-xs ${polo.status === 'ativo'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {polo.status.toUpperCase()}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleStatus(polo.id, polo.status)}
                                    >
                                        <Power className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/ead/admin/editar-polo/${polo.id}`)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredPolos.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                        <p className="text-muted-foreground">Nenhum polo encontrado</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
