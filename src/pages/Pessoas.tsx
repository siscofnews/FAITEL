import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Mail, Phone, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface Pessoa {
  id: string;
  name: string;
  photo: string;
  email: string;
  phone: string;
  role: string;
  extraRoles: string[];
  unit: string;
  status: "ativo" | "inativo";
}

const mockPessoas: Pessoa[] = [
  {
    id: "1",
    name: "João Silva",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    email: "joao.silva@email.com",
    phone: "(11) 99999-1234",
    role: "Pastor",
    extraRoles: ["Pregador", "Conselheiro"],
    unit: "Igreja Matriz Central",
    status: "ativo",
  },
  {
    id: "2",
    name: "Maria Costa",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    email: "maria.costa@email.com",
    phone: "(11) 99999-5678",
    role: "Ministra de Louvor",
    extraRoles: ["Professora"],
    unit: "Sede Norte",
    status: "ativo",
  },
  {
    id: "3",
    name: "Pedro Santos",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    email: "pedro.santos@email.com",
    phone: "(11) 99999-9012",
    role: "Pastor",
    extraRoles: ["Pregador"],
    unit: "Sede Norte",
    status: "ativo",
  },
  {
    id: "4",
    name: "Ana Souza",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    email: "ana.souza@email.com",
    phone: "(11) 99999-3456",
    role: "Diaconisa",
    extraRoles: ["Recepcionista"],
    unit: "Congregação Centro",
    status: "inativo",
  },
  {
    id: "5",
    name: "Carlos Lima",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    email: "carlos.lima@email.com",
    phone: "(11) 99999-7890",
    role: "Professor",
    extraRoles: ["Pregador", "Conselheiro"],
    unit: "Subsede Jardim América",
    status: "ativo",
  },
  {
    id: "6",
    name: "Fernanda Oliveira",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    email: "fernanda.oliveira@email.com",
    phone: "(11) 99999-2345",
    role: "Secretária",
    extraRoles: ["Tesoureira"],
    unit: "Igreja Matriz Central",
    status: "ativo",
  },
];

export default function Pessoas() {
  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Pessoas</h1>
          <p className="text-muted-foreground mt-1">Gerencie membros, líderes e voluntários</p>
        </div>
        <Button variant="gold" size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Nova Pessoa
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, função ou unidade..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Role Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {["Todos", "Pastores", "Líderes", "Professores", "Ministros", "Diáconos", "Voluntários"].map((role, i) => (
          <button
            key={role}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
              i === 0
                ? "gradient-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {role}
          </button>
        ))}
      </div>

      {/* People Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPessoas.map((pessoa, index) => (
          <div
            key={pessoa.id}
            className="bg-card rounded-2xl border border-border p-6 card-hover animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <img
                  src={pessoa.photo}
                  alt={pessoa.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-border"
                />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{pessoa.name}</h3>
                  <span className="text-sm text-accent font-medium">{pessoa.role}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    pessoa.status === "ativo"
                      ? "bg-green-100 text-green-700"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {pessoa.status}
                </span>
                <button className="p-1 rounded hover:bg-secondary transition-colors">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="truncate">{pessoa.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{pessoa.phone}</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Funções extras:</p>
              <div className="flex flex-wrap gap-1">
                {pessoa.extraRoles.map((role) => (
                  <span
                    key={role}
                    className="px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Unidade:</span> {pessoa.unit}
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">Editar</Button>
              <Button variant="ghost" size="sm" className="flex-1">Ver Perfil</Button>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
