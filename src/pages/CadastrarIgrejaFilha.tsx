import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Church, Loader2, Upload, Eye, EyeOff, Users, Building2 } from "lucide-react";
import { PhotoUpload } from "@/components/PhotoUpload";
import type { Database } from "@/integrations/supabase/types";

type ChurchLevel = Database["public"]["Enums"]["church_level"];

const churchLevelLabels: Record<ChurchLevel, string> = {
  matriz: "Matriz",
  sede: "Sede",
  subsede: "Subsede",
  congregacao: "Congregação",
  celula: "Célula",
};

const allowedChildLevels: Record<ChurchLevel, ChurchLevel[]> = {
  matriz: ["sede", "celula"],
  sede: ["subsede", "celula"],
  subsede: ["congregacao", "celula"],
  congregacao: ["celula"],
  celula: [],
};

const formSchema = z.object({
  nome_fantasia: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  nivel: z.enum(["sede", "subsede", "congregacao", "celula"] as const),
  parent_church_id: z.string().uuid("Selecione uma igreja pai"),
  pastor_presidente_nome: z.string().min(3, "Nome do pastor é obrigatório").max(100),
  pastor_presidente_cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido").optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")), // Email da igreja
  pastor_email: z.string().email("Email inválido").optional().or(z.literal("")), // Email para login
  pastor_senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional().or(z.literal("")),
  telefone: z.string().max(20).optional(),
  cnpj: z.string().max(20).optional(),
  cep: z.string().max(9).optional(),
  endereco: z.string().max(200).min(5, "Endereço obrigatório"),
  numero: z.string().min(1, "Número obrigatório").max(20),
  bairro: z.string().min(2, "Bairro obrigatório").max(100),
  cidade: z.string().min(2, "Cidade obrigatória").max(100),
  estado: z.string().length(2, "Selecione o estado"),
  razao_social: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ChurchOption {
  id: string;
  nome_fantasia: string;
  nivel: ChurchLevel;
}

export default function CadastrarIgrejaFilha() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingChurches, setIsLoadingChurches] = useState(true);
  const [accessibleChurches, setAccessibleChurches] = useState<ChurchOption[]>([]);
  const [availableChildLevels, setAvailableChildLevels] = useState<ChurchLevel[]>([]);
  const [logoUrl, setLogoUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_fantasia: "",
      nivel: "sede",
      parent_church_id: "",
      pastor_presidente_nome: "",
      pastor_presidente_cpf: "",
      email: "",
      pastor_email: "",
      pastor_senha: "",
      telefone: "",
      cnpj: "", // Opcional
      cep: "",
      endereco: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      razao_social: "",
    },
  });

  const selectedParentId = form.watch("parent_church_id");

  useEffect(() => {
    async function loadAccessibleChurches() {
      if (!user) return;

      setIsLoadingChurches(true);
      try {
        const { data, error } = await supabase
          .from("churches")
          .select("id, nome_fantasia, nivel")
          .eq("is_approved", true)
          .eq("is_active", true)
          .order("nome_fantasia");

        if (error) throw error;

        const churchesWithChildren = (data || []).filter(
          (church) => allowedChildLevels[church.nivel].length > 0
        );

        setAccessibleChurches(churchesWithChildren);

        if (churchesWithChildren.length === 1) {
          form.setValue("parent_church_id", churchesWithChildren[0].id);
        }
      } catch (error) {
        console.error("Error loading churches:", error);
        toast({
          title: "Erro ao carregar igrejas",
          description: "Não foi possível carregar suas igrejas.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingChurches(false);
      }
    }

    loadAccessibleChurches();
  }, [user, toast, form]);

  useEffect(() => {
    if (selectedParentId) {
      const parent = accessibleChurches.find((c) => c.id === selectedParentId);
      if (parent) {
        const childLevels = allowedChildLevels[parent.nivel];
        setAvailableChildLevels(childLevels);

        const currentNivel = form.getValues("nivel");
        if (!childLevels.includes(currentNivel as ChurchLevel)) {
          form.setValue("nivel", childLevels[0] as any);
        }
      }
    } else {
      setAvailableChildLevels([]);
    }
  }, [selectedParentId, accessibleChurches, form]);

  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          form.setValue("endereco", data.logradouro || "");
          form.setValue("bairro", data.bairro || "");
          form.setValue("cidade", data.localidade || "");
          form.setValue("estado", data.uf || "");

          // Focar no número
          const numeroInput = document.getElementById("numero-input");
          if (numeroInput) {
            numeroInput.focus();
          }
        }
      } catch (error) {
        console.error("Error fetching CEP:", error);
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para cadastrar uma igreja.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Criar igreja via RPC (seguro para criar filhos)
      const { data: newChurchId, error } = await supabase.rpc('create_child_church' as any, {
        p_nome_fantasia: data.nome_fantasia.trim(),
        p_nivel: data.nivel,
        p_parent_church_id: data.parent_church_id,
        p_pastor_presidente_nome: data.pastor_presidente_nome?.trim() || null,
        p_email: data.email?.trim() || null, // Email da igreja
        p_telefone: data.telefone?.trim() || null,
        p_cep: data.cep?.trim() || null,
        p_endereco: data.endereco?.trim() || null,
        p_bairro: data.bairro?.trim() || null,
        p_numero: data.numero?.trim() || null,
        p_cidade: data.cidade?.trim() || null,
        p_estado: data.estado?.trim() || null,
      });

      if (error) throw error;
      if (!newChurchId) throw new Error("ID da nova igreja não retornado");

      // 2. Atualizar campos extras que o RPC talvez não suporte (Logo, CNPJ, Razão Social)
      const { error: updateError } = await supabase
        .from('churches')
        .update({
          logo_url: logoUrl || null,
          cnpj: data.cnpj || null,
          razao_social: data.razao_social || null,
          pastor_presidente_cpf: data.pastor_presidente_cpf || null,
          numero: data.numero,
          bairro: data.bairro
        })
        .eq('id', newChurchId as string);

      if (updateError) console.error("Erro ao atualizar detalhes extras da igreja:", updateError);

      // 3. Se forneceu email e senha do pastor, criar usuário
      if (data.pastor_email && data.pastor_senha) {
        try {
          const tempClient = createClient(
            import.meta.env.VITE_SUPABASE_URL,
            import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            {
              auth: {
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false
              }
            }
          );

          const { data: authData, error: authError } = await tempClient.auth.signUp({
            email: data.pastor_email,
            password: data.pastor_senha,
            options: {
              data: {
                full_name: data.pastor_presidente_nome,
              }
            }
          });

          if (authError) {
            console.error("Erro ao criar usuário:", authError);
            toast({
              title: "⚠️ Igreja criada, mas erro no login",
              description: `Erro ao criar usuário: ${authError.message}.`,
              variant: "destructive",
            });
          } else if (authData.user) {
            await supabase.from('members').insert({
              user_id: authData.user.id,
              full_name: data.pastor_presidente_nome,
              email: data.pastor_email,
              church_id: newChurchId, // ID retornado pelo RPC
              is_active: true,
              cargo_eclesiastico: 'Pastor',
              role: 'pastor'
            } as any);

            // Usar RPC para garantir atribuição correta baseada no nível da igreja
            const { error: roleError } = await supabase
              .rpc('assign_initial_pastor_role', {
                _user_id: authData.user.id,
                _church_id: newChurchId as string,
              });

            if (roleError) console.error("Erro ao atribuir role automática:", roleError);
          }
        } catch (userError) {
          console.error("catched error user creating", userError);
        }
      }

      toast({
        title: "Igreja cadastrada com sucesso!",
        description: `${churchLevelLabels[data.nivel]} "${data.nome_fantasia}" foi criada.`,
      });

      navigate("/igrejas");
    } catch (error: any) {
      console.error("Error creating church:", error);
      toast({
        title: "Erro ao cadastrar igreja",
        description: error.message || "Ocorreu um erro ao cadastrar a igreja.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingChurches) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (accessibleChurches.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Church className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Nenhuma igreja disponível</CardTitle>
            <CardDescription>
              Você não tem permissão para cadastrar igrejas filhas ou não há igrejas
              que possam ter filhas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Cadastrar Nova Igreja</CardTitle>
                <CardDescription>
                  Cadastre uma sede, subsede, congregação ou célula vinculada à sua igreja
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Visual Identity Section */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Upload className="h-4 w-4" /> Identidade Visual & Nome
                  </h3>
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="space-y-2">
                      <Label>Logo da Igreja</Label>
                      <PhotoUpload
                        currentPhotoUrl={logoUrl}
                        onPhotoUploaded={setLogoUrl}
                        bucket="church-logos"
                      />
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                      <FormField
                        control={form.control}
                        name="nome_fantasia"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Igreja *</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome da igreja" {...field} className="text-lg font-medium" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="parent_church_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Igreja Pai *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione a igreja pai" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {accessibleChurches.map((church) => (
                                    <SelectItem key={church.id} value={church.id}>
                                      {church.nome_fantasia} ({churchLevelLabels[church.nivel]})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="nivel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Igreja *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={availableChildLevels.length === 0}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {availableChildLevels.map((level) => (
                                    <SelectItem key={level} value={level}>
                                      {churchLevelLabels[level]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="razao_social"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Razão Social</FormLabel>
                        <FormControl>
                          <Input placeholder="Opcional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ <span className="text-muted-foreground font-normal">(Opcional)</span></FormLabel>
                        <FormControl>
                          <Input placeholder="00.000.000/0000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium text-foreground">Endereço & Contato da Igreja</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email da Igreja</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@igreja.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(00) 00000-0000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="endereco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, Avenida..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="numero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input id="numero-input" placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bairro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Bairro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="00000-000"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleCepChange(e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Cidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="UF" maxLength={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Pastor Section */}
                <div className="pt-6 border-t space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" /> Dados do Responsável & Acesso
                  </h3>
                  <div className="p-4 bg-blue-50 border-blue-100 border rounded-lg space-y-4">
                    <FormField
                      control={form.control}
                      name="pastor_presidente_nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pastor Local *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo" {...field} className="bg-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pastor_presidente_cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF *</FormLabel>
                          <FormControl>
                            <Input placeholder="000.000.000-00" {...field} className="bg-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="pastor_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email de Login</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="login@sistema.com" {...field} className="bg-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <Label>Senha de Acesso</Label>
                        <div className="relative">
                          <FormField
                            control={form.control}
                            name="pastor_senha"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="******"
                                    {...field}
                                    className="bg-white pr-10"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || availableChildLevels.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    "Cadastrar Igreja"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
