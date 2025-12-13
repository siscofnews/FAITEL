import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PermissionsManagerDialog } from "@/components/admin/PermissionsManagerDialog";
import {
  Search,
  Plus,
  Filter,
  Users,
  Mail,
  Phone,
  Loader2,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  MoreHorizontal,
  Download,
  Shield
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getUserScopeStates } from "@/wiring/accessScope";
import { useSearchParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MembroForm } from "@/components/membros/MembroForm";
import { toast } from "sonner";
import { exportToCSV, exportToExcel, formatDateForExport, formatBooleanForExport } from "@/lib/export-utils";
import { AuditService } from "@/services/AuditService";

const roleLabels: Record<string, { label: string; color: string }> = {
  membro: { label: "Membro", color: "bg-secondary text-secondary-foreground" },
  obreiro: { label: "Obreiro", color: "bg-blue-100 text-blue-700" },
  diacono: { label: "Diácono", color: "bg-purple-100 text-purple-700" },
  presbitero: { label: "Presbítero", color: "bg-amber-100 text-amber-700" },
  evangelista: { label: "Evangelista", color: "bg-green-100 text-green-700" },
  pastor: { label: "Pastor", color: "bg-primary/20 text-primary" },
};

const ITEMS_PER_PAGE = 10;

const membersExportColumns = [
  { key: "full_name", label: "Nome" },
  { key: "email", label: "E-mail" },
  { key: "phone", label: "Telefone" },
  { key: "gender", label: "Gênero" },
  { key: "birth_date", label: "Data Nascimento" },
  { key: "city", label: "Cidade" },
  { key: "state", label: "Estado" },
  { key: "igreja", label: "Igreja" },
  { key: "role", label: "Função" },
  { key: "department", label: "Departamento" },
  { key: "baptized", label: "Batizado" },
  { key: "membership_date", label: "Data Membresia" },
  { key: "is_active", label: "Ativo" },
];

export default function Membros() {
  const [searchParams] = useSearchParams();
  const churchId = searchParams.get("igreja");
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [deletingMember, setDeletingMember] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [permissionsTarget, setPermissionsTarget] = useState<{ id: string; full_name: string; user_id: string; church_id: string } | null>(null);
  const [scopeStates, setScopeStates] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      if (user?.id) {
        try { setScopeStates(await getUserScopeStates(user.id)); } catch {}
      }
    })();
  }, [user?.id]);

  // Function to fetch all members for export
  const fetchMembersForExport = async () => {
    let query = supabase
      .from("members")
      .select("full_name, email, phone, gender, birth_date, city, state, role, department, baptized, membership_date, is_active, churches!inner(nome_fantasia,estado)");

    if (churchId) {
      query = query.eq("church_id", churchId);
    }
    if (roleFilter !== "all") {
      query = query.eq("role", roleFilter);
    }
    if (statusFilter !== "all") {
      query = query.eq("is_active", statusFilter === "active");
    }
    if (scopeStates.length) {
      query = query.in("churches.estado", scopeStates);
    }

    const { data, error } = await query.order("full_name");

    if (error || !data || data.length === 0) {
      toast.error("Nenhum dado para exportar");
      return null;
    }

    return data.map((m: any) => ({
      ...m,
      igreja: m.churches?.nome_fantasia || "",
      birth_date: formatDateForExport(m.birth_date),
      membership_date: formatDateForExport(m.membership_date),
      baptized: formatBooleanForExport(m.baptized),
      is_active: formatBooleanForExport(m.is_active),
    }));
  };

  // Fetch church info if churchId is provided
  const { data: church } = useQuery({
    queryKey: ["church-for-members", churchId],
    queryFn: async () => {
      if (!churchId) return null;
      const { data, error } = await supabase
        .from("churches")
        .select("id, nome_fantasia")
        .eq("id", churchId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!churchId,
  });

  // Fetch members
  const { data: membersData, isLoading, error } = useQuery({
    queryKey: ["members", churchId, searchTerm, roleFilter, statusFilter, currentPage, scopeStates.join(";")],
    queryFn: async () => {
      let query = supabase
        .from("members")
        .select("*, churches!inner(nome_fantasia,estado)", { count: "exact" });

      if (churchId) {
        query = query.eq("church_id", churchId);
      }

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }

      if (roleFilter !== "all") {
        query = query.eq("role", roleFilter);
      }

      if (statusFilter !== "all") {
        query = query.eq("is_active", statusFilter === "active");
      }
      if (scopeStates.length) {
        query = query.in("churches.estado", scopeStates);
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await query
        .order("full_name")
        .range(from, to);

      if (error) throw error;
      return { members: data || [], totalCount: count || 0 };
    },
  });

  const members = membersData?.members || [];
  const totalCount = membersData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  // Function to approve member
  const handleApproveMember = async (member: any) => {
    try {
      const { error } = await supabase
        .from("members")
        .update({ is_active: true })
        .eq("id", member.id);

      if (error) throw error;

      toast.success(`Membro ${member.full_name} aprovado com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ["members"] });
    } catch (error) {
      console.error("Error approving member:", error);
      toast.error("Erro ao aprovar membro");
    }
  };

  // Calculate pending count
  const { data: pendingCount } = useQuery({
    queryKey: ["members-pending-count", churchId, scopeStates.join(";")],
    queryFn: async () => {
      let query = supabase
        .from("members")
        .select("id", { count: "exact", head: true })
        .eq("is_active", false);

      if (churchId) {
        query = query.eq("church_id", churchId);
      } else if (scopeStates.length) {
        // Filter by accessible churches by state via join
        const { data: ids } = await supabase.rpc('get_accessible_church_ids', { _user_id: user?.id });
        if (ids && ids.length) query = query.in('church_id', ids as any);
      }

      const { count, error } = await query;
      if (error) return 0;
      return count || 0;
    },
    // Refetch every 30 seconds to keep badge updated
    refetchInterval: 30000
  });

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Membros
            {church && (
              <span className="text-muted-foreground font-normal text-xl ml-2">
                • {church.nome_fantasia}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            {totalCount} {totalCount === 1 ? "membro encontrado" : "membros encontrados"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Pending Approval Badge - Only show if there are pending members */}
          {pendingCount !== undefined && pendingCount > 0 && (
            <Button
              variant={statusFilter === "inactive" ? "default" : "secondary"}
              className="gap-2 relative"
              onClick={() => {
                setStatusFilter("inactive");
                setCurrentPage(1);
              }}
            >
              <div className="relative">
                <Users className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                </span>
              </div>
              Aprovações Pendentes
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 min-w-[20px]">{pendingCount}</Badge>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={async () => {
                  const exportData = await fetchMembersForExport();
                  if (!exportData) return;
                  exportToCSV(exportData, `membros-${new Date().toISOString().split("T")[0]}`, membersExportColumns);
                  toast.success("Arquivo CSV exportado com sucesso");
                }}
              >
                Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  const exportData = await fetchMembersForExport();
                  if (!exportData) return;
                  exportToExcel(exportData, `membros-${new Date().toISOString().split("T")[0]}`, membersExportColumns);
                  toast.success("Arquivo Excel exportado com sucesso");
                }}
              >
                Exportar Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="gold" size="lg" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Novo Membro
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select
            value={roleFilter}
            onValueChange={(v) => {
              setRoleFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas funções</SelectItem>
              <SelectItem value="membro">Membro</SelectItem>
              <SelectItem value="obreiro">Obreiro</SelectItem>
              <SelectItem value="diacono">Diácono</SelectItem>
              <SelectItem value="presbitero">Presbítero</SelectItem>
              <SelectItem value="evangelista">Evangelista</SelectItem>
              <SelectItem value="pastor">Pastor</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Pendentes/Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">Erro ao carregar membros. Tente novamente.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && members.length === 0 && (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {statusFilter === "inactive"
              ? "Nenhuma aprovação pendente"
              : "Nenhum membro encontrado"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || roleFilter !== "all" || statusFilter !== "all"
              ? "Tente ajustar os filtros de busca."
              : "Comece cadastrando o primeiro membro."}
          </p>
          <Button variant="gold" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Cadastrar Membro
          </Button>
        </div>
      )}

      {/* Members Table */}
      {!isLoading && !error && members.length > 0 && (
        <>
          {statusFilter === "inactive" && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 flex items-center gap-2 text-orange-800 text-sm">
              <UserCircle className="h-5 w-5" />
              <strong>Atenção:</strong> Estes membros estão aguardando aprovação ou estão inativos.
            </div>
          )}

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membro</TableHead>
                  <TableHead className="hidden md:table-cell">Contato</TableHead>
                  <TableHead className="hidden lg:table-cell">Igreja</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead className="hidden md:table-cell">Data Solicitação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member: any) => {
                  const roleConfig = roleLabels[member.role] || roleLabels.membro;
                  return (
                    <TableRow key={member.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(member.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{member.full_name}</p>
                            <p className="text-sm text-muted-foreground md:hidden">
                              {member.email || member.phone || "-"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-1">
                          {member.email && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </div>
                          )}
                          {member.phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {member.phone}
                            </div>
                          )}
                          {!member.email && !member.phone && "-"}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {member.churches?.nome_fantasia || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("border-0", roleConfig.color)}>
                          {roleConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(member.created_at || member.membership_date)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.is_active ? "default" : "secondary"} className={!member.is_active ? "bg-orange-100 text-orange-700 hover:bg-orange-200" : ""}>
                          {member.is_active ? "Ativo" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {!member.is_active ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => handleApproveMember(member)}
                            >
                              Aprovar
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingMember(member);
                                    setIsFormOpen(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Editar dados
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeletingMember(member)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Rejeitar/Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingMember(member);
                                  setIsFormOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-orange-600 focus:text-orange-600"
                                onClick={async () => {
                                  try {
                                    const { error } = await supabase
                                      .from("members")
                                      .update({ is_active: false })
                                      .eq("id", member.id);

                                    if (error) throw error;

                                    toast.success("Membro desativado com sucesso");
                                    queryClient.invalidateQueries({ queryKey: ["members"] });
                                  } catch (error) {
                                    console.error("Error deactivating member:", error);
                                    toast.error("Erro ao desativar membro");
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Desativar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeletingMember(member)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir Permanentemente
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Member Form Modal */}
      <MembroForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingMember(null);
        }}
        defaultChurchId={churchId || undefined}
        membro={editingMember}
      />

      <AlertDialog open={!!deletingMember} onOpenChange={(open) => !open && setDeletingMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir membro?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Você está prestes a excluir permanentemente:</p>
              <p className="font-semibold text-foreground">{deletingMember?.full_name}</p>
              <p className="text-destructive">Esta ação não pode ser desfeita.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={async (e) => {
                e.preventDefault();
                if (!deletingMember) return;
                setIsDeleting(true);
                try {
                  const { error } = await supabase
                    .from("members")
                    .delete()
                    .eq("id", deletingMember.id);

                  if (error) throw error;

                  // Audit Log
                  try {
                    await AuditService.logAction({
                      action: 'DELETE',
                      entity: 'MEMBER',
                      entity_id: deletingMember.id,
                      church_id: deletingMember.church_id,
                      details: { name: deletingMember.full_name }
                    });
                  } catch (e) { console.error("Audit log failed", e); }

                  toast.success("Membro excluído com sucesso");
                  queryClient.invalidateQueries({ queryKey: ["members"] });
                } catch (error) {
                  console.error("Error deleting member:", error);
                  toast.error("Erro ao excluir membro");
                } finally {
                  setIsDeleting(false);
                  setDeletingMember(null);
                }
              }}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {permissionsTarget && (
        <PermissionsManagerDialog
          open={!!permissionsTarget}
          onOpenChange={(open) => !open && setPermissionsTarget(null)}
          userId={permissionsTarget.user_id}
          userName={permissionsTarget.full_name}
          churchId={permissionsTarget.church_id}
        />
      )}
    </MainLayout >
  );
}
