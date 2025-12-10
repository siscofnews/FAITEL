import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Check, Mail, UserPlus } from "lucide-react";
import { z } from "zod";

const conviteSchema = z.object({
  email: z.string().email("Email inválido"),
  churchId: z.string().uuid("Selecione uma igreja"),
  role: z.enum(["membro", "lider", "pastor", "pastor_presidente"]),
});

interface ConviteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Church {
  id: string;
  nome_fantasia: string;
}

export function ConviteForm({ open, onOpenChange, onSuccess }: ConviteFormProps) {
  const { user, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [churches, setChurches] = useState<Church[]>([]);
  const [loadingChurches, setLoadingChurches] = useState(true);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    churchId: "",
    role: "membro" as const,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchChurches() {
      if (!user) return;
      
      setLoadingChurches(true);
      
      let query = supabase
        .from("churches")
        .select("id, nome_fantasia")
        .eq("is_active", true)
        .order("nome_fantasia");

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching churches:", error);
        toast({
          title: "Erro ao carregar igrejas",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setChurches(data || []);
        if (data && data.length === 1) {
          setFormData(prev => ({ ...prev, churchId: data[0].id }));
        }
      }
      
      setLoadingChurches(false);
    }

    if (open) {
      fetchChurches();
      setGeneratedLink(null);
      setCopied(false);
    }
  }, [open, user, isSuperAdmin, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const result = conviteSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("invitations")
        .insert({
          email: formData.email,
          church_id: formData.churchId,
          role: formData.role,
          invited_by: user?.id,
        })
        .select("token")
        .single();

      if (error) throw error;

      const inviteLink = `${window.location.origin}/convite/${data.token}`;
      setGeneratedLink(inviteLink);

      toast({
        title: "Convite criado!",
        description: "O link de convite foi gerado com sucesso.",
      });

      onSuccess?.();
    } catch (err: any) {
      console.error("Error creating invitation:", err);
      toast({
        title: "Erro ao criar convite",
        description: err.message || "Ocorreu um erro ao criar o convite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedLink) return;
    
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setFormData({ email: "", churchId: "", role: "membro" });
    setFormErrors({});
    setGeneratedLink(null);
    setCopied(false);
    onOpenChange(false);
  };

  const roleOptions = [
    { value: "membro", label: "Membro" },
    { value: "lider", label: "Líder" },
    { value: "pastor", label: "Pastor" },
    { value: "pastor_presidente", label: "Pastor Presidente" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Convidar Usuário
          </DialogTitle>
          <DialogDescription>
            Envie um convite para um novo usuário se cadastrar no sistema.
          </DialogDescription>
        </DialogHeader>

        {generatedLink ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <Label className="text-sm font-medium">Link de Convite</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Este link expira em 7 dias e só pode ser usado uma vez.
              </p>
              <div className="flex gap-2">
                <Input
                  value={generatedLink}
                  readOnly
                  className="text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setGeneratedLink(null);
                  setFormData({ email: "", churchId: "", role: "membro" });
                }}
              >
                Criar Outro
              </Button>
              <Button className="flex-1" onClick={handleClose}>
                Fechar
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email do Convidado</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                />
              </div>
              {formErrors.email && (
                <p className="text-sm text-destructive">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="churchId">Igreja</Label>
              <Select
                value={formData.churchId}
                onValueChange={(value) => setFormData({ ...formData, churchId: value })}
                disabled={loading || loadingChurches}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingChurches ? "Carregando..." : "Selecione uma igreja"} />
                </SelectTrigger>
                <SelectContent>
                  {churches.map((church) => (
                    <SelectItem key={church.id} value={church.id}>
                      {church.nome_fantasia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.churchId && (
                <p className="text-sm text-destructive">{formErrors.churchId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Função</Label>
              <Select
                value={formData.role}
                onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.role && (
                <p className="text-sm text-destructive">{formErrors.role}</p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Gerar Convite"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
