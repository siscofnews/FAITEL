import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, ShieldCheck, ShieldOff, Users, AlertTriangle } from "lucide-react";
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

interface Member {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    role: string;
    church_id: string;
    church?: {
        nome_fantasia: string;
        nivel: string;
    };
    user_roles?: {
        is_manipulator: boolean;
        granted_by: string;
        granted_at: string;
    }[];
}

export default function GerenciarPermissoes() {
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userLevel, setUserLevel] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        loadUserLevel();
        loadMembers();
    }, []);

    const loadUserLevel = async () => {
        try {
            const { data, error } = await supabase.rpc('get_user_hierarchy_level');
            if (!error && data) {
                setUserLevel(data);
            }
        } catch (error) {
            console.error("Error loading user level:", error);
        }
    };

    const loadMembers = async () => {
        setIsLoading(true);
        try {
            // Buscar membros da hierarquia acessível
            const { data, error } = await supabase
                .from('members')
                .select(`
          *,
          church:churches(nome_fantasia, nivel),
          user_roles(is_manipulator, granted_by, granted_at)
        `)
                .order('full_name');

            if (error) throw error;

            setMembers(data || []);
        } catch (error: any) {
            console.error("Error loading members:", error);
            toast({
                title: "Erro ao carregar membros",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const grantStatus = async (userId: string, memberName: string) => {
        try {
            const { error } = await supabase.rpc('grant_manipulator_status', {
                p_target_user_id: userId,
            });

            if (error) throw error;

            toast({
                title: "✅ Status Concedido",
                description: `${memberName} agora é um Manipulador.`,
            });

            loadMembers();
        } catch (error: any) {
            console.error("Error granting status:", error);
            toast({
                title: "Erro ao conceder status",
                description: error.message || "Não foi possível conceder o status",
                variant: "destructive",
            });
        }
    };

    const revokeStatus = async (userId: string, memberName: string) => {
        try {
            const { error } = await supabase.rpc('revoke_manipulator_status', {
                p_target_user_id: userId,
            });

            if (error) throw error;

            toast({
                title: "Status Revogado",
                description: `${memberName} não é mais Manipulador.`,
            });

            loadMembers();
        } catch (error: any) {
            console.error("Error revoking status:", error);
            toast({
                title: "Erro ao revogar status",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const isManipulator = (member: Member) => {
        return member.user_roles?.some(role => role.is_manipulator) || false;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Carregando membros...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">Gerenciar Permissões</h1>
                </div>
                <p className="text-muted-foreground">
                    Delegue status de Manipulador para membros da sua hierarquia
                </p>
                {userLevel && (
                    <Badge variant="outline" className="mt-2">
                        Seu Nível: {userLevel.toUpperCase()}
                    </Badge>
                )}
            </div>

            {/* Alerta informativo */}
            <Card className="mb-6 border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                    <div className="flex gap-3">
                        <Alert Triangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                            <p className="font-semibold mb-1">Sobre o Status de Manipulador:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Permite ao membro editar dados do sistema</li>
                                <li>Escopo limitado à sua hierarquia e níveis abaixo</li>
                                <li>Você só pode delegar para membros da sua igreja ou filhas</li>
                                <li>Status é automaticamente revogado se a estrutura mudar</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Membros */}
            {members.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Nenhum membro encontrado na sua hierarquia</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {members.map((member) => {
                        const hasManipulatorStatus = isManipulator(member);
                        const grantedInfo = member.user_roles?.find(r => r.is_manipulator);

                        return (
                            <Card key={member.id} className={hasManipulatorStatus ? "border-green-200" : ""}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-xl">{member.full_name}</CardTitle>
                                                {hasManipulatorStatus && (
                                                    <Badge variant="default" className="bg-green-600">
                                                        <ShieldCheck className="h-3 w-3 mr-1" />
                                                        Manipulador
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardDescription className="mt-1">
                                                {member.email || 'Sem email'} • {member.role}
                                            </CardDescription>
                                            {member.church && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    📍 {member.church.nome_fantasia} ({member.church.nivel})
                                                </p>
                                            )}
                                            {hasManipulatorStatus && grantedInfo && (
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Status concedido em: {formatDate(grantedInfo.granted_at)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2">
                                        {hasManipulatorStatus ? (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">
                                                        <ShieldOff className="h-4 w-4 mr-2" />
                                                        Revogar Status
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Revogar Status de Manipulador?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Tem certeza que deseja revogar o status de manipulador de{" "}
                                                            <strong>{member.full_name}</strong>?
                                                            <br /><br />
                                                            Essa pessoa perderá acesso para editar dados do sistema.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => revokeStatus(member.user_id, member.full_name)}
                                                            className="bg-destructive text-destructive-foreground"
                                                        >
                                                            Confirmar Revogação
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        ) : (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="default" size="sm">
                                                        <ShieldCheck className="h-4 w-4 mr-2" />
                                                        Dar Status de Manipulador
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Conceder Status de Manipulador?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Você está prestes a conceder status de Manipulador para{" "}
                                                            <strong>{member.full_name}</strong>.
                                                            <br /><br />
                                                            Essa pessoa poderá:
                                                            <ul className="list-disc list-inside mt-2 space-y-1">
                                                                <li>Acessar dados do sistema</li>
                                                                <li>Editar informações de membros</li>
                                                                <li>Ver relatórios e dados financeiros</li>
                                                            </ul>
                                                            <br />
                                                            <strong>Escopo</strong>: Limitado à sua hierarquia e níveis abaixo.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => grantStatus(member.user_id, member.full_name)}
                                                        >
                                                            Confirmar e Conceder
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
