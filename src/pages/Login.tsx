import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Church, Eye, EyeOff, Mail, Lock, User, Loader2, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const signupSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
});

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signIn, signUp, user, loading, isSuperAdmin } = useAuth();
  const [target, setTarget] = useState<string>("");

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      const params = new URLSearchParams(location.search);
      const t = params.get('target') || target;
      const defaultRoute = isSuperAdmin || t === 'super'
        ? '/admin/global'
        : t === 'faculdade'
          ? '/admin/faculdades/matriz'
          : t === 'convencao'
            ? '/admin/convencoes/estaduais'
            : '/dashboard';
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || defaultRoute;
      navigate(from, { replace: true });
    }
  }, [user, loading, isSuperAdmin, navigate, location, target]);

  useEffect(()=>{
    const params = new URLSearchParams(location.search);
    const t = params.get('target');
    if (t) setTarget(t);
  }, [location.search]);

  const validateForm = () => {
    setErrors({});

    try {
      if (isLogin) {
        loginSchema.parse({ email, password });
      } else {
        signupSchema.parse({ email, password, fullName: fullName || undefined });
      }
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: { email?: string; password?: string; fullName?: string } = {};
        err.errors.forEach((e) => {
          if (e.path[0] === "email") newErrors.email = e.message;
          if (e.path[0] === "password") newErrors.password = e.message;
          if (e.path[0] === "fullName") newErrors.fullName = e.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);

        if (error) {
          let errorMessage = "Erro ao fazer login";

          if (error.message.includes("Invalid login credentials")) {
            errorMessage = "Email ou senha incorretos";
          } else if (error.message.includes("Email not confirmed")) {
            errorMessage = "Por favor, confirme seu email antes de fazer login";
          } else {
            // SHOW THE REAL ERROR for debugging
            errorMessage = `Erro técnico: ${error.message}`;
          }

          toast({
            title: "Erro no login",
            description: `Detalhe: ${error.message}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login realizado com sucesso!",
            description: "Redirecionando para o dashboard...",
          });
        }
      } else {
        const { error } = await signUp(email, password, fullName);

        if (error) {
          let errorMessage = "Erro ao criar conta";

          if (error.message.includes("User already registered")) {
            errorMessage = "Este email já está cadastrado";
          } else if (error.message.includes("Password should be at least")) {
            errorMessage = "A senha deve ter pelo menos 6 caracteres";
          }

          toast({
            title: "Erro no cadastro",
            description: errorMessage,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Conta criada com sucesso!",
            description: "Você já pode fazer login.",
          });
          setIsLogin(true);
          setPassword("");
        }
      }
    } catch (err) {
      toast({
        title: "Erro inesperado",
        description: `Detalhe do erro: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-slide-up">
          {/* Back to Home */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <Home className="h-4 w-4" />
            Voltar ao Portal
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="gradient-primary p-3 rounded-xl">
              <Church className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">SISCOF</h1>
              <p className="text-sm text-muted-foreground">Sistema de Gestão Eclesiástica</p>
            </div>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-foreground">
              {isLogin ? "Bem-vindo de volta" : "Criar conta"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isLogin
                ? "Entre com suas credenciais para acessar o sistema"
                : "Preencha os dados para criar sua conta"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome"
                    className={`w-full h-14 pl-12 pr-4 rounded-xl border ${errors.fullName ? 'border-destructive' : 'border-input'} bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
                  />
                </div>
                {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  placeholder="seu@email.com"
                  className={`w-full h-14 pl-12 pr-4 rounded-xl border ${errors.email ? 'border-destructive' : 'border-input'} bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full h-14 pl-12 pr-12 rounded-xl border ${errors.password ? 'border-destructive' : 'border-input'} bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-input" />
                  <span className="text-sm text-muted-foreground">Lembrar-me</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/recuperar-senha")}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Esqueci a senha
                </button>
              </div>
            )}

            <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? "Entrando..." : "Criando conta..."}
                </>
              ) : (
                isLogin ? "Entrar" : "Criar Conta"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Toggle */}
          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {isLogin ? "Cadastre-se" : "Entrar"}
            </button>
          </p>

          {/* Contextos de Login */}
          <div className="mt-6 grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={target==='faculdade'? 'hero':'outline'}
              onClick={()=>{ setTarget('faculdade'); navigate('/login?target=faculdade', { replace: true }); }}
            >
              Faculdade (EAD)
            </Button>
            <Button
              type="button"
              variant={target==='convencao'? 'hero':'outline'}
              onClick={()=>{ setTarget('convencao'); navigate('/login?target=convencao', { replace: true }); }}
            >
              Convenção
            </Button>
            <Button
              type="button"
              variant={target==='super'? 'hero':'outline'}
              onClick={()=>{ setTarget('super'); navigate('/login?target=super', { replace: true }); }}
            >
              Super Admin
            </Button>
          </div>

          {/* Login Cliente */}
          <div className="mt-8 p-4 rounded-xl bg-secondary/50 border border-border">
            <p className="text-sm text-center text-muted-foreground">
              Quer apenas consultar escalas?{" "}
              <button className="font-medium text-accent hover:text-accent/80 transition-colors">
                Acesse como visitante
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-primary blur-3xl" />
        </div>

        <div className="relative z-10 text-center text-primary-foreground max-w-lg">
          <div className="w-24 h-24 mx-auto mb-8 rounded-2xl gradient-gold flex items-center justify-center">
            <Church className="h-12 w-12 text-navy" />
          </div>
          <h2 className="text-4xl font-display font-bold mb-4">
            Gestão Eclesiástica Completa
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Uma plataforma integrada para gerenciar igrejas, pessoas, escalas, escola de culto e muito mais.
          </p>

          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              "Hierarquia Multi-Igrejas",
              "Escola de Culto Online",
              "Escalas Litúrgicas",
              "Gestão de Pessoas",
              "Relatórios & BI",
              "Comunicação Interna",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-sm opacity-90">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
