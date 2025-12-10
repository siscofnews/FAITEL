import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Church, Clock, User, Youtube, Loader2, ExternalLink, Search, Users, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import logoCEC from "@/assets/logo-cec.png";
import { usePageVisitor } from "@/hooks/usePageVisitor";

interface ScheduleAssignment {
  id: string;
  member_id: string | null;
  member_role: string | null;
  youtube_link: string | null;
  assignment_type: {
    id: string;
    name: string;
    requires_youtube_link: boolean;
    sort_order: number;
  };
  member: {
    id: string;
    full_name: string;
  } | null;
}

interface WorshipSchedule {
  id: string;
  church_id: string;
  scheduled_date: string;
  start_time: string | null;
  status: string;
  service_type: {
    id: string;
    name: string;
  } | null;
}

type PeriodFilter = "all" | "this-week" | "this-month" | "next-month";

const getPeriodDates = (period: PeriodFilter) => {
  const today = new Date();
  
  switch (period) {
    case "this-week":
      return {
        start: format(startOfWeek(today, { weekStartsOn: 0 }), "yyyy-MM-dd"),
        end: format(endOfWeek(today, { weekStartsOn: 0 }), "yyyy-MM-dd"),
      };
    case "this-month":
      return {
        start: format(startOfMonth(today), "yyyy-MM-dd"),
        end: format(endOfMonth(today), "yyyy-MM-dd"),
      };
    case "next-month":
      const nextMonth = addMonths(today, 1);
      return {
        start: format(startOfMonth(nextMonth), "yyyy-MM-dd"),
        end: format(endOfMonth(nextMonth), "yyyy-MM-dd"),
      };
    default:
      return {
        start: format(today, "yyyy-MM-dd"),
        end: null,
      };
  }
};

const periodLabels: Record<PeriodFilter, string> = {
  "all": "Todas as próximas",
  "this-week": "Esta semana",
  "this-month": "Este mês",
  "next-month": "Próximo mês",
};

export default function ConsultaEscalas() {
  usePageVisitor("/escalas");
  
  const [selectedChurchId, setSelectedChurchId] = useState<string>("");
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");

  // Fetch approved churches
  const { data: churches, isLoading: isLoadingChurches } = useQuery({
    queryKey: ["public-churches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("churches_public")
        .select("id, nome_fantasia, cidade, estado")
        .order("nome_fantasia");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch schedules for selected church with period filter
  const { data: schedules, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ["public-schedules", selectedChurchId, periodFilter],
    queryFn: async () => {
      if (!selectedChurchId) return [];
      
      const { start, end } = getPeriodDates(periodFilter);
      
      let query = supabase
        .from("worship_schedules")
        .select(`*, service_type:service_types(id, name)`)
        .eq("church_id", selectedChurchId)
        .gte("scheduled_date", start)
        .order("scheduled_date", { ascending: true });

      if (end) {
        query = query.lte("scheduled_date", end);
      } else {
        query = query.limit(20);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as WorshipSchedule[];
    },
    enabled: !!selectedChurchId,
  });

  // Fetch assignments for selected schedule
  const { data: assignments, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ["public-assignments", selectedScheduleId],
    queryFn: async () => {
      if (!selectedScheduleId) return [];
      const { data, error } = await supabase
        .from("worship_schedule_assignments")
        .select(`
          id, member_id, member_role, youtube_link,
          assignment_type:schedule_assignment_types(id, name, requires_youtube_link, sort_order),
          member:members(id, full_name)
        `)
        .eq("worship_schedule_id", selectedScheduleId)
        .order("created_at");
      if (error) throw error;
      return (data as unknown as ScheduleAssignment[])?.sort((a, b) => 
        (a.assignment_type?.sort_order || 0) - (b.assignment_type?.sort_order || 0)
      ) || [];
    },
    enabled: !!selectedScheduleId,
  });

  const selectedSchedule = schedules?.find((s) => s.id === selectedScheduleId);
  const selectedChurch = churches?.find((c) => c.id === selectedChurchId);

  // Auto-select first church
  useEffect(() => {
    if (churches && churches.length > 0 && !selectedChurchId) {
      setSelectedChurchId(churches[0].id || "");
    }
  }, [churches, selectedChurchId]);

  // Reset selected schedule when period changes
  useEffect(() => {
    setSelectedScheduleId(null);
  }, [periodFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <img src={logoCEC} alt="CEC" className="h-10 w-auto" />
              </Link>
              <div>
                <h1 className="text-xl font-display font-bold text-foreground">Consulta de Escalas</h1>
                <p className="text-sm text-muted-foreground">Visualize as escalas de culto</p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Portal
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              {/* Church Selection */}
              <div className="flex items-center gap-2 flex-1">
                <Church className="h-5 w-5 text-primary shrink-0" />
                <span className="font-medium shrink-0">Igreja:</span>
                <Select value={selectedChurchId} onValueChange={(v) => { setSelectedChurchId(v); setSelectedScheduleId(null); }}>
                  <SelectTrigger className="w-full sm:w-[300px]">
                    <SelectValue placeholder="Escolha uma igreja" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingChurches ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      churches?.map((church) => (
                        <SelectItem key={church.id} value={church.id || ""}>
                          {church.nome_fantasia} {church.cidade && `- ${church.cidade}/${church.estado}`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Period Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary shrink-0" />
                <span className="font-medium shrink-0">Período:</span>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(periodLabels) as PeriodFilter[]).map((period) => (
                    <Button
                      key={period}
                      variant={periodFilter === period ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPeriodFilter(period)}
                      className="text-xs"
                    >
                      {periodLabels[period]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {!selectedChurchId ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Selecione uma Igreja</h2>
              <p className="text-muted-foreground">
                Escolha uma igreja acima para visualizar as escalas de culto
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Schedules List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Escalas
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {schedules?.length || 0} encontrada{(schedules?.length || 0) !== 1 ? "s" : ""}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{periodLabels[periodFilter]}</p>
                </CardHeader>
                <CardContent>
                  {isLoadingSchedules ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : schedules && schedules.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma escala encontrada</p>
                      <p className="text-sm mt-1">para o período selecionado</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      {schedules?.map((schedule) => (
                        <button
                          key={schedule.id}
                          onClick={() => setSelectedScheduleId(schedule.id)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedScheduleId === schedule.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted/50 hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {schedule.service_type?.name || "Culto"}
                              </p>
                              <p className={`text-sm ${selectedScheduleId === schedule.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                {format(new Date(schedule.scheduled_date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                              </p>
                            </div>
                            {schedule.start_time && (
                              <div className={`flex items-center gap-1 text-sm ${selectedScheduleId === schedule.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                <Clock className="h-3 w-3" />
                                {schedule.start_time}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Schedule Details */}
            <div className="lg:col-span-2">
              {!selectedScheduleId ? (
                <Card className="border-dashed h-full">
                  <CardContent className="py-16 text-center">
                    <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Selecione uma Escala</h2>
                    <p className="text-muted-foreground">
                      Clique em uma escala à esquerda para ver os detalhes
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">
                          {selectedSchedule?.service_type?.name || "Culto"}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1">
                          {selectedSchedule && format(new Date(selectedSchedule.scheduled_date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          {selectedSchedule?.start_time && ` às ${selectedSchedule.start_time}`}
                        </p>
                      </div>
                      <Badge variant={selectedSchedule?.status === "closed" ? "secondary" : "default"}>
                        {selectedSchedule?.status === "closed" ? "Encerrado" : "Aberto"}
                      </Badge>
                    </div>
                    {selectedChurch && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                        <Church className="h-4 w-4" />
                        {selectedChurch.nome_fantasia}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {isLoadingAssignments ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : assignments && assignments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Nenhuma atribuição registrada ainda</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {assignments?.map((assignment) => (
                          <div key={assignment.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                                {assignment.assignment_type?.requires_youtube_link ? (
                                  <Youtube className="h-5 w-5 text-red-500" />
                                ) : (
                                  <User className="h-5 w-5 text-primary" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{assignment.assignment_type?.name}</p>
                                {assignment.member ? (
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm text-muted-foreground">
                                      {assignment.member.full_name}
                                    </p>
                                    {assignment.member_role && (
                                      <Badge variant="outline" className="text-xs">
                                        {assignment.member_role}
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground italic">
                                    A definir
                                  </p>
                                )}
                              </div>
                            </div>
                            {assignment.youtube_link && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={assignment.youtube_link} target="_blank" rel="noopener noreferrer">
                                  <Youtube className="h-4 w-4 mr-2 text-red-500" />
                                  Assistir
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">
            Sistema de Escalas - SISCOF © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
