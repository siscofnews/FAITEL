import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Church, 
  Users, 
  Calendar, 
  ArrowRight,
  Home,
  QrCode,
  Copy,
  Check
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { toast } from "sonner";

const levelLabels: Record<string, string> = {
  matriz: "Igreja Matriz",
  sede: "Igreja Sede",
  subsede: "Igreja Subsede",
  congregacao: "Congregação",
  celula: "Célula"
};

const levelColors: Record<string, string> = {
  matriz: "bg-primary text-primary-foreground",
  sede: "bg-blue-500 text-white",
  subsede: "bg-green-500 text-white",
  congregacao: "bg-orange-500 text-white",
  celula: "bg-purple-500 text-white"
};

export default function IgrejaLanding() {
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = useState(false);

  const { data: church, isLoading, error } = useQuery({
    queryKey: ['church-landing', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('churches_public')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: memberCount } = useQuery({
    queryKey: ['church-member-count', id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('members_public')
        .select('*', { count: 'exact', head: true })
        .eq('church_id', id);
      
      if (error) return 0;
      return count || 0;
    },
    enabled: !!id
  });

  const registrationLink = `${window.location.origin}/cadastro-membro?igreja=${id}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(registrationLink);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar link");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-64 w-full rounded-2xl mb-8" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !church) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-8">
          <Church className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Igreja não encontrada</h1>
          <p className="text-muted-foreground mb-6">
            A igreja que você está procurando não existe ou não está disponível.
          </p>
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Portal
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M54.627%2C0.632%20L59.368%2C5.373%20L5.373%2C59.368%20L0.632%2C54.627%20Z%22%20fill%3D%22%23000%22%20fill-opacity%3D%220.02%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
        
        <div className="container mx-auto px-4 py-16 relative">
          <Link 
            to="/" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <Home className="mr-2 h-4 w-4" />
            Voltar ao Portal
          </Link>

          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Church Logo/Icon */}
            <div className="flex-shrink-0">
              {church.logo_url ? (
                <img 
                  src={church.logo_url} 
                  alt={church.nome_fantasia || "Igreja"}
                  className="w-40 h-40 rounded-2xl object-cover shadow-xl border-4 border-background"
                />
              ) : (
                <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl">
                  <Church className="h-20 w-20 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Church Info */}
            <div className="flex-1 text-center lg:text-left">
              <Badge className={`mb-4 ${levelColors[church.nivel || 'matriz']}`}>
                {levelLabels[church.nivel || 'matriz']}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {church.nome_fantasia}
              </h1>

              {(church.cidade || church.estado) && (
                <div className="flex items-center justify-center lg:justify-start gap-2 text-lg text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>
                    {[church.cidade, church.estado].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-center lg:justify-start gap-6 mt-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-5 w-5" />
                  <span className="font-semibold text-foreground">{memberCount}</span>
                  <span>membros</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Registration CTA */}
          <Card className="overflow-hidden border-2 border-primary/20 shadow-xl">
            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6" />
                Junte-se a Nós
              </h2>
              <p className="mt-2 opacity-90">
                Faça parte da nossa comunidade e participe dos nossos cultos e atividades.
              </p>
            </div>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-6">
                Cadastre-se como membro da nossa igreja e tenha acesso às escalas de culto, 
                eventos e muito mais.
              </p>
              
              <Button asChild size="lg" className="w-full mb-4">
                <Link to={`/cadastro-membro?igreja=${id}`}>
                  Cadastrar-se como Membro
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={copyLink}
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar Link
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card className="overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-muted to-muted/50 p-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <QrCode className="h-6 w-6" />
                QR Code de Cadastro
              </h2>
              <p className="mt-2 text-muted-foreground">
                Escaneie o código para se cadastrar rapidamente
              </p>
            </div>
            <CardContent className="p-8 flex flex-col items-center">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <QRCodeSVG 
                  value={registrationLink}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="mt-4 text-sm text-muted-foreground text-center">
                Aponte a câmera do seu celular para este código
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <Link to="/consulta-escalas" className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Escalas de Culto</h3>
                <p className="text-sm text-muted-foreground">Consulte as escalas</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <Link to="/eventos" className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Eventos</h3>
                <p className="text-sm text-muted-foreground">Próximos eventos</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <Link to="/" className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                <Home className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Portal</h3>
                <p className="text-sm text-muted-foreground">Acesse o portal</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Church className="h-4 w-4" />
            {church.nome_fantasia}
          </p>
          <p className="text-sm mt-2">
            Sistema de Gestão Eclesiástica - SISCOF
          </p>
        </div>
      </footer>
    </div>
  );
}
