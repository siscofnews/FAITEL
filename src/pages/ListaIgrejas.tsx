import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Eye } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

interface Church {
    id: string;
    nome_fantasia: string;
    nivel: string;
    cidade: string;
    estado: string;
    status_licenca: string;
    is_active: boolean;
}

export default function ListaIgrejas() {
    const navigate = useNavigate();
    const { userLevel, isSuperAdmin } = usePermissions();
    const [churches, setChurches] = useState<Church[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadChurches();
    }, []);

    const loadChurches = async () => {
        setIsLoading(true);
        try {
            // Super admin vê todas, outros veem apenas sua hierarquia
            let query = supabase
                .from('churches')
                .select('*')
                .eq('is_active', true)
                .order('nivel')
                .order('nome_fantasia');

            const { data } = await query;
            setChurches(data || []);
        } catch (error) {
            console.error("Error loading churches:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getNivelLabel = (nivel: string) => {
        const labels: Record<string, string> = {
            matriz: 'Matriz',
            sede: 'Sede',
            subsede: 'Subsede',
            congregacao: 'Congregação',
        };
        return labels[nivel] || nivel;
    };

    const getNivelColor = (nivel: string) => {
        const colors: Record<string, string> = {
            matriz: 'bg-purple-500',
            sede: 'bg-blue-500',
            subsede: 'bg-green-500',
            congregacao: 'bg-orange-500',
        };
        return colors[nivel] || 'bg-gray-500';
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                    <p className="mt-4">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <MainLayout>
            <div className="container mx-auto py-8 px-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">⛪ Igrejas</h1>
                    <p className="text-muted-foreground">
                        Clique em uma igreja para ver detalhes e gerenciar a hierarquia
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {churches.map((church) => (
                        <Card
                            key={church.id}
                            className="hover:shadow-lg transition-all cursor-pointer"
                            onClick={() => navigate(`/igreja/${church.id}/detalhes`)}
                        >
                            <CardHeader>
                                <div className="flex items-start gap-3">
                                    <div className={`p-3 rounded-full ${getNivelColor(church.nivel)} text-white shrink-0`}>
                                        <Building className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg line-clamp-2">
                                            {church.nome_fantasia}
                                        </CardTitle>
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                            <Badge variant="outline">{getNivelLabel(church.nivel)}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    📍 {church.cidade}, {church.estado}
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/igreja/${church.id}/detalhes`);
                                    }}
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver Detalhes e Hierarquia
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {churches.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <p className="text-muted-foreground">Nenhuma igreja encontrada</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </MainLayout>
    );
}
