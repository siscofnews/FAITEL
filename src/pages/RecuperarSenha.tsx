import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Church, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
});

const passwordSchema = z.object({
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(72, "Senha muito longa"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type FlowStep = "request" | "success" | "reset";

export default function RecuperarSenha() {
  const [step, setStep] = useState<FlowStep>("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user arrived via password reset link
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");
    const accessToken = hashParams.get("access_token");
    
    if (type === "recovery" && accessToken) {
      setStep("reset");
    }
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      emailSchema.parse({ email });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors({ email: err.errors[0].message });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/recuperar-senha`,
      });

      if (error) {
        toast({
          title: "Erro ao enviar email",
          description: "Não foi possível enviar o email de recuperação. Tente novamente.",
          variant: "destructive",
        });
      } else {
        setStep("success");
      }
    } catch {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      passwordSchema.parse({ password, confirmPassword });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: { password?: string; confirmPassword?: string } = {};
        err.errors.forEach((e) => {
          if (e.path[0] === "password") newErrors.password = e.message;
          if (e.path[0] === "confirmPassword") newErrors.confirmPassword = e.message;
        });
        setErrors(newErrors);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        let errorMessage = "Não foi possível atualizar a senha.";
        
        if (error.message.includes("same as")) {
          errorMessage = "A nova senha deve ser diferente da anterior.";
        } else if (error.message.includes("weak")) {
          errorMessage = "A senha é muito fraca. Escolha uma senha mais forte.";
        }
        
        toast({
          title: "Erro ao atualizar senha",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Senha atualizada com sucesso!",
          description: "Você será redirecionado para o login.",
        });
        
        // Sign out and redirect to login
        await supabase.auth.signOut();
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-slide-up">
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

          {/* Navigation */}
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <span className="text-muted-foreground">•</span>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o login
            </button>
          </div>

          {/* Request Reset Step */}
          {step === "request" && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-display font-bold text-foreground">
                  Recuperar senha
                </h2>
                <p className="text-muted-foreground mt-2">
                  Digite seu email para receber o link de recuperação
                </p>
              </div>

              <form onSubmit={handleRequestReset} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className={`w-full h-14 pl-12 pr-4 rounded-xl border ${errors.email ? 'border-destructive' : 'border-input'} bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>

                <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar link de recuperação"
                  )}
                </Button>
              </form>
            </>
          )}

          {/* Success Step */}
          {step === "success" && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                Email enviado!
              </h2>
              <p className="text-muted-foreground mb-6">
                Enviamos um link de recuperação para <span className="font-medium text-foreground">{email}</span>. 
                Verifique sua caixa de entrada e spam.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                O link expira em 24 horas.
              </p>
              <Button
                variant="outline"
                onClick={() => setStep("request")}
                className="w-full"
              >
                Enviar novamente
              </Button>
            </div>
          )}

          {/* Reset Password Step */}
          {step === "reset" && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-display font-bold text-foreground">
                  Nova senha
                </h2>
                <p className="text-muted-foreground mt-2">
                  Digite sua nova senha abaixo
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nova senha</label>
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

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Confirmar senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full h-14 pl-12 pr-12 rounded-xl border ${errors.confirmPassword ? 'border-destructive' : 'border-input'} bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>}
                </div>

                <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    "Atualizar senha"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-primary blur-3xl" />
        </div>

        <div className="relative z-10 text-center text-primary-foreground max-w-lg">
          <div className="w-24 h-24 mx-auto mb-8 rounded-2xl gradient-gold flex items-center justify-center">
            <Lock className="h-12 w-12 text-navy" />
          </div>
          <h2 className="text-4xl font-display font-bold mb-4">
            Segurança em primeiro lugar
          </h2>
          <p className="text-lg opacity-90">
            Seu acesso é protegido com criptografia de ponta. Recupere sua senha de forma segura e rápida.
          </p>
        </div>
      </div>
    </div>
  );
}
