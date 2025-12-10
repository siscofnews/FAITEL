import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Youtube, User, Loader2, Lock, AlertTriangle, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  useServiceTypes,
  useAssignmentTypes,
  useScheduleAssignments,
  useCreateScheduleAssignment,
  useUpdateScheduleAssignment,
  useDeleteScheduleAssignment,
  useCloseWorshipSchedule,
  WorshipSchedule,
} from "@/hooks/useWorshipSchedules";

interface WorshipScheduleFormProps {
  schedule: WorshipSchedule;
  churchId: string;
  onClose: () => void;
}

const MEMBER_ROLES = [
  "Membro", "Obreiro", "Auxiliar", "Porteiro", "Músico", "Líder de Célula",
  "Diácono", "Diaconisa", "Presbítero", "Missionária", "Missionário",
  "Evangelista", "Pastor", "Pastora", "Bispo", "Bispa", "Apóstolo", "Apóstola"
];

export function WorshipScheduleForm({ schedule, churchId, onClose }: WorshipScheduleFormProps) {
  const { user } = useAuth();
  const [closingData, setClosingData] = useState({
    offering_amount: "",
    tithe_amount: "",
    conferente_name: "",
  });
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  const { data: serviceTypes } = useServiceTypes(churchId);
  const { data: assignmentTypes } = useAssignmentTypes(churchId);
  const { data: assignments, isLoading: isLoadingAssignments } = useScheduleAssignments(schedule.id);

  // Busca membros de toda a hierarquia acessível (RLS já filtra automaticamente)
  const { data: members } = useQuery({
    queryKey: ["members-for-schedule-hierarchy"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("id, full_name, role, church_id, church:churches(nome_fantasia)")
        .eq("is_active", true)
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const createAssignment = useCreateScheduleAssignment();
  const updateAssignment = useUpdateScheduleAssignment();
  const deleteAssignment = useDeleteScheduleAssignment();
  const closeSchedule = useCloseWorshipSchedule();

  const isClosed = schedule.status === "closed";

  const handleAddAssignment = async (assignmentTypeId: string) => {
    await createAssignment.mutateAsync({
      worship_schedule_id: schedule.id,
      assignment_type_id: assignmentTypeId,
    });
  };

  const handleUpdateAssignment = async (id: string, updates: { member_id?: string; member_role?: string; youtube_link?: string; attended?: boolean; absence_reason?: string }) => {
    await updateAssignment.mutateAsync({ id, ...updates });
  };

  const handleCloseSchedule = async () => {
    if (!closingData.offering_amount || !closingData.tithe_amount || !closingData.conferente_name) {
      return;
    }
    await closeSchedule.mutateAsync({
      id: schedule.id,
      offering_amount: parseFloat(closingData.offering_amount),
      tithe_amount: parseFloat(closingData.tithe_amount),
      conferente_name: closingData.conferente_name,
      closed_by: user?.id || "",
    });
    setShowCloseDialog(false);
    onClose();
  };

  const getAssignmentsForType = (typeId: string) => {
    return assignments?.filter((a) => a.assignment_type_id === typeId) || [];
  };

  const hasAbsences = assignments?.some((a) => a.attended === false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {schedule.service_type?.name || "Culto"} - {new Date(schedule.scheduled_date).toLocaleDateString("pt-BR")}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={isClosed ? "secondary" : "default"}>
              {isClosed ? "Encerrado" : "Aberto"}
            </Badge>
            {schedule.start_time && (
              <span className="text-sm text-muted-foreground">{schedule.start_time}</span>
            )}
          </div>
        </div>
        {!isClosed && (
          <Button onClick={() => setShowCloseDialog(true)} variant="destructive">
            <Lock className="h-4 w-4 mr-2" />
            Encerrar Culto
          </Button>
        )}
      </div>

      {isClosed && (
        <Card className="bg-muted/50">
          <CardContent className="py-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Oferta</p>
                <p className="text-lg font-semibold">R$ {schedule.offering_amount?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dízimo</p>
                <p className="text-lg font-semibold">R$ {schedule.tithe_amount?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conferente</p>
                <p className="text-lg font-semibold">{schedule.conferente_name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {hasAbsences && (
        <Card className="border-amber-500/50 bg-amber-500/10">
          <CardContent className="py-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span className="text-amber-700 dark:text-amber-300">Existem faltas registradas nesta escala</span>
          </CardContent>
        </Card>
      )}

      {isLoadingAssignments ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {assignmentTypes?.map((type) => {
            const typeAssignments = getAssignmentsForType(type.id);
            return (
              <Card key={type.id}>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {type.name}
                      {type.requires_youtube_link && <Youtube className="h-4 w-4 text-red-500" />}
                    </CardTitle>
                    {!isClosed && (
                      <Button size="sm" variant="outline" onClick={() => handleAddAssignment(type.id)} disabled={createAssignment.isPending}>
                        <Plus className="h-3 w-3 mr-1" />
                        Adicionar
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="py-3">
                  {typeAssignments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">Nenhuma pessoa atribuída</p>
                  ) : (
                    <div className="space-y-3">
                      {typeAssignments.map((assignment) => (
                        <div key={assignment.id} className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <Select
                                value={assignment.member_id || ""}
                                onValueChange={(value) => handleUpdateAssignment(assignment.id, { member_id: value || undefined })}
                                disabled={isClosed}
                              >
                                <SelectTrigger>
                                  <User className="h-4 w-4 mr-2" />
                                  <SelectValue placeholder="Selecionar pessoa" />
                                </SelectTrigger>
                                <SelectContent>
                                  {members?.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                      {member.full_name} {member.church?.nome_fantasia && member.church_id !== churchId ? `(${member.church.nome_fantasia})` : ""}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={assignment.member_role || ""}
                                onValueChange={(value) => handleUpdateAssignment(assignment.id, { member_role: value })}
                                disabled={isClosed}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Função ministerial" />
                                </SelectTrigger>
                                <SelectContent>
                                  {MEMBER_ROLES.map((role) => (
                                    <SelectItem key={role} value={role}>
                                      {role}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {!isClosed && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => deleteAssignment.mutate(assignment.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {type.requires_youtube_link && (
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Link do YouTube"
                                value={assignment.youtube_link || ""}
                                onChange={(e) => handleUpdateAssignment(assignment.id, { youtube_link: e.target.value })}
                                disabled={isClosed}
                                className="flex-1"
                              />
                              {assignment.youtube_link && (
                                <Button size="icon" variant="outline" asChild>
                                  <a href={assignment.youtube_link} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          )}
                          {isClosed && (
                            <div className="flex items-center gap-4 pt-2 border-t">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`attended-${assignment.id}`}
                                  checked={assignment.attended ?? true}
                                  onCheckedChange={(checked) => handleUpdateAssignment(assignment.id, { attended: checked as boolean })}
                                />
                                <Label htmlFor={`attended-${assignment.id}`} className="text-sm">
                                  Compareceu
                                </Label>
                              </div>
                              {assignment.attended === false && (
                                <Input
                                  placeholder="Motivo da falta"
                                  value={assignment.absence_reason || ""}
                                  onChange={(e) => handleUpdateAssignment(assignment.id, { absence_reason: e.target.value })}
                                  className="flex-1"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encerrar Culto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Valor da Oferta (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={closingData.offering_amount}
                onChange={(e) => setClosingData({ ...closingData, offering_amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Valor do Dízimo (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={closingData.tithe_amount}
                onChange={(e) => setClosingData({ ...closingData, tithe_amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Nome do Conferente</Label>
              <Input
                value={closingData.conferente_name}
                onChange={(e) => setClosingData({ ...closingData, conferente_name: e.target.value })}
                placeholder="Quem contou os valores"
              />
            </div>
            <Button
              onClick={handleCloseSchedule}
              className="w-full"
              disabled={closeSchedule.isPending || !closingData.offering_amount || !closingData.tithe_amount || !closingData.conferente_name}
            >
              {closeSchedule.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
              Confirmar Encerramento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
