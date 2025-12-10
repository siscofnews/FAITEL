import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Loader2, CalendarIcon, ChevronLeft, ChevronRight, Check, X, Clock } from "lucide-react";
import {
  useSchedules,
  useEvents,
  useLiturgicalFunctions,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  Schedule,
} from "@/hooks/useEscalas";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, startOfWeek, endOfWeek, addWeeks, subWeeks, parseISO, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  churchId: string;
}

interface ScheduleFormProps {
  churchId: string;
  selectedDate?: Date;
  onSuccess: () => void;
}

function ScheduleForm({ churchId, selectedDate, onSuccess }: ScheduleFormProps) {
  const [eventId, setEventId] = useState("");
  const [functionId, setFunctionId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [date, setDate] = useState<Date | undefined>(selectedDate || new Date());
  const [notes, setNotes] = useState("");

  const { data: events } = useEvents(churchId);
  const { data: functions } = useLiturgicalFunctions(churchId);
  const { data: members } = useQuery({
    queryKey: ["members-for-schedule", churchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("id, full_name")
        .eq("church_id", churchId)
        .eq("is_active", true)
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useCreateSchedule();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventId || !functionId || !memberId || !date) return;

    createMutation.mutate(
      {
        event_id: eventId,
        function_id: functionId,
        member_id: memberId,
        scheduled_date: format(date, "yyyy-MM-dd"),
        notes: notes || null,
        status: "pending",
      },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Evento *</Label>
        <Select value={eventId} onValueChange={setEventId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o evento" />
          </SelectTrigger>
          <SelectContent>
            {events?.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Data *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: ptBR }) : "Selecione a data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Função *</Label>
        <Select value={functionId} onValueChange={setFunctionId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a função" />
          </SelectTrigger>
          <SelectContent>
            {functions?.map((func) => (
              <SelectItem key={func.id} value={func.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: func.color }}
                  />
                  {func.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Membro *</Label>
        <Select value={memberId} onValueChange={setMemberId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o membro" />
          </SelectTrigger>
          <SelectContent>
            {members?.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações opcionais..."
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={createMutation.isPending || !eventId || !functionId || !memberId || !date}
      >
        {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Adicionar à Escala
      </Button>
    </form>
  );
}

export function ScheduleManager({ churchId }: Props) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });

  const { data: schedules, isLoading } = useSchedules(
    churchId,
    format(weekStart, "yyyy-MM-dd"),
    format(weekEnd, "yyyy-MM-dd")
  );

  const updateMutation = useUpdateSchedule();
  const deleteMutation = useDeleteSchedule();

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const schedulesByDate = useMemo(() => {
    if (!schedules) return {};
    return schedules.reduce((acc, schedule) => {
      const date = schedule.scheduled_date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(schedule);
      return acc;
    }, {} as Record<string, Schedule[]>);
  }, [schedules]);

  const handlePrevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const handleNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const handleToday = () => setCurrentWeek(new Date());

  const handleAddSchedule = (date: Date) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const handleStatusChange = (scheduleId: string, status: "confirmed" | "declined") => {
    updateMutation.mutate({ id: scheduleId, status });
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId, {
        onSuccess: () => setDeletingId(null),
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500/20 text-green-600 text-xs">Confirmado</Badge>;
      case "declined":
        return <Badge className="bg-red-500/20 text-red-600 text-xs">Recusado</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Pendente</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <h3 className="font-semibold">
              {format(weekStart, "d 'de' MMMM", { locale: ptBR })} -{" "}
              {format(weekEnd, "d 'de' MMMM yyyy", { locale: ptBR })}
            </h3>
          </div>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleToday}>
            Hoje
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedDate(undefined)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Escala
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar à Escala</DialogTitle>
            </DialogHeader>
            <ScheduleForm
              churchId={churchId}
              selectedDate={selectedDate}
              onSuccess={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const daySchedules = schedulesByDate[dateStr] || [];
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={dateStr}
              className={cn(
                "min-h-[200px] p-3 rounded-lg border bg-card",
                isToday && "ring-2 ring-primary"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground uppercase">
                    {format(day, "EEE", { locale: ptBR })}
                  </div>
                  <div
                    className={cn(
                      "text-lg font-semibold",
                      isToday && "text-primary"
                    )}
                  >
                    {format(day, "d")}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleAddSchedule(day)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="space-y-2">
                {daySchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="p-2 rounded text-xs space-y-1"
                    style={{
                      backgroundColor: schedule.function?.color + "20",
                      borderLeft: `3px solid ${schedule.function?.color}`,
                    }}
                  >
                    <div className="font-medium truncate">
                      {schedule.event?.name}
                    </div>
                    {schedule.event?.start_time && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {schedule.event.start_time.slice(0, 5)}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: schedule.function?.color }}
                      />
                      <span className="truncate">{schedule.function?.name}</span>
                    </div>
                    <div className="font-medium truncate">
                      {schedule.member?.full_name}
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      {getStatusBadge(schedule.status)}
                      {schedule.status === "pending" && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => handleStatusChange(schedule.id, "confirmed")}
                          >
                            <Check className="h-3 w-3 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => handleStatusChange(schedule.id, "declined")}
                          >
                            <X className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir escala?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
