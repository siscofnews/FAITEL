import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus, Play, Users, Clock, Award, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface Curso {
  id: string;
  title: string;
  description: string;
  instructor: string;
  students: number;
  duration: string;
  lessons: number;
  progress?: number;
  status: "em_andamento" | "disponivel" | "concluido";
  image: string;
}

const mockCursos: Curso[] = [
  {
    id: "1",
    title: "Fundamentos da Fé Cristã",
    description: "Introdução aos princípios básicos da fé e doutrina cristã",
    instructor: "Pr. João Silva",
    students: 156,
    duration: "12 semanas",
    lessons: 24,
    progress: 75,
    status: "em_andamento",
    image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=400",
  },
  {
    id: "2",
    title: "Liderança Ministerial",
    description: "Desenvolvendo líderes para o ministério local",
    instructor: "Pr. Pedro Santos",
    students: 89,
    duration: "8 semanas",
    lessons: 16,
    status: "disponivel",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400",
  },
  {
    id: "3",
    title: "Louvor e Adoração",
    description: "Técnicas e teologia do louvor congregacional",
    instructor: "Min. Maria Costa",
    students: 234,
    duration: "6 semanas",
    lessons: 12,
    progress: 100,
    status: "concluido",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400",
  },
  {
    id: "4",
    title: "Estudos Bíblicos Avançados",
    description: "Hermenêutica e exegese bíblica para líderes",
    instructor: "Prof. Carlos Lima",
    students: 67,
    duration: "16 semanas",
    lessons: 32,
    status: "disponivel",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
  },
];

const statusConfig = {
  em_andamento: { label: "Em Andamento", color: "bg-accent/20 text-accent-foreground" },
  disponivel: { label: "Disponível", color: "bg-green-100 text-green-700" },
  concluido: { label: "Concluído", color: "bg-primary/10 text-primary" },
};

export default function Escola() {
  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Escola de <span className="text-gradient">Culto</span>
          </h1>
          <p className="text-muted-foreground mt-1">Cursos, aulas e certificações online</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <BookOpen className="h-5 w-5 mr-2" />
            Biblioteca
          </Button>
          <Button variant="gold" size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Novo Curso
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Cursos Ativos", value: "15", icon: BookOpen },
          { label: "Alunos Matriculados", value: "892", icon: Users },
          { label: "Horas de Conteúdo", value: "340h", icon: Clock },
          { label: "Certificados Emitidos", value: "1.247", icon: Award },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockCursos.map((curso, index) => {
          const status = statusConfig[curso.status];
          return (
            <div
              key={curso.id}
              className="bg-card rounded-2xl border border-border overflow-hidden card-hover animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-48">
                <img
                  src={curso.image}
                  alt={curso.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className={cn("px-3 py-1 rounded-full text-xs font-medium", status.color)}>
                    {status.label}
                  </span>
                </div>
                {curso.status !== "disponivel" && (
                  <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full gradient-gold flex items-center justify-center hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 text-navy ml-1" />
                  </button>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">{curso.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{curso.description}</p>
                
                {curso.progress !== undefined && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium text-foreground">{curso.progress}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-gold rounded-full transition-all duration-500"
                        style={{ width: `${curso.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {curso.students}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {curso.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {curso.lessons} aulas
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">
                        {curso.instructor.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">{curso.instructor}</span>
                  </div>
                  <Button variant={curso.status === "disponivel" ? "gold" : "outline"} size="sm">
                    {curso.status === "disponivel" ? "Matricular" : "Acessar"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </MainLayout>
  );
}
