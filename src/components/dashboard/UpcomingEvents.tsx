import { Calendar, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: "culto" | "aula" | "reuniao" | "evento";
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Culto de Domingo",
    date: "08 Dez",
    time: "10:00",
    location: "Templo Principal",
    type: "culto",
  },
  {
    id: "2",
    title: "Aula: Fundamentos da Fé",
    date: "09 Dez",
    time: "19:30",
    location: "Sala 3 - Online",
    type: "aula",
  },
  {
    id: "3",
    title: "Reunião de Líderes",
    date: "10 Dez",
    time: "20:00",
    location: "Auditório",
    type: "reuniao",
  },
  {
    id: "4",
    title: "Conferência de Jovens",
    date: "15 Dez",
    time: "18:00",
    location: "Arena Central",
    type: "evento",
  },
];

const typeColors = {
  culto: "bg-primary/10 text-primary border-primary/20",
  aula: "bg-accent/10 text-accent-foreground border-accent/20",
  reuniao: "bg-secondary text-secondary-foreground border-secondary",
  evento: "bg-green-100 text-green-700 border-green-200",
};

export function UpcomingEvents() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-display font-bold text-foreground">
            Próximos Eventos
          </h2>
          <p className="text-sm text-muted-foreground">Agenda da semana</p>
        </div>
        <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          Ver todos
        </button>
      </div>
      <div className="space-y-3">
        {mockEvents.map((event, index) => (
          <div
            key={event.id}
            className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl gradient-primary text-primary-foreground">
              <span className="text-lg font-bold">{event.date.split(" ")[0]}</span>
              <span className="text-xs">{event.date.split(" ")[1]}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">{event.title}</h3>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium capitalize border",
                    typeColors[event.type]
                  )}
                >
                  {event.type}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {event.time}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
