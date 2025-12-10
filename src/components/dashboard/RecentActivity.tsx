import { cn } from "@/lib/utils";
import { Check, UserPlus, Calendar, GraduationCap, FileText } from "lucide-react";

interface Activity {
  id: string;
  type: "presenca" | "cadastro" | "evento" | "curso" | "escala";
  title: string;
  description: string;
  time: string;
  user: string;
}

const mockActivity: Activity[] = [
  {
    id: "1",
    type: "presenca",
    title: "Presença registrada",
    description: "150 membros no Culto de Domingo",
    time: "Há 2 horas",
    user: "Sistema",
  },
  {
    id: "2",
    type: "cadastro",
    title: "Novo membro cadastrado",
    description: "Ana Paula Silva - Congregação Centro",
    time: "Há 3 horas",
    user: "Pr. Pedro",
  },
  {
    id: "3",
    type: "escala",
    title: "Escala publicada",
    description: "Escala de Louvor - Dezembro 2024",
    time: "Há 5 horas",
    user: "Coord. Maria",
  },
  {
    id: "4",
    type: "curso",
    title: "Turma concluída",
    description: "15 alunos formados em Fundamentos",
    time: "Há 1 dia",
    user: "Prof. Carlos",
  },
];

const typeConfig = {
  presenca: { icon: Check, color: "text-green-600", bg: "bg-green-100" },
  cadastro: { icon: UserPlus, color: "text-primary", bg: "bg-primary/10" },
  evento: { icon: Calendar, color: "text-accent-foreground", bg: "bg-accent/10" },
  curso: { icon: GraduationCap, color: "text-navy-light", bg: "bg-navy-light/10" },
  escala: { icon: FileText, color: "text-muted-foreground", bg: "bg-muted" },
};

export function RecentActivity() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-display font-bold text-foreground">
            Atividade Recente
          </h2>
          <p className="text-sm text-muted-foreground">Últimas atualizações do sistema</p>
        </div>
      </div>
      <div className="space-y-4">
        {mockActivity.map((activity, index) => {
          const config = typeConfig[activity.type];
          const Icon = config.icon;
          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn("p-2 rounded-lg", config.bg)}>
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{activity.user}</span>
                  <span>•</span>
                  <span>{activity.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
