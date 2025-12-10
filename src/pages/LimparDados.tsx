import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/MainLayout";
import { AlertTriangle, Trash2, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function LimparDados() {
    const navigate = useNavigate();
    const { user, isSuperAdmin } = useAuth();
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleLimparTudo = async () => {
        if (!user || !isSuperAdmin) {
            toast({
                title: "Erro",
                description: "Você não tem permissão para realizar esta ação.",
                variant: "destructive",
            });
            return;
        }

        setIsDeleting(true);

        try {
            // 1. Deletar todos os membros
            const { error: membersError } = await supabase
                .from("members")
                .delete()
                .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

            if (membersError) throw membersError;

            // 2. Deletar todas as igrejas
            const { error: churchesError } = await supabase
                .from("churches")
                .delete()
                .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

            if (churchesError) throw churchesError;

            toast({
                title: "Dados limpos com sucesso!",
                description: "Todas as igrejas e membros foram removidos do sistema.",
            });

            // Aguardar um pouco para o usuário ver a mensagem
            setTimeout(() => {
                navigate("/dashboard");
            }, 2000);
        } catch (error: any) {
            console.error("Erro ao limpar dados:", error);
            toast({
                title: "Erro ao limpar dados",
                description: error.message || "Ocorreu um erro ao limpar os dados.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
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

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-6"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>

                <Card className="border-destructive">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-destructive/10 rounded-lg">
                                <AlertTriangle className="h-6 w-6 text-destructive" />
                            </div>
                            <div>
                                <CardTitle className="text-destructive">Limpar Dados do Sistema</CardTitle>
                                <CardDescription>
                                    ⚠️ Esta ação é IRREVERSÍVEL! Use com extrema cautela.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                            <h3 className="font-semibold text-foreground mb-2">⚠️ ATENÇÃO</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                                Esta ação vai deletar PERMANENTEMENTE:
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                <li>Todas as igrejas cadastradas (Matrizes, Sedes, Subsedes, Congregações, Células)</li>
                                <li>Todos os membros cadastrados</li>
                                <li>Todos os dados relacionados</li>
                            </ul>
                            <p className="text-sm text-destructive font-semibold mt-3">
                                ⚠️ NÃO É POSSÍVEL DESFAZER ESTA AÇÃO!
                            </p>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-4">
                            <h3 className="font-semibold text-foreground mb-2">ℹ️ O que NÃO será deletado:</h3>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                <li>Sua conta de Super Administrador</li>
                                <li>Configurações do sistema</li>
                            </ul>
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    size="lg"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Limpando dados...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Limpar Todos os Dados
                                        </>
                                    )}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                        <AlertTriangle className="h-5 w-5" />
                                        Você tem certeza ABSOLUTA?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação vai deletar PERMANENTEMENTE todas as igrejas e membros do sistema.
                                        <br />
                                        <br />
                                        <strong className="text-destructive">NÃO É POSSÍVEL RECUPERAR OS DADOS!</strong>
                                        <br />
                                        <br />
                                        Tem certeza que deseja continuar?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleLimparTudo}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Sim, deletar tudo
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
