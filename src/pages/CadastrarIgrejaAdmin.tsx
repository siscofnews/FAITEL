import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ArrowLeft, Church, Loader2, ShieldCheck } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import type { Database } from "@/integrations/supabase/types";

type ChurchLevel = Database["public"]["Enums"]["church_level"];

const churchLevelLabels: Record<ChurchLevel, string> = {
  matriz: "Matriz",
  sede: "Sede",
  subsede: "Subsede",
  congregacao: "Congregação",
  celula: "Célula",
};

const formSchema = z.object({
  nome_fantasia: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  nivel: z.enum(["matriz", "sede", "subsede", "congregacao", "celula"] as const),
  pastor_presidente_nome: z.string().max(100).optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().max(20).optional(),
  cep: z.string().max(9).optional(),
  endereco: z.string().max(200).optional(),
  cidade: z.string().max(100).optional(),
  estado: z.string().max(2).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CadastrarIgrejaAdmin() {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_fantasia: "",
      nivel: "matriz",
      pastor_presidente_nome: "",
      email: "",
      telefone: "",
      cep: "",
      endereco: "",
      cidade: "",
      estado: "",
    },
  });

  // CEP auto-complete
  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          form.setValue("endereco", data.logradouro || "");
          form.setValue("cidade", data.localidade || "");
          form.setValue("estado", data.uf || "");
        }
      } catch (error) {
        console.error("Error fetching CEP:", error);
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user || !isSuperAdmin) {
      toast({
        title: "Erro",
        description: "Você não tem permissão para cadastrar igrejas.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("churches").insert({
        nome_fantasia: data.nome_fantasia.trim(),
        nivel: data.nivel,
        pastor_presidente_nome: data.pastor_presidente_nome?.trim() || null,
        email: data.email?.trim() || null,
        telefone: data.telefone?.trim() || null,
        cep: data.cep?.trim() || null,
        endereco: data.endereco?.trim() || null,
        cidade: data.cidade?.trim() || null,
        estado: data.estado?.trim() || null,
        is_approved: true, // Auto-approved when created by super admin
        is_active: true,
      });

      if (error) throw error;

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

  if (!isSuperAdmin) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <ShieldCheck className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground">Acesso Negado</h1>
            <p className="text-muted-foreground">Apenas super administradores podem acessar esta página.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
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
              <div className="p-2 bg-gold/10 rounded-lg">
                <Church className="h-6 w-6 text-gold" />
              </div>
              <div>
                <CardTitle>Cadastrar Nova Igreja (Admin)</CardTitle>
                <CardDescription>
                  Como super administrador, você pode cadastrar qualquer tipo de igreja
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Church Level */}
                <FormField
                  control={form.control}
                  name="nivel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Igreja *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(Object.keys(churchLevelLabels) as ChurchLevel[]).map((level) => (
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

                {/* Church Name */}
                <FormField
                  control={form.control}
                  name="nome_fantasia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Igreja *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da igreja" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Pastor Name */}
                <FormField
                  control={form.control}
                  name="pastor_presidente_nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Pastor/Líder</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do responsável" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemplo.com" {...field} />
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

                {/* Address */}
                <div className="space-y-4">
                  <h3 className="font-medium text-foreground">Endereço</h3>
                  
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

                  <FormField
                    control={form.control}
                    name="endereco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, número, bairro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  className="w-full"
                  disabled={isSubmitting}
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
    </MainLayout>
  );
}
