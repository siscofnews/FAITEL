import { useState } from "react";
import { Link } from "react-router-dom";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter,
  Church,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Event {
  id: number;
  title: string;
  description: string;
  date: Date;
  time: string;
  endTime?: string;
  location: string;
  address: string;
  church: string;
  type: string;
  image: string;
  capacity?: number;
  registered?: number;
  speaker?: string;
  details?: string;
}

const events: Event[] = [
  {
    id: 1,
    title: "Culto de Celebração - Igreja Matriz",
    description: "Culto especial de celebração com louvor e adoração.",
    date: new Date(2025, 11, 8),
    time: "19:00",
    endTime: "21:00",
    location: "São Paulo, SP",
    address: "Rua das Flores, 123 - Centro",
    church: "Igreja Batista Central",
    type: "Culto",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop",
    capacity: 500,
    registered: 320,
    speaker: "Pr. João Silva"
  },
  {
    id: 2,
    title: "Conferência de Líderes 2025",
    description: "Capacitação e desenvolvimento de líderes ministeriais.",
    date: new Date(2025, 11, 15),
    time: "09:00",
    endTime: "18:00",
    location: "Rio de Janeiro, RJ",
    address: "Av. Brasil, 456 - Copacabana",
    church: "Comunidade Cristã",
    type: "Conferência",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
    capacity: 1000,
    registered: 756,
    speaker: "Pr. Marcos Oliveira",
    details: "Inclui material didático e certificado de participação."
  },
  {
    id: 3,
    title: "Retiro Espiritual de Jovens",
    description: "Três dias de comunhão, louvor e edificação espiritual.",
    date: new Date(2025, 11, 20),
    time: "08:00",
    location: "Campos do Jordão, SP",
    address: "Pousada Monte Sinai",
    church: "Igreja Presbiteriana",
    type: "Retiro",
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300&fit=crop",
    capacity: 150,
    registered: 142,
    details: "Inclui hospedagem e alimentação."
  },
  {
    id: 4,
    title: "Cantata de Natal",
    description: "Apresentação musical especial de Natal com coral e orquestra.",
    date: new Date(2025, 11, 24),
    time: "20:00",
    endTime: "22:00",
    location: "Belo Horizonte, MG",
    address: "Teatro Municipal - Centro",
    church: "Assembleia de Deus",
    type: "Musical",
    image: "https://images.unsplash.com/photo-1512389142860-9c449e58a814?w=400&h=300&fit=crop",
    capacity: 800,
    registered: 650
  },
  {
    id: 5,
    title: "Congresso de Missões",
    description: "Evento sobre evangelismo e missões mundiais.",
    date: new Date(2025, 11, 28),
    time: "14:00",
    endTime: "20:00",
    location: "Salvador, BA",
    address: "Centro de Convenções",
    church: "CEMADEB",
    type: "Congresso",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop",
    capacity: 2000,
    registered: 1200,
    speaker: "Miss. Paulo Santos"
  },
  {
    id: 6,
    title: "Seminário de Casais",
    description: "Fortalecendo relacionamentos através da Palavra.",
    date: new Date(2026, 0, 10),
    time: "19:00",
    endTime: "21:30",
    location: "Curitiba, PR",
    address: "Igreja Central - Batel",
    church: "Igreja Metodista",
    type: "Seminário",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop",
    capacity: 200,
    registered: 85,
    speaker: "Pr. Carlos e Pra. Maria"
  },
  {
    id: 7,
    title: "Escola Bíblica de Férias",
    description: "Atividades e ensino bíblico para crianças.",
    date: new Date(2026, 0, 15),
    time: "09:00",
    endTime: "12:00",
    location: "Porto Alegre, RS",
    address: "Igreja Evangélica - Centro",
    church: "Igreja Evangélica",
    type: "Infantil",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop",
    capacity: 100,
    registered: 45
  },
  {
    id: 8,
    title: "Vigília de Ano Novo",
    description: "Celebração de passagem de ano com louvor e oração.",
    date: new Date(2025, 11, 31),
    time: "22:00",
    location: "Recife, PE",
    address: "Templo Central - Boa Viagem",
    church: "Igreja Batista",
    type: "Vigília",
    image: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&h=300&fit=crop",
    capacity: 1500,
    registered: 890
  }
];

const eventTypes = ["Todos", "Culto", "Conferência", "Retiro", "Musical", "Congresso", "Seminário", "Infantil", "Vigília"];

const typeColors: Record<string, string> = {
  "Culto": "bg-blue-500",
  "Conferência": "bg-purple-500",
  "Retiro": "bg-green-500",
  "Musical": "bg-pink-500",
  "Congresso": "bg-orange-500",
  "Seminário": "bg-cyan-500",
  "Infantil": "bg-yellow-500",
  "Vigília": "bg-indigo-500"
};

export default function Eventos() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week the month starts on (0 = Sunday)
  const startDay = monthStart.getDay();
  const emptyDays = Array(startDay).fill(null);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.church.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "Todos" || event.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  const eventsForSelectedDate = selectedDate ? getEventsForDay(selectedDate) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-navy text-white py-6">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Portal
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="text-gold">Eventos</span> Evangélicos
          </h1>
          <p className="text-white/70 mt-2">
            Confira a agenda de eventos das igrejas parceiras
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {eventTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className={selectedType === type ? "bg-gold text-navy hover:bg-gold/90" : ""}
                >
                  {type}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <h3 className="font-bold text-lg capitalize">
                    {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                    <div key={day} className="text-xs font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}

                  {emptyDays.map((_, index) => (
                    <div key={`empty-${index}`} className="p-2" />
                  ))}

                  {daysInMonth.map((day) => {
                    const dayEvents = getEventsForDay(day);
                    const hasEvents = dayEvents.length > 0;
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          "p-2 rounded-lg text-sm relative transition-all",
                          isToday && "font-bold",
                          isSelected && "bg-gold text-navy",
                          !isSelected && hasEvents && "bg-gold/20 hover:bg-gold/30",
                          !isSelected && !hasEvents && "hover:bg-muted"
                        )}
                      >
                        {format(day, "d")}
                        {hasEvents && !isSelected && (
                          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gold rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Date Events */}
                {selectedDate && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold mb-2">
                      {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                    </h4>
                    {eventsForSelectedDate.length > 0 ? (
                      <div className="space-y-2">
                        {eventsForSelectedDate.map((event) => (
                          <button
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className="w-full text-left p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                          >
                            <p className="font-medium text-sm line-clamp-1">{event.title}</p>
                            <p className="text-xs text-muted-foreground">{event.time} - {event.church}</p>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum evento nesta data.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Events List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-navy mb-4">
              Próximos Eventos ({filteredEvents.length})
            </h2>
            
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <Card 
                  key={event.id} 
                  className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-48 h-32 sm:h-auto relative overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className={cn("absolute top-2 left-2 text-white", typeColors[event.type])}>
                        {event.type}
                      </Badge>
                    </div>
                    <CardContent className="flex-1 p-4">
                      <h3 className="font-bold text-lg text-navy group-hover:text-gold transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4 text-gold" />
                          {format(event.date, "dd/MM/yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gold" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gold" />
                          {event.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Church className="h-4 w-4 text-gold" />
                        <span className="text-sm font-medium">{event.church}</span>
                      </div>
                      {event.capacity && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{event.registered} inscritos</span>
                            <span>{event.capacity} vagas</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gold rounded-full"
                              style={{ width: `${(event.registered! / event.capacity) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </div>
                </Card>
              ))}

              {filteredEvents.length === 0 && (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum evento encontrado.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Event Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <>
              <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
                <Badge className={cn("absolute top-4 left-4 text-white", typeColors[selectedEvent.type])}>
                  {selectedEvent.type}
                </Badge>
              </div>
              
              <DialogHeader>
                <DialogTitle className="text-2xl text-navy">{selectedEvent.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <p className="text-muted-foreground">{selectedEvent.description}</p>

                {selectedEvent.details && (
                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedEvent.details}</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-gold" />
                    <div>
                      <p className="text-sm font-medium">Data</p>
                      <p className="text-sm text-muted-foreground">
                        {format(selectedEvent.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gold" />
                    <div>
                      <p className="text-sm font-medium">Horário</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedEvent.time}{selectedEvent.endTime ? ` - ${selectedEvent.endTime}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gold" />
                    <div>
                      <p className="text-sm font-medium">Local</p>
                      <p className="text-sm text-muted-foreground">{selectedEvent.location}</p>
                      <p className="text-xs text-muted-foreground">{selectedEvent.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Church className="h-5 w-5 text-gold" />
                    <div>
                      <p className="text-sm font-medium">Igreja</p>
                      <p className="text-sm text-muted-foreground">{selectedEvent.church}</p>
                    </div>
                  </div>
                </div>

                {selectedEvent.speaker && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gold" />
                    <div>
                      <p className="text-sm font-medium">Palestrante/Pregador</p>
                      <p className="text-sm text-muted-foreground">{selectedEvent.speaker}</p>
                    </div>
                  </div>
                )}

                {selectedEvent.capacity && (
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Inscrições</span>
                      <span className="text-sm text-muted-foreground">
                        {selectedEvent.registered} / {selectedEvent.capacity} vagas
                      </span>
                    </div>
                    <div className="h-3 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gold rounded-full transition-all"
                        style={{ width: `${(selectedEvent.registered! / selectedEvent.capacity) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {selectedEvent.capacity - selectedEvent.registered!} vagas disponíveis
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Link to="/login" className="flex-1">
                    <Button variant="gold" className="w-full">
                      Inscrever-se
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                    Fechar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
