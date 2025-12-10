import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ConviteForm } from "@/components/convites/ConviteForm";
import { Loader2, Plus, Trash2, Copy, Check, UserPlus, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Invitation {
  id: string;
  token: string;
  email: string;
  role: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
  churches: {
    nome_fantasia: string;
  } | null;
}

export default function Convites() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchInvitations = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("invitations")
      .select(`
        id,
        token,
        email,
        role,
        expires_at,
        used_at,
        created_at,
        churches (
          nome_fantasia
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching invitations:", error);
      toast({
        title: "Erro ao carregar convites",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setInvitations(data || []);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchInvitations();
    }
  }, [user]);

  const copyLink = async (token: string, id: string) => {
    const link = `${window.location.origin}/convite/${token}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const deleteInvitation = async (id: string) => {
    setDeletingId(id);
    
    const { error } = await supabase
      .from("invitations")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro ao excluir convite",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Convite excluído",
        description: "O convite foi removido com sucesso.",
      });
      fetchInvitations();
    }
    
    setDeletingId(null);
  };

  const getStatusBadge = (invitation: Invitation) => {
    if (invitation.used_at) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Utilizado
        </Badge>
      );
    }
    
    const isExpired = new Date(invitation.expires_at) < new Date();
    if (isExpired) {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Expirado
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        Pendente
      </Badge>
    );
  };

  const roleLabels: Record<string, string> = {
    super_admin: "Super Admin",
    pastor_presidente: "Pastor Presidente",
    pastor: "Pastor",
    lider: "Líder",
    membro: "Membro",
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Convites</h1>
            <p className="text-muted-foreground">
              Gerencie os convites para novos usuários
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Convite
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Lista de Convites
            </CardTitle>
            <CardDescription>
              Convites enviados para novos usuários se cadastrarem no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : invitations.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhum convite encontrado</p>
                <Button variant="outline" className="mt-4" onClick={() => setFormOpen(true)}>
                  Criar primeiro convite
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Igreja</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expira em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-medium">
                          {invitation.email}
                        </TableCell>
                        <TableCell>
                          {invitation.churches?.nome_fantasia || "-"}
                        </TableCell>
                        <TableCell>
                          {roleLabels[invitation.role] || invitation.role}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(invitation)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(invitation.expires_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {!invitation.used_at && new Date(invitation.expires_at) > new Date() && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyLink(invitation.token, invitation.id)}
                              >
                                {copiedId === invitation.id ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteInvitation(invitation.id)}
                              disabled={deletingId === invitation.id}
                            >
                              {deletingId === invitation.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-destructive" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConviteForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={fetchInvitations}
      />
    </MainLayout>
  );
}
