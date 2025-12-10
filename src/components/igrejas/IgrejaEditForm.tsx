import { useState } from "react";
import { PhotoUpload } from "@/components/PhotoUpload";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type Church = Database["public"]["Tables"]["churches"]["Row"];
type ChurchLevel = Database["public"]["Enums"]["church_level"];

const igrejaFormSchema = z.object({
  nome_fantasia: z.string()
    .trim()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z.string()
    .trim()
    .email("E-mail inválido")
    .max(255, "E-mail deve ter no máximo 255 caracteres")
    .nullable()
    .or(z.literal("")),
  telefone: z.string()
    .trim()
    .max(20, "Telefone deve ter no máximo 20 caracteres")
    .nullable()
    .or(z.literal("")),
  endereco: z.string()
    .trim()
    .max(255, "Endereço deve ter no máximo 255 caracteres")
    .nullable()
    .or(z.literal("")),
  cep: z.string()
    .trim()
    .regex(/^(\d{5}-?\d{3})?$/, "CEP inválido (formato: 00000-000)")
    .nullable()
    .or(z.literal("")),
  cidade: z.string()
    .trim()
    .max(100, "Cidade deve ter no máximo 100 caracteres")
    .nullable()
    .or(z.literal("")),
  estado: z.string()
    .trim()
    .max(2, "Estado deve ter 2 caracteres (ex: SP)")
    .nullable()
    .or(z.literal("")),
  pastor_presidente_nome: z.string()
    .trim()
    .max(100, "Nome do pastor deve ter no máximo 100 caracteres")
    .nullable()
    .or(z.literal("")),
  nivel: z.enum(["matriz", "sede", "subsede", "congregacao", "celula"]),
  valor_sistema: z.coerce
    .number()
    .min(0, "Valor deve ser positivo")
    .max(99999.99, "Valor muito alto")
    .nullable(),
  logo_url: z.string()
    .url("URL inválida")
    .nullable()
    .or(z.literal("")),
});

type IgrejaFormData = z.infer<typeof igrejaFormSchema>;

interface IgrejaEditFormProps {
  igreja: Church;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IgrejaEditForm({ igreja, open, onOpenChange }: IgrejaEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IgrejaFormData>({
    resolver: zodResolver(igrejaFormSchema),
    defaultValues: {
      nome_fantasia: igreja.nome_fantasia,
      email: igreja.email || "",
      telefone: igreja.telefone || "",
      endereco: igreja.endereco || "",
      cep: igreja.cep || "",
      cidade: igreja.cidade || "",
      estado: igreja.estado || "",
      pastor_presidente_nome: igreja.pastor_presidente_nome || "",
      nivel: igreja.nivel as ChurchLevel,
      valor_sistema: igreja.valor_sistema,
      logo_url: igreja.logo_url || "",
    },
  });

  const selectedNivel = watch("nivel");

  const onSubmit = async (data: IgrejaFormData) => {
    setIsLoading(true);
    try {
      const updateData = {
        nome_fantasia: data.nome_fantasia,
        email: data.email || null,
        telefone: data.telefone || null,
        endereco: data.endereco || null,
        cep: data.cep || null,
        cidade: data.cidade || null,
        estado: data.estado?.toUpperCase() || null,
        pastor_presidente_nome: data.pastor_presidente_nome || null,
        nivel: data.nivel,
        valor_sistema: data.valor_sistema,
        logo_url: data.logo_url || null,
      };

      const { error } = await supabase
        .from("churches")
        .update(updateData)
        .eq("id", igreja.id);

      if (error) throw error;

      toast({
        title: "Igreja atualizada",
        description: "As informações foram salvas com sucesso.",
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["church-detail", igreja.id] });
      queryClient.invalidateQueries({ queryKey: ["churches_public"] });

      onOpenChange(false);
    } catch (error) {
      console.error("Error updating church:", error);
      toast({
        title: "Erro ao atualizar",
        description: error instanceof Error ? error.message : "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fill address from CEP using ViaCEP API
  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setValue("endereco", data.logradouro || "");
        setValue("cidade", data.localidade || "");
        setValue("estado", data.uf || "");
      }
    } catch (error) {
      console.error("Error fetching CEP:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Igreja</DialogTitle>
          <DialogDescription>
            Atualize as informações da igreja. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Informações Básicas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="nome_fantasia">Nome da Igreja *</Label>
                <Input
                  id="nome_fantasia"
                  {...register("nome_fantasia")}
                  placeholder="Nome completo da igreja"
                />
                {errors.nome_fantasia && (
                  <p className="text-sm text-destructive mt-1">{errors.nome_fantasia.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="nivel">Nível *</Label>
                <Select
                  value={selectedNivel}
                  onValueChange={(value) => setValue("nivel", value as ChurchLevel)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matriz">Matriz</SelectItem>
                    <SelectItem value="sede">Sede</SelectItem>
                    <SelectItem value="subsede">Subsede</SelectItem>
                    <SelectItem value="congregacao">Congregação</SelectItem>
                    <SelectItem value="celula">Célula</SelectItem>
                  </SelectContent>
                </Select>
                {errors.nivel && (
                  <p className="text-sm text-destructive mt-1">{errors.nivel.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="pastor_presidente_nome">Pastor Presidente</Label>
                <Input
                  id="pastor_presidente_nome"
                  {...register("pastor_presidente_nome")}
                  placeholder="Nome do pastor presidente"
                />
                {errors.pastor_presidente_nome && (
                  <p className="text-sm text-destructive mt-1">{errors.pastor_presidente_nome.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Contato
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="email@igreja.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  {...register("telefone")}
                  placeholder="(00) 00000-0000"
                />
                {errors.telefone && (
                  <p className="text-sm text-destructive mt-1">{errors.telefone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Endereço
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  {...register("cep")}
                  placeholder="00000-000"
                  onBlur={handleCepBlur}
                />
                {errors.cep && (
                  <p className="text-sm text-destructive mt-1">{errors.cep.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  {...register("endereco")}
                  placeholder="Rua, número, complemento"
                />
                {errors.endereco && (
                  <p className="text-sm text-destructive mt-1">{errors.endereco.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  {...register("cidade")}
                  placeholder="Cidade"
                />
                {errors.cidade && (
                  <p className="text-sm text-destructive mt-1">{errors.cidade.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  {...register("estado")}
                  placeholder="UF"
                  maxLength={2}
                />
                {errors.estado && (
                  <p className="text-sm text-destructive mt-1">{errors.estado.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Financial */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Financeiro
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valor_sistema">Valor do Sistema (R$)</Label>
                <Input
                  id="valor_sistema"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("valor_sistema")}
                  placeholder="30.00"
                />
                {errors.valor_sistema && (
                  <p className="text-sm text-destructive mt-1">{errors.valor_sistema.message}</p>
                )}
              </div>

              <div>
                <div className="space-y-2">
                  <Label>Logo da Igreja</Label>
                  <PhotoUpload
                    currentPhotoUrl={watch("logo_url")}
                    onPhotoUploaded={(url) => setValue("logo_url", url)}
                    bucket="church-logos"
                    required={false}
                  />
                  {errors.logo_url && (
                    <p className="text-sm text-destructive mt-1">{errors.logo_url.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="gold" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
