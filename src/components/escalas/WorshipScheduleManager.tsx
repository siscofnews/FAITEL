import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Trash2, Loader2, Eye, Lock, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useWorshipSchedules, useCreateWorshipSchedule, useDeleteWorshipSchedule, useServiceTypes } from "@/hooks/useWorshipSchedules";
import { WorshipScheduleForm } from "./WorshipScheduleForm";

interface WorshipScheduleManagerProps {
  churchId: string;
}

export function WorshipScheduleManager({ churchId }: WorshipScheduleManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    service_type_id: "",
    scheduled_date: "",
    start_time: "",
  });

  const { data: schedules, isLoading } = useWorshipSchedules(churchId);
  const { data: serviceTypes } = useServiceTypes(churchId);
  const createSchedule = useCreateWorshipSchedule();
  const deleteSchedule = useDeleteWorshipSchedule();

  const handleCreate = async () => {
    if (!newSchedule.scheduled_date) return;
    await createSchedule.mutateAsync({
      church_id: churchId,
      service_type_id: newSchedule.service_type_id || undefined,
      scheduled_date: newSchedule.scheduled_date,
      start_time: newSchedule.start_time || undefined,
    });
    setNewSchedule({ service_type_id: "", scheduled_date: "", start_time: "" });
    setIsCreateOpen(false);
  };

  const currentSchedule = schedules?.find((s) => s.id === selectedSchedule);

  if (selectedSchedule && currentSchedule) {
    return (
      <div>
        <Button variant="outline" onClick={() => setSelectedSchedule(null)} className="mb-4">
          ← Voltar para lista
        </Button>
        <WorshipScheduleForm
          schedule={currentSchedule}
          churchId={churchId}
          onClose={() => setSelectedSchedule(null)}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Escalas de Culto</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Escala
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Escala de Culto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Tipo de Culto</Label>
                <Select
                  value={newSchedule.service_type_id}
                  onValueChange={(value) => setNewSchedule({ ...newSchedule, service_type_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data do Culto</Label>
                <Input
                  type="date"
                  value={newSchedule.scheduled_date}
                  onChange={(e) => setNewSchedule({ ...newSchedule, scheduled_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Horário (opcional)</Label>
                <Input
                  type="time"
                  value={newSchedule.start_time}
                  onChange={(e) => setNewSchedule({ ...newSchedule, start_time: e.target.value })}
                />
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={createSchedule.isPending || !newSchedule.scheduled_date}>
                {createSchedule.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Criar Escala
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {schedules && schedules.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma escala de culto cadastrada</p>
            <p className="text-sm text-muted-foreground mt-1">Crie uma nova escala para começar</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {schedules?.map((schedule) => (
          <Card key={schedule.id} className={schedule.status === "closed" ? "opacity-75" : ""}>
            <CardContent className="py-4 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-2 min-w-[60px]">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(schedule.scheduled_date), "MMM", { locale: ptBR }).toUpperCase()}
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {format(new Date(schedule.scheduled_date), "dd")}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{schedule.service_type?.name || "Culto"}</p>
                      <Badge variant={schedule.status === "closed" ? "secondary" : "default"} className="text-xs">
                        {schedule.status === "closed" ? (
                          <>
                            <Lock className="h-3 w-3 mr-1" />
                            Encerrado
                          </>
                        ) : (
                          "Aberto"
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(schedule.scheduled_date), "EEEE", { locale: ptBR })}
                      {schedule.start_time && (
                        <span className="ml-2">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {schedule.start_time}
                        </span>
                      )}
                    </p>
                    {schedule.status === "closed" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Oferta: R$ {schedule.offering_amount?.toFixed(2)} | Dízimo: R$ {schedule.tithe_amount?.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedSchedule(schedule.id)}>
                    <Eye className="h-4 w-4 mr-1" />
                    {schedule.status === "closed" ? "Ver" : "Gerenciar"}
                  </Button>
                  {schedule.status === "open" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir escala?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A escala e todas as atribuições serão removidas.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteSchedule.mutate(schedule.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
