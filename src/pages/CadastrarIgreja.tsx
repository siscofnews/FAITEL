import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Church,
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Loader2,
  CheckCircle,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhotoUpload } from "@/components/PhotoUpload";
import logoSiscof from "@/assets/logo-siscof.png";

const churchSchema = z.object({
  nome_fantasia: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(100, "Nome muito longo"),
  razao_social: z.string().trim().max(100, "Razão Social muito longa").optional().or(z.literal("")),
  pastor_presidente_nome: z.string().trim().min(3, "Nome do pastor deve ter pelo menos 3 caracteres").max(100, "Nome muito longo"),
  pastor_email: z.string().trim().email("Email inválido"),
  pastor_senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(50, "Senha muito longa"),
  pastor_senha_confirmar: z.string(),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido (ex: 12345-678)").optional().or(z.literal("")),
  endereco: z.string().trim().min(5, "Endereço deve ter pelo menos 5 caracteres").max(200, "Endereço muito longo").optional().or(z.literal("")),
  numero: z.string().trim().max(20, "Número muito longo").optional().or(z.literal("")),
  bairro: z.string().trim().max(100, "Bairro muito longo").optional().or(z.literal("")),
  cidade: z.string().trim().min(2, "Cidade deve ter pelo menos 2 caracteres").max(100, "Cidade muito longa"),
  estado: z.string().length(2, "Use a sigla do estado (ex: SP)"),
  telefone: z.string().regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, "Telefone inválido").optional().or(z.literal("")),
  email: z.string().email("Email inválido"),
}).refine((data) => data.pastor_senha === data.pastor_senha_confirmar, {
  message: "As senhas não coincidem",
  path: ["pastor_senha_confirmar"],
});

type ChurchFormData = z.infer<typeof churchSchema>;

const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function CadastrarIgreja() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof ChurchFormData, string>>>({});

  const [formData, setFormData] = useState<ChurchFormData>({
    nome_fantasia: "",
    razao_social: "",
    pastor_presidente_nome: "",
    pastor_email: "",
    pastor_senha: "",
    pastor_senha_confirmar: "",
    cep: "",
    endereco: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    telefone: "",
    email: "",
  });

  const handleChange = (field: keyof ChurchFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          endereco: data.logradouro || prev.endereco,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado,
        }));
        // Focus number field
        document.getElementById("numero")?.focus();
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = churchSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ChurchFormData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ChurchFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Criar conta do pastor presidente
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: result.data.pastor_email,
        password: result.data.pastor_senha,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: result.data.pastor_presidente_nome,
          }
        }
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          throw new Error("Este email já está cadastrado. Use outro email ou faça login.");
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Erro ao criar conta do pastor. Tente novamente.");
      }

      // 2. Criar a igreja matriz
      const { data: churchData, error: churchError } = await supabase
        .from("churches")
        .insert({
          nome_fantasia: result.data.nome_fantasia,
          razao_social: result.data.razao_social || null,
          nivel: "matriz" as const,
          logo_url: logoUrl || null,
          pastor_presidente_nome: result.data.pastor_presidente_nome,
          pastor_presidente_id: authData.user.id,
          cep: result.data.cep || null,
          endereco: result.data.endereco || null,
          numero: result.data.numero || null,
          bairro: result.data.bairro || null,
          cidade: result.data.cidade,
          estado: result.data.estado,
          telefone: result.data.telefone || null,
          email: result.data.email,
          is_approved: false,
          is_active: true,
        })
        .select()
        .single();

      if (churchError) throw churchError;

      // 3. Atribuir role de pastor_presidente ao usuário usando função segura
      const { data: roleAssigned, error: roleError } = await supabase
        .rpc('assign_initial_pastor_role', {
          _user_id: authData.user.id,
          _church_id: churchData.id,
        });

      if (roleError || !roleAssigned) {
        console.error("Erro ao atribuir role:", roleError);
        throw new Error("Falha ao atribuir permissões de administrador. Por favor, entre em contato com o suporte.");
      }

      // Fazer logout para que o usuário confirme o email
      await supabase.auth.signOut();

      setIsSuccess(true);
      toast({
        title: "Cadastro enviado!",
        description: "Sua igreja matriz foi cadastrada. Verifique seu email para confirmar a conta.",
      });
    } catch (error: any) {
      console.error("Erro ao cadastrar igreja:", error);
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Ocorreu um erro ao cadastrar sua igreja. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-primary flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Cadastro Enviado!</h1>
          <p className="text-muted-foreground mb-4">
            Sua igreja matriz foi cadastrada com sucesso!
          </p>
          <div className="bg-gold/10 border border-gold/20 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-foreground">
              <strong>Próximos passos:</strong>
            </p>
            <ol className="text-sm text-muted-foreground mt-2 list-decimal list-inside space-y-1">
              <li>Verifique seu email e confirme sua conta</li>
              <li>Aguarde a aprovação do administrador</li>
              <li>Após aprovado, faça login para acessar o sistema</li>
            </ol>
          </div>
          <div className="space-y-3">
            <Link to="/">
              <Button variant="gold" className="w-full">
                Voltar ao Portal
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                Fazer Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-primary">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={logoSiscof} alt="SISCOF" className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold text-white">
                <span className="text-gold">SISCOF</span>News
              </span>
            </Link>
            <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar ao Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Church className="h-8 w-8 text-gold" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Cadastre sua Igreja Matriz</h1>
              <p className="text-muted-foreground mt-2">
                Registre sua igreja matriz e crie sua conta de administrador
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados da Igreja */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-gold" />
                  Dados da Igreja Matriz
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 flex justify-center mb-6">
                    <div className="space-y-2 text-center">
                      <Label>Logo da Igreja</Label>
                      <PhotoUpload
                        currentPhotoUrl={logoUrl}
                        onPhotoUploaded={setLogoUrl}
                        bucket="church-logos"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="nome_fantasia">Nome Fantasia *</Label>
                    <Input
                      id="nome_fantasia"
                      placeholder="Ex: Igreja Assembleia de Deus"
                      value={formData.nome_fantasia}
                      onChange={(e) => handleChange("nome_fantasia", e.target.value)}
                      className={errors.nome_fantasia ? "border-destructive" : ""}
                    />
                    {errors.nome_fantasia && (
                      <p className="text-sm text-destructive mt-1">{errors.nome_fantasia}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="razao_social">Razão Social / Nome da Igreja (Opcional)</Label>
                    <Input
                      id="razao_social"
                      placeholder="Razão Social ou Nome Oficial Completo"
                      value={formData.razao_social}
                      onChange={(e) => handleChange("razao_social", e.target.value)}
                      className={errors.razao_social ? "border-destructive" : ""}
                    />
                    {errors.razao_social && (
                      <p className="text-sm text-destructive mt-1">{errors.razao_social}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="email">Email da Igreja *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="contato@igreja.com.br"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value.toLowerCase().trim())}
                        className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Pastor Presidente */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <User className="h-5 w-5 text-gold" />
                  Pastor Presidente (Administrador)
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="pastor_presidente_nome">Nome Completo *</Label>
                    <Input
                      id="pastor_presidente_nome"
                      placeholder="Nome completo do pastor presidente"
                      value={formData.pastor_presidente_nome}
                      onChange={(e) => handleChange("pastor_presidente_nome", e.target.value)}
                      className={errors.pastor_presidente_nome ? "border-destructive" : ""}
                    />
                    {errors.pastor_presidente_nome && (
                      <p className="text-sm text-destructive mt-1">{errors.pastor_presidente_nome}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="pastor_email">Email do Pastor (para login) *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="pastor_email"
                        type="email"
                        placeholder="pastor@email.com"
                        value={formData.pastor_email}
                        onChange={(e) => handleChange("pastor_email", e.target.value.toLowerCase().trim())}
                        className={`pl-10 ${errors.pastor_email ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.pastor_email && (
                      <p className="text-sm text-destructive mt-1">{errors.pastor_email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="pastor_senha">Senha *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="pastor_senha"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        value={formData.pastor_senha}
                        onChange={(e) => handleChange("pastor_senha", e.target.value)}
                        className={`pl-10 pr-10 ${errors.pastor_senha ? "border-destructive" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.pastor_senha && (
                      <p className="text-sm text-destructive mt-1">{errors.pastor_senha}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="pastor_senha_confirmar">Confirmar Senha *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="pastor_senha_confirmar"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repita a senha"
                        value={formData.pastor_senha_confirmar}
                        onChange={(e) => handleChange("pastor_senha_confirmar", e.target.value)}
                        className={`pl-10 pr-10 ${errors.pastor_senha_confirmar ? "border-destructive" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.pastor_senha_confirmar && (
                      <p className="text-sm text-destructive mt-1">{errors.pastor_senha_confirmar}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gold" />
                  Endereço
                </h2>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      placeholder="12345-678"
                      value={formData.cep}
                      onChange={(e) => handleChange("cep", e.target.value)}
                      onBlur={(e) => fetchAddressByCep(e.target.value)}
                      className={errors.cep ? "border-destructive" : ""}
                    />
                    {errors.cep && (
                      <p className="text-sm text-destructive mt-1">{errors.cep}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      placeholder="Rua, Avenida, Travessa..."
                      value={formData.endereco}
                      onChange={(e) => handleChange("endereco", e.target.value)}
                      className={errors.endereco ? "border-destructive" : ""}
                    />
                    {errors.endereco && (
                      <p className="text-sm text-destructive mt-1">{errors.endereco}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      placeholder="123"
                      value={formData.numero}
                      onChange={(e) => handleChange("numero", e.target.value)}
                      className={errors.numero ? "border-destructive" : ""}
                    />
                    {errors.numero && (
                      <p className="text-sm text-destructive mt-1">{errors.numero}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      placeholder="Bairro"
                      value={formData.bairro}
                      onChange={(e) => handleChange("bairro", e.target.value)}
                      className={errors.bairro ? "border-destructive" : ""}
                    />
                    {errors.bairro && (
                      <p className="text-sm text-destructive mt-1">{errors.bairro}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                      id="cidade"
                      placeholder="São Paulo"
                      value={formData.cidade}
                      onChange={(e) => handleChange("cidade", e.target.value)}
                      className={errors.cidade ? "border-destructive" : ""}
                    />
                    {errors.cidade && (
                      <p className="text-sm text-destructive mt-1">{errors.cidade}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="estado">Estado *</Label>
                    <Select
                      value={formData.estado}
                      onValueChange={(value) => handleChange("estado", value)}
                    >
                      <SelectTrigger className={errors.estado ? "border-destructive" : ""}>
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((uf) => (
                          <SelectItem key={uf} value={uf}>
                            {uf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.estado && (
                      <p className="text-sm text-destructive mt-1">{errors.estado}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="telefone"
                        placeholder="(11) 99999-9999"
                        value={formData.telefone}
                        onChange={(e) => handleChange("telefone", e.target.value)}
                        className={`pl-10 ${errors.telefone ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.telefone && (
                      <p className="text-sm text-destructive mt-1">{errors.telefone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="bg-gold/10 border border-gold/20 rounded-xl p-4">
                <p className="text-sm text-foreground">
                  <strong>Importante:</strong> Ao cadastrar sua igreja matriz, você criará uma conta de administrador.
                  Após a aprovação, você poderá cadastrar sedes, subsedes, congregações e células vinculadas à sua matriz.
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <Link to="/" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancelar
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant="gold"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    "Cadastrar Igreja Matriz"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
