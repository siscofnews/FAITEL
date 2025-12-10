import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Search, Filter, Building2, Church, Home, Users, Loader2, LayoutGrid, GitBranch, Download, Link2, Copy, Check, MoreVertical, Pencil, Trash2, QrCode } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
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
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChurchHierarchyTree } from "@/components/igrejas/ChurchHierarchyTree";
import { ChurchMovementHistory } from "@/components/igrejas/ChurchMovementHistory";
import { usePermissions } from "@/hooks/usePermissions";
import { exportToCSV, exportToExcel } from "@/lib/export-utils";
import { toast } from "sonner";
import { IgrejaEditForm } from "@/components/igrejas/IgrejaEditForm";
import { ChurchPosterGenerator } from "@/components/igrejas/ChurchPosterGenerator";

interface IgrejaPublica {
  id: string;
  nome_fantasia: string;
  cidade: string | null;
  estado: string | null;
  nivel: "matriz" | "sede" | "subsede" | "congregacao" | "celula";
  logo_url: string | null;
  endereco: string | null;
  telefone: string | null;
  email: string | null;
  pastor_presidente_nome: string | null;
}

interface IgrejaComHierarquia extends IgrejaPublica {
  parent_church_id: string | null;
}

const typeConfig = {
  matriz: { icon: Building2, color: "text-primary", bg: "bg-primary/10", label: "Matriz" },
  sede: { icon: Church, color: "text-accent-foreground", bg: "bg-accent/20", label: "Sede" },
  subsede: { icon: Home, color: "text-navy-light", bg: "bg-navy-light/10", label: "Subsede" },
  congregacao: { icon: Home, color: "text-muted-foreground", bg: "bg-muted", label: "Congregação" },
  celula: { icon: Users, color: "text-green-600", bg: "bg-green-100", label: "Célula" },
};

export default function Igrejas() {
  const { isSuperAdmin, isAdmin } = usePermissions();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("todos");
  const [viewMode, setViewMode] = useState<"cards" | "tree">("cards");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // States for Edit/Delete
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState<IgrejaPublica | null>(null);
  const [posterChurch, setPosterChurch] = useState<IgrejaPublica | null>(null);


  const copyMemberLink = (churchId: string) => {
    const url = `${window.location.origin}/cadastro-membro?matriz=${churchId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(churchId);
    toast.success("Link de cadastro copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteChurch = async () => {
    if (!selectedChurch) return;
    try {
      const { error } = await supabase
        .from('churches')
        .update({ is_active: false }) // Soft delete
        .eq('id', selectedChurch.id);

      if (error) throw error;

      toast.success("Igreja removida com sucesso");
      // Invalidate queries to refresh list
      queryClient.invalidateQueries({ queryKey: ["churches_public"] });
      queryClient.invalidateQueries({ queryKey: ["churches_hierarchy"] });

    } catch (error: any) {
      console.error("Error deleting church:", error);
      toast.error(`Erro ao remover: ${error.message}`);
    } finally {
      setIsDeleteOpen(false);
      setSelectedChurch(null);
    }
  };


  // Query for cards view (public view without parent_church_id)
  const { data: igrejasPublicas, isLoading: isLoadingPublicas, error: errorPublicas } = useQuery({
    queryKey: ["churches_public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("churches_public")
        .select("id, nome_fantasia, cidade, estado, nivel, logo_url, endereco, telefone, email, pastor_presidente_nome");

      if (error) throw error;
      return data as IgrejaPublica[];
    },
    enabled: viewMode === "cards",
  });

  // Query for tree view (needs parent_church_id from churches table)
  const { data: igrejasHierarquia, isLoading: isLoadingHierarquia, error: errorHierarquia, refetch: refetchHierarquia } = useQuery({
    queryKey: ["churches_hierarchy"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("churches")
        .select("id, nome_fantasia, cidade, estado, nivel, logo_url, parent_church_id, endereco, telefone, email, pastor_presidente_nome")
        .eq("is_approved", true)
        .eq("is_active", true);

      if (error) throw error;
      return data as IgrejaComHierarquia[];
    },
    enabled: viewMode === "tree",
  });

  const igrejas = viewMode === "cards" ? igrejasPublicas : igrejasHierarquia;
  const isLoading = viewMode === "cards" ? isLoadingPublicas : isLoadingHierarquia;
  const error = viewMode === "cards" ? errorPublicas : errorHierarquia;

  const filteredIgrejas = igrejas?.filter((igreja) => {
    const matchesSearch =
      igreja.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      igreja.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      igreja.estado?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "todos" || igreja.nivel === selectedType;

    return matchesSearch && matchesType;
  }) || [];

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Igrejas</h1>
          <p className="text-muted-foreground mt-1">Conheça as igrejas cadastradas no sistema</p>
        </div>
        {isSuperAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  const dataToExport = viewMode === "cards" ? igrejasPublicas : igrejasHierarquia;
                  if (!dataToExport || dataToExport.length === 0) {
                    toast.error("Nenhum dado para exportar");
                    return;
                  }
                  exportToCSV(dataToExport, `igrejas-${new Date().toISOString().split("T")[0]}`, [
                    { key: "nome_fantasia", label: "Nome" },
                    { key: "nivel", label: "Nível" },
                    { key: "cidade", label: "Cidade" },
                    { key: "estado", label: "Estado" },
                  ]);
                  toast.success("Arquivo CSV exportado com sucesso");
                }}
              >
                Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const dataToExport = viewMode === "cards" ? igrejasPublicas : igrejasHierarquia;
                  if (!dataToExport || dataToExport.length === 0) {
                    toast.error("Nenhum dado para exportar");
                    return;
                  }
                  exportToExcel(dataToExport, `igrejas-${new Date().toISOString().split("T")[0]}`, [
                    { key: "nome_fantasia", label: "Nome" },
                    { key: "nivel", label: "Nível" },
                    { key: "cidade", label: "Cidade" },
                    { key: "estado", label: "Estado" },
                  ]);
                  toast.success("Arquivo Excel exportado com sucesso");
                }}
              >
                Exportar Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-secondary rounded-lg p-1">
            <button
              onClick={() => setViewMode("cards")}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === "cards"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Visualização em cards"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("tree")}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === "tree"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Visualização em árvore"
            >
              <GitBranch className="h-4 w-4" />
            </button>
          </div>
          {/* History Button - Only show in tree view for super admins */}
          {viewMode === "tree" && isSuperAdmin && <ChurchMovementHistory />}
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Type Tabs - Only show in cards view */}
      {viewMode === "cards" && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {["todos", "matriz", "sede", "subsede", "congregacao", "celula"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all capitalize whitespace-nowrap",
                type === selectedType
                  ? "gradient-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">Erro ao carregar igrejas. Tente novamente.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredIgrejas.length === 0 && (
        <div className="text-center py-12">
          <Church className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhuma igreja encontrada.</p>
        </div>
      )}

      {/* Tree View */}
      {viewMode === "tree" && !isLoading && !error && igrejasHierarquia && igrejasHierarquia.length > 0 && (
        <ChurchHierarchyTree
          churches={igrejasHierarquia}
          searchTerm={searchTerm}
          onRefresh={() => refetchHierarquia()}
        />
      )}

      {/* Cards Grid */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIgrejas.map((igreja, index) => {
            const config = typeConfig[igreja.nivel] || typeConfig.congregacao;
            const Icon = config.icon;
            return (
              <div
                key={igreja.id}
                className="bg-card rounded-2xl border border-border p-6 card-hover animate-slide-up relative group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Action Menu - MoreVertical */}
                {(isSuperAdmin || isAdmin) && (
                  <div className="absolute top-4 right-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedChurch(igreja);
                          setIsEditOpen(true);
                        }}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        {isSuperAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedChurch(igreja);
                                setIsDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}


                <div className="flex items-start justify-between mb-4 pr-8">
                  {igreja.logo_url ? (
                    <img
                      src={igreja.logo_url}
                      alt={igreja.nome_fantasia}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className={cn("p-3 rounded-xl", config.bg)}>
                      <Icon className={cn("h-6 w-6", config.color)} />
                    </div>
                  )}
                </div>

                <div className="mb-2">
                  <span className={cn("text-xs font-medium px-2 py-1 rounded-full", config.bg, config.color)}>
                    {config.label}
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground leading-tight">{igreja.nome_fantasia}</h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {(igreja.cidade || igreja.estado) && (
                    <p>
                      <span className="font-medium text-foreground">Localização:</span>{" "}
                      {[igreja.cidade, igreja.estado].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-border flex gap-2">
                  <Link to={`/igrejas/${igreja.id}/detalhes`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver Detalhes e Hierarquia
                    </Button>
                  </Link>
                  {igreja.nivel === "matriz" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyMemberLink(igreja.id)}
                      title="Copiar link de cadastro de membros"
                    >
                      {copiedId === igreja.id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Link2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPosterChurch(igreja)}
                    title="Gerar Cartaz QR Code"
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedChurch && (
        <IgrejaEditForm
          igreja={selectedChurch as any}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Igreja?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <b>{selectedChurch?.nome_fantasia}</b>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600" onClick={handleDeleteChurch}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {posterChurch && (
        <ChurchPosterGenerator
          igreja={posterChurch}
          registrationLink={`${window.location.origin}/cadastro-membro?igreja=${posterChurch.id}`}
          open={!!posterChurch}
          onOpenChange={(open) => !open && setPosterChurch(null)}
        />
      )}

    </MainLayout>
  );
}
