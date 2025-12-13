import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getUserScopeStates } from "@/wiring/accessScope";
import { 
  Church, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  MapPin, 
  Mail, 
  Phone, 
  User,
  Clock,
  Building2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PendingChurch {
  id: string;
  nome_fantasia: string;
  nivel: "matriz" | "sede" | "subsede" | "congregacao" | "celula";
  pastor_presidente_nome: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  telefone: string | null;
  email: string | null;
  created_at: string;
}

const nivelLabels: Record<string, string> = {
  matriz: "Matriz",
  sede: "Sede",
  subsede: "Subsede",
  congregacao: "Congregação",
  celula: "Célula",
};

export default function IgrejasAprovacao() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isSuperAdmin, user } = useAuth();
  const [scopeStates, setScopeStates] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      if (user?.id) {
        try { setScopeStates(await getUserScopeStates(user.id)); } catch {}
      }
    })();
  }, [user?.id]);

  const { data: pendingChurches, isLoading } = useQuery({
    queryKey: ["pending_churches", scopeStates.join(";")],
    queryFn: async () => {
      let accessibleIds: string[] = [];
      if (user?.id) {
        try {
          const { data: ids } = await supabase.rpc('get_accessible_church_ids', { _user_id: user.id });
          accessibleIds = (ids || []) as any;
        } catch {}
      }
      const { data, error } = await supabase
        .from("churches")
        .select("*")
        .eq("is_approved", false)
        .in(scopeStates.length ? 'estado' : 'id', scopeStates.length ? scopeStates : undefined as any)
        .in(accessibleIds.length ? 'parent_church_id' : 'id', accessibleIds.length ? accessibleIds : undefined as any)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as PendingChurch[];
    },
    enabled: isSuperAdmin,
  });

  const approveMutation = useMutation({
    mutationFn: async (churchId: string) => {
      const { error } = await supabase
        .from("churches")
        .update({ is_approved: true })
        .eq("id", churchId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending_churches"] });
      toast({
        title: "Igreja aprovada!",
        description: "A igreja foi aprovada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao aprovar",
        description: error.message || "Ocorreu um erro ao aprovar a igreja.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (churchId: string) => {
      const { error } = await supabase
        .from("churches")
        .delete()
        .eq("id", churchId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending_churches"] });
      toast({
        title: "Cadastro rejeitado",
        description: "O cadastro foi removido do sistema.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao rejeitar",
        description: error.message || "Ocorreu um erro ao rejeitar o cadastro.",
        variant: "destructive",
      });
    },
  });

  if (!isSuperAdmin) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground">Acesso Negado</h1>
            <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Aprovação de Igrejas</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie os cadastros de igrejas pendentes de aprovação
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && (!pendingChurches || pendingChurches.length === 0) && (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Tudo em dia!</h2>
          <p className="text-muted-foreground">Não há cadastros pendentes de aprovação.</p>
        </div>
      )}

      <div className="space-y-4">
        {pendingChurches?.map((church) => (
          <div
            key={church.id}
            className="bg-card rounded-2xl border border-border p-6 animate-fade-in"
          >
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Church Info */}
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gold/10 rounded-xl">
                    <Church className="h-6 w-6 text-gold" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-foreground">
                        {church.nome_fantasia}
                      </h3>
                      <Badge variant="secondary">{nivelLabels[church.nivel]}</Badge>
                      <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                        Pendente
                      </Badge>
                    </div>

                    <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                      {church.pastor_presidente_nome && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{church.pastor_presidente_nome}</span>
                        </div>
                      )}
                      
                      {church.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{church.email}</span>
                        </div>
                      )}
                      
                      {church.telefone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{church.telefone}</span>
                        </div>
                      )}
                      
                      {(church.cidade || church.estado) && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {[church.endereco, church.cidade, church.estado]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      )}
                      
                      {church.cep && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span>CEP: {church.cep}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          Cadastrado em{" "}
                          {format(new Date(church.created_at), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 lg:flex-col">
                <Button
                  variant="default"
                  className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700"
                  onClick={() => approveMutation.mutate(church.id)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                >
                  {approveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 lg:flex-none"
                  onClick={() => rejectMutation.mutate(church.id)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                >
                  {rejectMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeitar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
