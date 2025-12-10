import { useState, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Building2,
  Church,
  Home,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  User,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
  Link2,
  Copy,
  Check,
  UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { IgrejaEditForm } from "@/components/igrejas/IgrejaEditForm";
import { useAuth } from "@/contexts/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { ChurchPosterGenerator } from "@/components/igrejas/ChurchPosterGenerator";
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

const typeConfig = {
  matriz: { icon: Building2, color: "text-primary", bg: "bg-primary/10", label: "Matriz" },
  sede: { icon: Church, color: "text-accent-foreground", bg: "bg-accent/20", label: "Sede" },
  subsede: { icon: Home, color: "text-navy-light", bg: "bg-navy-light/10", label: "Subsede" },
  congregacao: { icon: Home, color: "text-muted-foreground", bg: "bg-muted", label: "Congregação" },
  celula: { icon: Users, color: "text-green-600", bg: "bg-green-100", label: "Célula" },
};

export default function IgrejaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();

  const memberRegistrationLink = id ? `${window.location.origin}/cadastro-membro?matriz=${id}` : "";

  const copyMemberLink = () => {
    navigator.clipboard.writeText(memberRegistrationLink);
    setLinkCopied(true);
    toast.success("Link de cadastro copiado!");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const { data: igreja, isLoading, error } = useQuery({
    queryKey: ["church-detail", id],
    queryFn: async () => {
      if (!id) throw new Error("ID da igreja não fornecido");

      const { data, error } = await supabase
        .from("churches")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Igreja não encontrada");
      return data;
    },
    enabled: !!id,
  });

  const { data: parentChurch } = useQuery({
    queryKey: ["parent-church", igreja?.parent_church_id],
    queryFn: async () => {
      if (!igreja?.parent_church_id) return null;

      const { data, error } = await supabase
        .from("churches")
        .select("id, nome_fantasia, nivel")
        .eq("id", igreja.parent_church_id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!igreja?.parent_church_id,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error || !igreja) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold text-foreground">Igreja não encontrada</h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Não foi possível carregar os dados da igreja."}
          </p>
          <Button variant="outline" onClick={() => navigate("/igrejas")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Igrejas
          </Button>
        </div>
      </MainLayout>
    );
  }

  const config = typeConfig[igreja.nivel as keyof typeof typeConfig] || typeConfig.congregacao;
  const Icon = config.icon;

  const formatDate = (date: string | null) => {
    if (!date) return "Não informado";
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return "Não definido";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate("/igrejas")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {igreja.logo_url ? (
              <img
                src={igreja.logo_url}
                alt={igreja.nome_fantasia}
                className="h-14 w-14 rounded-xl object-cover"
              />
            ) : (
              <div className={cn("p-3 rounded-xl", config.bg)}>
                <Icon className={cn("h-8 w-8", config.color)} />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                {igreja.nome_fantasia}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={cn(config.bg, config.color, "border-0")}>
                  {config.label}
                </Badge>
                <Badge variant={igreja.is_active ? "default" : "destructive"}>
                  {igreja.is_active ? "Ativa" : "Inativa"}
                </Badge>
                {igreja.is_approved && (
                  <Badge variant="outline" className="border-green-500 text-green-600">
                    Aprovada
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="font-medium text-foreground">
                      {igreja.email || "Não informado"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium text-foreground">
                      {igreja.telefone || "Não informado"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Endereço Completo</p>
                  <p className="font-medium text-foreground">
                    {igreja.endereco || "Endereço não informado"}
                    {igreja.numero && `, ${igreja.numero}`}
                  </p>
                  <p className="text-muted-foreground">
                    {[igreja.bairro, igreja.cidade, igreja.estado].filter(Boolean).join(" - ")}
                    {igreja.cep && ` • CEP: ${igreja.cep}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leadership */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Liderança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pastor Presidente</p>
                  <p className="font-semibold text-foreground text-lg">
                    {igreja.pastor_presidente_nome || "Não informado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hierarchy */}
          {parentChurch && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Hierarquia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", typeConfig[parentChurch.nivel as keyof typeof typeConfig]?.bg || "bg-muted")}>
                    <Building2 className={cn("h-5 w-5", typeConfig[parentChurch.nivel as keyof typeof typeConfig]?.color || "text-muted-foreground")} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Igreja Superior</p>
                    <Link
                      to={`/igrejas/${parentChurch.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {parentChurch.nome_fantasia}
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Valor do Sistema</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(igreja.valor_sistema)}
                </p>
                <p className="text-xs text-muted-foreground">por mês</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Último Pagamento</p>
                <p className="font-medium text-foreground">
                  {igreja.last_payment_date
                    ? formatDate(igreja.last_payment_date)
                    : "Nenhum pagamento registrado"
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Datas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Cadastrada em</p>
                <p className="font-medium text-foreground">
                  {formatDate(igreja.created_at)}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Última atualização</p>
                <p className="font-medium text-foreground">
                  {formatDate(igreja.updated_at)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Member Registration Link - Only for Matriz */}
          {igreja.nivel === "matriz" && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Link de Cadastro de Membros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Compartilhe este link ou QR Code com os obreiros para que eles se cadastrem diretamente nesta matriz:
                </p>

                {/* QR Code */}
                <div className="flex justify-center p-4 bg-white rounded-lg qr-code-container">
                  <QRCodeSVG
                    value={memberRegistrationLink}
                    size={180}
                    level="H"
                    includeMargin
                    className="rounded"
                    imageSettings={igreja.logo_url ? {
                      src: igreja.logo_url,
                      x: undefined,
                      y: undefined,
                      height: 40,
                      width: 40,
                      excavate: true,
                    } : undefined}
                  />
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Escaneie o QR Code ou use o link abaixo
                </p>

                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 bg-background rounded-lg border text-xs font-mono break-all">
                    {memberRegistrationLink}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={copyMemberLink} variant="gold" size="sm">
                    {linkCopied ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Link
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const svg = document.querySelector('.qr-code-container svg');
                      if (svg) {
                        const svgData = new XMLSerializer().serializeToString(svg);
                        const canvas = document.createElement("canvas");
                        const ctx = canvas.getContext("2d");
                        const img = new Image();
                        img.onload = () => {
                          canvas.width = img.width;
                          canvas.height = img.height;
                          ctx?.drawImage(img, 0, 0);
                          const pngFile = canvas.toDataURL("image/png");
                          const downloadLink = document.createElement("a");
                          downloadLink.download = `qrcode-${igreja.nome_fantasia.replace(/\s+/g, '-')}.png`;
                          downloadLink.href = pngFile;
                          downloadLink.click();
                        };
                        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
                      }
                    }}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Baixar QR
                  </Button>
                </div>
                <ChurchPosterGenerator igreja={igreja} registrationLink={memberRegistrationLink} />
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button
                className="w-full"
                variant="gold"
                onClick={() => setIsEditOpen(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar Igreja
              </Button>
              <Link to={`/membros?igreja=${igreja.id}`}>
                <Button className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Ver Membros
                </Button>
              </Link>
              <Button className="w-full" variant="outline">
                Ver Pagamentos
              </Button>
              {isSuperAdmin && (
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Igreja
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Form Modal */}
      <IgrejaEditForm
        igreja={igreja}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir igreja?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Você está prestes a excluir permanentemente:</p>
              <p className="font-semibold text-foreground">{igreja.nome_fantasia}</p>
              <p className="text-destructive">
                Esta ação não pode ser desfeita. Todos os membros e dados relacionados serão removidos.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={async (e) => {
                e.preventDefault();
                setIsDeleting(true);
                try {
                  const { error } = await supabase
                    .from("churches")
                    .delete()
                    .eq("id", igreja.id);

                  if (error) throw error;

                  toast.success("Igreja excluída com sucesso");
                  queryClient.invalidateQueries({ queryKey: ["churches"] });
                  navigate("/igrejas");
                } catch (error) {
                  console.error("Error deleting church:", error);
                  toast.error("Erro ao excluir igreja", {
                    description: "Não foi possível excluir. Verifique se não há igrejas filhas vinculadas.",
                  });
                } finally {
                  setIsDeleting(false);
                  setIsDeleteOpen(false);
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
    </MainLayout>
  );
}
