import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Loader2, Save, UserPlus, Image, Plus } from "lucide-react"; // Added Plus
import { PhotoUpload } from "@/components/PhotoUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { RoleCreationDialog } from "./RoleCreationDialog";
import { usePermissions } from "@/hooks/usePermissions";
import { AuditService } from "@/services/AuditService";

const membroFormSchema = z.object({
  full_name: z.string()
    .trim()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z.string()
    .trim()
    .email("E-mail inválido")
    .max(255, "E-mail deve ter no máximo 255 caracteres")
    .nullable()
    .or(z.literal("")),
  phone: z.string()
    .trim()
    .max(20, "Telefone deve ter no máximo 20 caracteres")
    .nullable()
    .or(z.literal("")),
  birth_date: z.string()
    .nullable()
    .or(z.literal("")),
  gender: z.enum(["masculino", "feminino", "outro"]).nullable(),
  marital_status: z.enum(["solteiro", "casado", "divorciado", "viuvo"]).nullable(),
  address: z.string()
    .trim()
    .max(255, "Endereço deve ter no máximo 255 caracteres")
    .nullable()
    .or(z.literal("")),
  cep: z.string()
    .trim()
    .regex(/^(\d{5}-?\d{3})?$/, "CEP inválido (formato: 00000-000)")
    .nullable()
    .or(z.literal("")),
  city: z.string()
    .trim()
    .max(100, "Cidade deve ter no máximo 100 caracteres")
    .nullable()
    .or(z.literal("")),
  state: z.string()
    .trim()
    .max(2, "Estado deve ter 2 caracteres (ex: SP)")
    .nullable()
    .or(z.literal("")),
  church_id: z.string().uuid("Selecione uma igreja"),
  role: z.string().default("membro"),
  department: z.string()
    .trim()
    .max(50, "Departamento deve ter no máximo 50 caracteres")
    .nullable()
    .or(z.literal("")),
  baptized: z.boolean().default(false),
  baptism_date: z.string()
    .nullable()
    .or(z.literal("")),
  membership_date: z.string()
    .nullable()
    .or(z.literal("")),
  notes: z.string()
    .trim()
    .max(500, "Observações devem ter no máximo 500 caracteres")
    .nullable()
    .or(z.literal("")),
  avatar_url: z.string().nullable().or(z.literal("")),
});

type MembroFormData = z.infer<typeof membroFormSchema>;

interface MembroFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultChurchId?: string;
  membro?: any; // For editing
}

export function MembroForm({ open, onOpenChange, defaultChurchId, membro }: MembroFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!membro;
  const { isAdmin, isManipulator, isSuperAdmin } = usePermissions();
  const canEdit = isAdmin || isManipulator || isSuperAdmin;

  // Fetch accessible churches
  const { data: churches } = useQuery({
    queryKey: ["accessible-churches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("churches")
        .select("id, nome_fantasia, nivel")
        .order("nome_fantasia");
      if (error) throw error;
      return data || [];
    },
  });

  // State for role creation
  const [isRoleCreationOpen, setIsRoleCreationOpen] = useState(false);

  // Fetch roles
  const { data: roles = [], refetch: refetchRoles } = useQuery({
    queryKey: ["church-roles"],
    queryFn: async () => {
      // @ts-ignore
      const { data, error } = await supabase
        .from("church_roles")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching roles:", error);
        return [];
      }
      return data;
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MembroFormData>({
    resolver: zodResolver(membroFormSchema),
    defaultValues: {
      full_name: membro?.full_name || "",
      email: membro?.email || "",
      phone: membro?.phone || "",
      birth_date: membro?.birth_date || "",
      gender: membro?.gender || null,
      marital_status: membro?.marital_status || null,
      address: membro?.address || "",
      cep: membro?.cep || "",
      city: membro?.city || "",
      state: membro?.state || "",
      church_id: membro?.church_id || defaultChurchId || "",
      role: membro?.role || "membro",
      department: membro?.department || "",
      baptized: membro?.baptized || false,
      baptism_date: membro?.baptism_date || "",
      membership_date: membro?.membership_date || new Date().toISOString().split("T")[0],
      notes: membro?.notes || "",
      avatar_url: membro?.avatar_url || "",
    },
  });

  // Reset form when dialog opens/closes or membro changes
  useEffect(() => {
    if (open) {
      reset({
        full_name: membro?.full_name || "",
        email: membro?.email || "",
        phone: membro?.phone || "",
        birth_date: membro?.birth_date || "",
        gender: membro?.gender || null,
        marital_status: membro?.marital_status || null,
        address: membro?.address || "",
        cep: membro?.cep || "",
        city: membro?.city || "",
        state: membro?.state || "",
        church_id: membro?.church_id || defaultChurchId || "",
        role: membro?.role || "membro",
        department: membro?.department || "",
        baptized: membro?.baptized || false,
        baptism_date: membro?.baptism_date || "",
        membership_date: membro?.membership_date || new Date().toISOString().split("T")[0],
        notes: membro?.notes || "",
        avatar_url: membro?.avatar_url || "",
      });
    }
  }, [open, membro, defaultChurchId, reset]);

  const currentAvatarUrl = watch("avatar_url");

  const selectedChurchId = watch("church_id");
  const selectedGender = watch("gender");
  const selectedMaritalStatus = watch("marital_status");
  const selectedRole = watch("role");
  const isBaptized = watch("baptized");

  const onSubmit = async (data: MembroFormData) => {
    setIsLoading(true);
    try {
      const memberData = {
        full_name: data.full_name,
        email: data.email || null,
        phone: data.phone || null,
        birth_date: data.birth_date || null,
        gender: data.gender || null,
        marital_status: data.marital_status || null,
        address: data.address || null,
        cep: data.cep || null,
        city: data.city || null,
        state: data.state?.toUpperCase() || null,
        church_id: data.church_id,
        role: data.role,
        department: data.department || null,
        baptized: data.baptized,
        baptism_date: data.baptized ? data.baptism_date || null : null,
        membership_date: data.membership_date || null,
        notes: data.notes || null,
        avatar_url: data.avatar_url || null,
      };

      if (isEditing) {
        if (!canEdit) {
          throw new Error("Você não tem permissão para editar membros.");
        }
        const { error } = await supabase
          .from("members")
          .update(memberData)
          .eq("id", membro.id);
        if (error) throw error;

        await AuditService.logAction({
          action: 'UPDATE',
          entity: 'MEMBER',
          entity_id: membro.id,
          details: memberData,
          church_id: data.church_id
        });

        toast({
          title: "Membro atualizado",
          description: "As informações foram salvas com sucesso.",
        });
      } else {
        if (!canEdit) {
          throw new Error("Você não tem permissão para criar membros.");
        }
        const { data: inserted, error } = await supabase
          .from("members")
          .insert(memberData)
          .select()
          .single();
        if (error) throw error;

        await AuditService.logAction({
          action: 'CREATE',
          entity: 'MEMBER',
          entity_id: inserted.id,
          details: memberData,
          church_id: data.church_id
        });

        toast({
          title: "Membro cadastrado",
          description: `${data.full_name} foi cadastrado com sucesso.`,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["members"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving member:", error);
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar o membro.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fill address from CEP
  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setValue("address", data.logradouro || "");
        setValue("city", data.localidade || "");
        setValue("state", data.uf || "");
      }
    } catch (error) {
      console.error("Error fetching CEP:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {isEditing ? "Editar Membro" : "Novo Membro"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do membro. Campos com * são obrigatórios."
              : "Preencha os dados para cadastrar um novo membro. Campos com * são obrigatórios."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Dados Pessoais
            </h3>

            <div className="flex justify-center mb-6">
              <div className="space-y-2 text-center">
                <Label>Foto do Membro</Label>
                <PhotoUpload
                  currentPhotoUrl={currentAvatarUrl || ""}
                  onPhotoUploaded={(url) => setValue("avatar_url", url)}
                  bucket="member-photos"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  {...register("full_name")}
                  placeholder="Nome completo do membro"
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive mt-1">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="email@exemplo.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="(00) 00000-0000"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  {...register("birth_date")}
                />
                {errors.birth_date && (
                  <p className="text-sm text-destructive mt-1">{errors.birth_date.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="gender">Gênero</Label>
                <Select
                  value={selectedGender || ""}
                  onValueChange={(value) => setValue("gender", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="marital_status">Estado Civil</Label>
                <Select
                  value={selectedMaritalStatus || ""}
                  onValueChange={(value) => setValue("marital_status", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                    <SelectItem value="casado">Casado(a)</SelectItem>
                    <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                    <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  {...register("address")}
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  {...register("city")}
                  placeholder="Cidade"
                />
              </div>

              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  {...register("state")}
                  placeholder="UF"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Church Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Informações da Igreja
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="church_id">Igreja *</Label>
                <Select
                  value={selectedChurchId}
                  onValueChange={(value) => setValue("church_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a igreja" />
                  </SelectTrigger>
                  <SelectContent>
                    {churches?.map((church) => (
                      <SelectItem key={church.id} value={church.id}>
                        {church.nome_fantasia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.church_id && (
                  <p className="text-sm text-destructive mt-1">{errors.church_id.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="role">Função / Cargo</Label>
                <div className="flex gap-2">
                  <Select
                    value={selectedRole}
                    onValueChange={(value) => {
                      if (value === "new_role_action") {
                        setIsRoleCreationOpen(true);
                      } else {
                        setValue("role", value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role: any) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                      <div className="px-2 py-2 border-t mt-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-8 px-2 text-sm text-primary font-medium"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation(); // Prevent select closing if possible, though value change usually closes it
                            setIsRoleCreationOpen(true);
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Criar novo cargo
                        </Button>
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <RoleCreationDialog
                open={isRoleCreationOpen}
                onOpenChange={setIsRoleCreationOpen}
                onRoleCreated={(newRoleName) => {
                  refetchRoles();
                  setValue("role", newRoleName);
                }}
              />

              <div>
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  {...register("department")}
                  placeholder="Ex: Louvor, Infantil, Jovens"
                />
              </div>

              <div>
                <Label htmlFor="membership_date">Data de Membresia</Label>
                <Input
                  id="membership_date"
                  type="date"
                  {...register("membership_date")}
                />
              </div>
            </div>
          </div>


          {/* Baptism */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Batismo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="baptized"
                  checked={isBaptized}
                  onCheckedChange={(checked) => setValue("baptized", !!checked)}
                />
                <Label htmlFor="baptized" className="cursor-pointer">
                  Membro é batizado
                </Label>
              </div>

              {isBaptized && (
                <div>
                  <Label htmlFor="baptism_date">Data do Batismo</Label>
                  <Input
                    id="baptism_date"
                    type="date"
                    {...register("baptism_date")}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Observações
            </h3>

            <div>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Observações adicionais sobre o membro..."
                rows={3}
              />
              {errors.notes && (
                <p className="text-sm text-destructive mt-1">{errors.notes.message}</p>
              )}
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
                  {isEditing ? "Salvando..." : "Cadastrando..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? "Salvar Alterações" : "Cadastrar Membro"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog >
  );
}
