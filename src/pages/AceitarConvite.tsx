import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Mail, Lock, User, Home } from "lucide-react";
import { z } from "zod";

const signUpSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

interface Invitation {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  church_id: string;
  churches?: {
    nome_fantasia: string;
  };
}

export default function AceitarConvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchInvitation() {
      if (!token) {
        setError("Token de convite inválido");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("invitations")
        .select(`
          id,
          email,
          role,
          expires_at,
          church_id,
          churches (
            nome_fantasia
          )
        `)
        .eq("token", token)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (fetchError || !data) {
        setError("Convite inválido, expirado ou já utilizado");
        setLoading(false);
        return;
      }

      setInvitation(data);
      setFormData(prev => ({ ...prev, email: data.email }));
      setLoading(false);
    }

    fetchInvitation();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const result = signUpSchema.safeParse(formData);
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

    setSubmitting(true);

    try {
      // Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Use the invitation (this creates the user role)
        const { data: useResult, error: useError } = await supabase
          .rpc("use_invitation", {
            _token: token,
            _user_id: authData.user.id,
          });

        if (useError) {
          console.error("Error using invitation:", useError);
          toast({
            title: "Aviso",
            description: "Conta criada, mas houve um erro ao associar o convite. Entre em contato com o administrador.",
            variant: "destructive",
          });
        }

        setSuccess(true);
        toast({
          title: "Conta criada com sucesso!",
          description: "Você já pode fazer login no sistema.",
        });

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err: any) {
      console.error("Error accepting invitation:", err);
      toast({
        title: "Erro ao criar conta",
        description: err.message || "Ocorreu um erro ao processar o convite",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const roleLabels: Record<string, string> = {
    super_admin: "Super Administrador",
    pastor_presidente: "Pastor Presidente",
    pastor: "Pastor",
    lider: "Líder",
    membro: "Membro",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando convite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Link
          to="/"
          className="fixed top-4 left-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors bg-card px-3 py-2 rounded-lg border"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <XCircle className="h-16 w-16 text-destructive" />
              <h2 className="text-xl font-semibold">Convite Inválido</h2>
              <p className="text-muted-foreground">{error}</p>
              <div className="flex gap-3 mt-4">
                <Button asChild variant="outline">
                  <Link to="/">Ir para Home</Link>
                </Button>
                <Button asChild>
                  <Link to="/login">Fazer Login</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h2 className="text-xl font-semibold">Conta Criada!</h2>
              <p className="text-muted-foreground">
                Sua conta foi criada com sucesso. Redirecionando para o login...
              </p>
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Home Link */}
      <Link
        to="/"
        className="fixed top-4 left-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors bg-card px-3 py-2 rounded-lg border"
      >
        <Home className="h-4 w-4" />
        Home
      </Link>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Aceitar Convite</CardTitle>
          <CardDescription>
            Você foi convidado para fazer parte de{" "}
            <span className="font-semibold text-foreground">
              {invitation?.churches?.nome_fantasia}
            </span>{" "}
            como <span className="font-semibold text-primary">{roleLabels[invitation?.role || "membro"]}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  className="pl-10"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={submitting}
                />
              </div>
              {formErrors.fullName && (
                <p className="text-sm text-destructive">{formErrors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10 bg-muted"
                  value={formData.email}
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground">
                O email foi definido pelo convite e não pode ser alterado
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  className="pl-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={submitting}
                />
              </div>
              {formErrors.password && (
                <p className="text-sm text-destructive">{formErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repita a senha"
                  className="pl-10"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={submitting}
                />
              </div>
              {formErrors.confirmPassword && (
                <p className="text-sm text-destructive">{formErrors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar Conta e Aceitar Convite"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Fazer login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
