import { Plus, UserPlus, Calendar, FileText, QrCode, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { icon: Plus, label: "Nova Igreja", description: "Cadastrar unidade" },
  { icon: UserPlus, label: "Nova Pessoa", description: "Adicionar membro" },
  { icon: Calendar, label: "Criar Evento", description: "Agendar culto" },
  { icon: FileText, label: "Nova Escala", description: "Montar equipe" },
  { icon: GraduationCap, label: "Nova Turma", description: "Criar curso" },
  { icon: QrCode, label: "QR Code", description: "Cartaz de Cadastro" },
];

interface QuickActionsProps {
  onAction?: (action: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="mb-6">
        <h2 className="text-lg font-display font-bold text-foreground">Ações Rápidas</h2>
        <p className="text-sm text-muted-foreground">Acesse as funções mais usadas</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <button
            key={action.label}
            onClick={() => onAction?.(action.label)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-all duration-200 hover:scale-[1.02] animate-scale-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="p-3 rounded-xl gradient-gold">
              <action.icon className="h-5 w-5 text-navy" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
