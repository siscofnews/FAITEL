import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

interface PendingChurch {
    id: string;
    nome_fantasia: string;
    pastor_presidente_nome: string;
    email: string;
    telefone: string;
    endereco: string;
    cidade: string;
    estado: string;
    valor_sistema: number;
    created_at: string;
}

export default function AprovarMatrizes() {
    const [pendingChurches, setPendingChurches] = useState<PendingChurch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [diasLicenca, setDiasLicenca] = useState<number>(35);

    const { toast } = useToast();
    const { isSuperAdmin } = usePermissions();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (isSuperAdmin) {
            loadPendingChurches();
        }
    }, [isSuperAdmin]);

    const loadPendingChurches = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('churches')
                .select('*')
                .eq('status_licenca', 'PENDENTE_DE_VALIDACAO')
                .eq('nivel', 'matriz')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPendingChurches(data || []);
        } catch (error: any) {
            console.error("Error loading churches:", error);
            toast({
                title: "Erro ao carregar matrizes",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAprovar = async (churchId: string, churchName: string) => {
        setActionLoading(churchId);
        try {
            const { error } = await supabase.rpc('aprovar_matriz', {
                p_church_id: churchId,
                p_dias_licenca: diasLicenca,
            });

            if (error) throw error;

            toast({
                title: "✅ Matriz Aprovada!",
                description: `${churchName} foi aprovada com sucesso. Licença de ${diasLicenca} dias concedida.`,
            });

            // Atualiza listas e caches
            loadPendingChurches();
            queryClient.invalidateQueries({ queryKey: ['churches'] });
            queryClient.invalidateQueries({ queryKey: ['church-detail'] });
        } catch (error: any) {
            console.error("Error approving church:", error);
            toast({
                title: "Erro ao aprovar",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejeitar = async (churchId: string, churchName: string) => {
        const motivo = prompt(`Por que está rejeitando "${churchName}"?`);

        setActionLoading(churchId);
        try {
            const { error } = await supabase.rpc('rejeitar_matriz', {
                p_church_id: churchId,
                p_motivo: motivo,
            });

            if (error) throw error;

            toast({
                title: "Matriz Rejeitada",
                description: `${churchName} foi rejeitada.`,
            });

            // Atualiza listas e caches
            loadPendingChurches();
            queryClient.invalidateQueries({ queryKey: ['churches'] });
            queryClient.invalidateQueries({ queryKey: ['church-detail'] });
        } catch (error: any) {
            console.error("Error rejecting church:", error);
            toast({
                title: "Erro ao rejeitar",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setActionLoading(null);
        }
    };

    if (!isSuperAdmin) {
        return (
            <div className="container mx-auto py-8">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-800">
                            ⚠️ Apenas Super Administradores podem aprovar matrizes.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Carregando matrizes pendentes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Aprovar Matrizes</h1>
                        <p className="text-muted-foreground">
                            Valide e aprove novas igrejas matrizes cadastradas
                        </p>
                    </div>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                        {pendingChurches.length} Pendentes
                    </Badge>
                </div>
            </div>

            {/* Configuração de Dias */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg">Configuração de Licença</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Label htmlFor="dias" className="whitespace-nowrap">
                            Dias de licença ao aprovar:
                        </Label>
                        <Input
                            id="dias"
                            type="number"
                            min="1"
                            max="365"
                            value={diasLicenca}
                            onChange={(e) => setDiasLicenca(parseInt(e.target.value) || 35)}
                            className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">dias (padrão: 35)</span>
                    </div>
                </CardContent>
            </Card>

            {pendingChurches.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                        <p className="text-lg font-semibold mb-2">Nenhuma matriz pendente</p>
                        <p className="text-muted-foreground">Todas as solicitações foram processadas</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {pendingChurches.map((church) => (
                        <Card key={church.id} className="border-yellow-200">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-xl">{church.nome_fantasia}</CardTitle>
                                        <CardDescription className="mt-1">
                                            <div className="space-y-1">
                                                <p>👤 {church.pastor_presidente_nome}</p>
                                                <p>📧 {church.email}</p>
                                                <p>📱 {church.telefone}</p>
                                                <p>📍 {church.endereco}, {church.cidade} - {church.estado}</p>
                                                <p>💰 Valor: R$ {church.valor_sistema?.toFixed(2) || "30.00"}/mês</p>
                                            </div>
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className="ml-4">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {new Date(church.created_at).toLocaleDateString('pt-BR')}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-3">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="default"
                                                disabled={actionLoading === church.id}
                                                className="flex-1"
                                            >
                                                {actionLoading === church.id ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Processando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Aprovar
                                                    </>
                                                )}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Aprovar Matriz?</DialogTitle>
                                                <DialogDescription>
                                                    Você está prestes a aprovar <strong>{church.nome_fantasia}</strong>.
                                                    <br /><br />
                                                    <strong>Ações que serão tomadas:</strong>
                                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                                        <li>Status mudará para ATIVO</li>
                                                        <li>Licença de {diasLicenca} dias será concedida</li>
                                                        <li>Pastor poderá fazer login imediatamente</li>
                                                        <li>Email de confirmação será enviado</li>
                                                    </ul>
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <Button
                                                    onClick={() => handleAprovar(church.id, church.nome_fantasia)}
                                                    disabled={actionLoading === church.id}
                                                >
                                                    Confirmar Aprovação
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    <Button
                                        variant="destructive"
                                        onClick={() => handleRejeitar(church.id, church.nome_fantasia)}
                                        disabled={actionLoading === church.id}
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Rejeitar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
