import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/MainLayout";
import { Church, Plus, Trash2, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

interface ChurchToCreate {
    nome: string;
    tipo: "sede" | "subsede" | "congregacao" | "celula";
    nivel: number;
}

export default function CadastrarEstrutura() {
    const navigate = useNavigate();
    const { user, isSuperAdmin } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [matrizId, setMatrizId] = useState("");
    const [igrejas, setIgrejas] = useState<ChurchToCreate[]>([]);

    const adicionarIgreja = (tipo: ChurchToCreate["tipo"]) => {
        setIgrejas([...igrejas, { nome: "", tipo, nivel: igrejas.length }]);
    };

    const removerIgreja = (index: number) => {
        setIgrejas(igrejas.filter((_, i) => i !== index));
    };

    const atualizarNome = (index: number, nome: string) => {
        const novas = [...igrejas];
        novas[index].nome = nome;
        setIgrejas(novas);
    };

    const handleSubmit = async () => {
        if (!user || !isSuperAdmin) {
            toast({
                title: "Erro",
                description: "Você não tem permissão para realizar esta ação.",
                variant: "destructive",
            });
            return;
        }

        if (!matrizId) {
            toast({
                title: "Erro",
                description: "Selecione a igreja matriz primeiro.",
                variant: "destructive",
            });
            return;
        }

        const igrejasValidas = igrejas.filter(i => i.nome.trim());
        if (igrejasValidas.length === 0) {
            toast({
                title: "Erro",
                description: "Adicione pelo menos uma igreja/célula.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const nivel_map = {
                sede: "sede",
                subsede: "subsede",
                congregacao: "congregacao",
                celula: "celula",
            } as const;

            for (const igreja of igrejasValidas) {
                const { error } = await supabase.from("churches").insert({
                    nome_fantasia: igreja.nome.trim(),
                    nivel: nivel_map[igreja.tipo],
                    parent_church_id: matrizId,
                    is_approved: true,
                    is_active: true,
                });

                if (error) {
                    console.error("Erro ao criar igreja:", error);
                    toast({
                        title: "Erro parcial",
                        description: `Erro ao criar "${igreja.nome}": ${error.message}`,
                        variant: "destructive",
                    });
                }
            }

            toast({
                title: "Estrutura criada!",
                description: `${igrejasValidas.length} igrejas/células foram cadastradas.`,
            });

            navigate("/igrejas");
        } catch (error: any) {
            console.error("Erro ao criar estrutura:", error);
            toast({
                title: "Erro ao criar estrutura",
                description: error.message || "Ocorreu um erro inesperado.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isSuperAdmin) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <ShieldCheck className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <h1 className="text-xl font-bold text-foreground">Acesso Negado</h1>
                        <p className="text-muted-foreground">Apenas super administradores podem acessar esta página.</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const tipoLabels = {
        sede: "Sede",
        subsede: "Subsede",
        congregacao: "Congregação",
        celula: "Célula",
    };

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Church className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Cadastrar Estrutura de Igrejas (Admin)</CardTitle>
                                <CardDescription>
                                    Cadastre várias igrejas e células de uma vez vinculadas à matriz
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Seleção da Matriz */}
                        <div>
                            <Label>Igreja Matriz *</Label>
                            <Input
                                placeholder="ID da Igreja Matriz"
                                value={matrizId}
                                onChange={(e) => setMatrizId(e.target.value)}
                                className="mt-2"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Cole aqui o ID da igreja matriz (você encontra na URL ao visualizar a igreja)
                            </p>
                        </div>

                        {/* Botões para adicionar */}
                        <div className="flex flex-wrap gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => adicionarIgreja("sede")}>
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar Sede
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => adicionarIgreja("subsede")}>
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar Subsede
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => adicionarIgreja("congregacao")}>
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar Congregação
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => adicionarIgreja("celula")}>
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar Célula
                            </Button>
                        </div>

                        {/* Lista de igrejas */}
                        {igrejas.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-medium">Igrejas/Células a cadastrar:</h3>
                                {igrejas.map((igreja, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <div className="flex-1">
                                            <Input
                                                placeholder={`Nome da ${tipoLabels[igreja.tipo]}`}
                                                value={igreja.nome}
                                                onChange={(e) => atualizarNome(index, e.target.value)}
                                            />
                                        </div>
                                        <div className="w-32 text-sm text-muted-foreground">
                                            {tipoLabels[igreja.tipo]}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removerIgreja(index)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {igrejas.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                Clique nos botões acima para adicionar igrejas/células
                            </div>
                        )}

                        {/* Botão de enviar */}
                        <Button
                            onClick={handleSubmit}
                            className="w-full"
                            size="lg"
                            disabled={isSubmitting || igrejas.length === 0 || !matrizId}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cadastrando...
                                </>
                            ) : (
                                `Cadastrar ${igrejas.length} Igrejas/Células`
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
