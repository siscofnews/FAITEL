import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  Users, 
  Church, 
  ArrowLeft,
  ChevronRight,
  Heart,
  Share2,
  CheckCircle,
  Phone,
  Mail,
  User
} from "lucide-react";
import { toast } from "sonner";
import { format, isSameDay, parseISO, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import logoIadma from "@/assets/logo-iadma.jpg";
import santaCeiaIadma from "@/assets/eventos/santa-ceia-iadma.jpg";
import { usePageVisitor } from "@/hooks/usePageVisitor";

interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  horario: string;
  local: string;
  endereco: string;
  bairro: string;
  cidade: string;
  referencia: string;
  tipo: "culto" | "conferencia" | "santa-ceia" | "encontro" | "celebracao";
  imagem: string;
  pastores: string;
  vagas?: number;
  inscricoesAbertas: boolean;
}

const eventos: Evento[] = [
  {
    id: "1",
    titulo: "Santa Ceia do Senhor",
    descricao: "Participe conosco deste momento especial de comunhão e celebração da Ceia do Senhor. Um momento de reflexão, gratidão e renovação espiritual com toda a família IADMA.",
    data: "2024-12-07",
    horario: "19:00",
    local: "Templo Central IADMA",
    endereco: "Rua José Antônio Rodrigues Led, 306",
    bairro: "Siriri",
    cidade: "Aguaí - SP",
    referencia: "Próximo à borracharia sentido APAI",
    tipo: "santa-ceia",
    imagem: santaCeiaIadma,
    pastores: "Pr. Valdinei C. Santos e Pra. Thelma Santos",
    inscricoesAbertas: false,
  },
  {
    id: "2",
    titulo: "Culto de Adoração",
    descricao: "Venha adorar ao Senhor conosco! Um momento de louvor intenso e pregação da Palavra de Deus.",
    data: "2024-12-08",
    horario: "18:00",
    local: "Templo Central IADMA",
    endereco: "Rua José Antônio Rodrigues Led, 306",
    bairro: "Siriri",
    cidade: "Aguaí - SP",
    referencia: "Próximo à borracharia sentido APAI",
    tipo: "culto",
    imagem: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=400&fit=crop",
    pastores: "Pr. Valdinei C. Santos",
    inscricoesAbertas: false,
  },
  {
    id: "3",
    titulo: "Encontro de Jovens",
    descricao: "Um encontro especial para a juventude da IADMA. Louvor, palavra e comunhão entre os jovens.",
    data: "2024-12-14",
    horario: "19:30",
    local: "Templo Central IADMA",
    endereco: "Rua José Antônio Rodrigues Led, 306",
    bairro: "Siriri",
    cidade: "Aguaí - SP",
    referencia: "Próximo à borracharia sentido APAI",
    tipo: "encontro",
    imagem: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=400&fit=crop",
    pastores: "Liderança de Jovens",
    vagas: 100,
    inscricoesAbertas: true,
  },
  {
    id: "4",
    titulo: "Conferência de Mulheres",
    descricao: "Conferência especial para mulheres com ministrações, louvor e momentos de edificação espiritual.",
    data: "2024-12-21",
    horario: "15:00",
    local: "Templo Central IADMA",
    endereco: "Rua José Antônio Rodrigues Led, 306",
    bairro: "Siriri",
    cidade: "Aguaí - SP",
    referencia: "Próximo à borracharia sentido APAI",
    tipo: "conferencia",
    imagem: "https://images.unsplash.com/photo-1609234656388-0ff363383899?w=800&h=400&fit=crop",
    pastores: "Pra. Thelma Santos",
    vagas: 150,
    inscricoesAbertas: true,
  },
  {
    id: "5",
    titulo: "Celebração de Natal",
    descricao: "Venha celebrar o nascimento de Jesus conosco! Uma noite especial de louvor e gratidão.",
    data: "2024-12-24",
    horario: "20:00",
    local: "Templo Central IADMA",
    endereco: "Rua José Antônio Rodrigues Led, 306",
    bairro: "Siriri",
    cidade: "Aguaí - SP",
    referencia: "Próximo à borracharia sentido APAI",
    tipo: "celebracao",
    imagem: "https://images.unsplash.com/photo-1512389142860-9c449e58a814?w=800&h=400&fit=crop",
    pastores: "Pr. Valdinei C. Santos e Pra. Thelma Santos",
    inscricoesAbertas: false,
  },
];

const tipoConfig = {
  "culto": { label: "Culto", color: "bg-blue-500" },
  "conferencia": { label: "Conferência", color: "bg-purple-500" },
  "santa-ceia": { label: "Santa Ceia", color: "bg-amber-600" },
  "encontro": { label: "Encontro", color: "bg-green-500" },
  "celebracao": { label: "Celebração", color: "bg-red-500" },
};

function InscricaoForm({ evento, onSuccess }: { evento: Evento; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    observacoes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast.error("Por favor, informe seu nome");
      return;
    }

    setIsSubmitting(true);
    
    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Inscrição realizada com sucesso!", {
      description: `Você está inscrito no evento "${evento.titulo}"`,
    });
    
    setIsSubmitting(false);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nome">Nome Completo *</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          placeholder="Seu nome completo"
          required
        />
      </div>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="seu@email.com"
        />
      </div>
      <div>
        <Label htmlFor="telefone">Telefone / WhatsApp</Label>
        <Input
          id="telefone"
          value={formData.telefone}
          onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
          placeholder="(00) 00000-0000"
        />
      </div>
      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          placeholder="Alguma informação adicional..."
          rows={3}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Confirmar Inscrição"}
      </Button>
    </form>
  );
}

function EventoCard({ evento }: { evento: Evento }) {
  const [showInscricao, setShowInscricao] = useState(false);
  const config = tipoConfig[evento.tipo];
  const dataEvento = parseISO(evento.data);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: evento.titulo,
        text: `${evento.titulo} - ${format(dataEvento, "dd/MM/yyyy")} às ${evento.horario}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado!");
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={evento.imagem}
          alt={evento.titulo}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <Badge className={`absolute top-3 left-3 ${config.color} text-white`}>
          {config.label}
        </Badge>
        <div className="absolute bottom-3 left-3 text-white">
          <p className="text-2xl font-bold">{format(dataEvento, "dd")}</p>
          <p className="text-sm uppercase">{format(dataEvento, "MMM", { locale: ptBR })}</p>
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={handleShare}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-colors"
          >
            <Share2 className="h-4 w-4 text-white" />
          </button>
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-colors">
            <Heart className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
      <CardContent className="p-5">
        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
          {evento.titulo}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {evento.descricao}
        </p>
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <p className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            {evento.horario}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            {evento.local}
          </p>
          <p className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            {evento.pastores}
          </p>
        </div>
        
        {evento.inscricoesAbertas ? (
          <Dialog open={showInscricao} onOpenChange={setShowInscricao}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="gold">
                <CheckCircle className="h-4 w-4 mr-2" />
                Inscrever-se
                {evento.vagas && (
                  <Badge variant="secondary" className="ml-2">
                    {evento.vagas} vagas
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Inscrição: {evento.titulo}</DialogTitle>
                <DialogDescription>
                  {format(dataEvento, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {evento.horario}
                </DialogDescription>
              </DialogHeader>
              <InscricaoForm evento={evento} onSuccess={() => setShowInscricao(false)} />
            </DialogContent>
          </Dialog>
        ) : (
          <Button className="w-full" variant="outline">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Entrada Livre
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function EventosIADMA() {
  usePageVisitor("/eventos");
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("todos");

  const eventosNaData = selectedDate
    ? eventos.filter((e) => isSameDay(parseISO(e.data), selectedDate))
    : [];

  const eventosDoTipo = activeTab === "todos" 
    ? eventos 
    : eventos.filter((e) => e.tipo === activeTab);

  const datasComEventos = eventos.map((e) => parseISO(e.data));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="bg-navy text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar ao Portal</span>
            </Link>
            <img src={logoIadma} alt="IADMA" className="h-12 w-12 rounded-full object-cover" />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-sky-900 via-sky-800 to-sky-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-gold text-navy mb-4">Igreja de Aguaí - SP</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Eventos IADMA
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-6">
            Confira nossa programação e participe dos cultos e eventos especiais da 
            Igreja Assembleia de Deus Missão Apostólica
          </p>
          <div className="flex items-center justify-center gap-6 text-white/70">
            <span className="flex items-center gap-2">
              <Church className="h-5 w-5" />
              Templo Central
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Aguaí - SP
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar - Calendário */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Calendário
                </CardTitle>
                <CardDescription>
                  Selecione uma data para ver os eventos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={ptBR}
                  className="rounded-md border pointer-events-auto"
                  modifiers={{
                    hasEvent: datasComEventos,
                  }}
                  modifiersStyles={{
                    hasEvent: {
                      fontWeight: "bold",
                      backgroundColor: "hsl(var(--primary) / 0.1)",
                      color: "hsl(var(--primary))",
                    },
                  }}
                />

                {selectedDate && eventosNaData.length > 0 && (
                  <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-semibold mb-2">
                      {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                    </h4>
                    <div className="space-y-2">
                      {eventosNaData.map((e) => (
                        <div key={e.id} className="flex items-center gap-2 text-sm">
                          <Badge className={`${tipoConfig[e.tipo].color} text-white text-xs`}>
                            {e.horario}
                          </Badge>
                          <span>{e.titulo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info da Igreja */}
                <div className="mt-6 p-4 bg-muted rounded-lg space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Church className="h-4 w-4 text-primary" />
                    Templo Central IADMA
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Rua José Antônio Rodrigues Led, 306<br />
                    Bairro Siriri - Aguaí/SP
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Próximo à borracharia sentido APAI
                  </p>
                  <div className="pt-2 border-t space-y-1">
                    <p className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Pr. Valdinei C. Santos
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Pra. Thelma Santos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Eventos */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Próximos Eventos</h2>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="culto">Cultos</TabsTrigger>
                <TabsTrigger value="santa-ceia">Santa Ceia</TabsTrigger>
                <TabsTrigger value="conferencia">Conferências</TabsTrigger>
                <TabsTrigger value="encontro">Encontros</TabsTrigger>
                <TabsTrigger value="celebracao">Celebrações</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid md:grid-cols-2 gap-6">
              {eventosDoTipo.map((evento) => (
                <EventoCard key={evento.id} evento={evento} />
              ))}
            </div>

            {eventosDoTipo.length === 0 && (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhum evento encontrado para esta categoria
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-navy text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <img src={logoIadma} alt="IADMA" className="h-16 w-16 rounded-full mx-auto mb-4 object-cover" />
          <h3 className="text-xl font-bold mb-2">Igreja Assembleia de Deus Missão Apostólica</h3>
          <p className="text-white/70 mb-4">Aguaí - São Paulo</p>
          <p className="text-sm text-white/50">
            Pr. Valdinei da Conceição Santos • Pra. Thelma Santana Menezes Santos
          </p>
        </div>
      </footer>
    </div>
  );
}