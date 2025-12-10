import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ListChecks, Loader2, Youtube, GripVertical } from "lucide-react";
import { useAssignmentTypes, useCreateAssignmentType, useDeleteAssignmentType } from "@/hooks/useWorshipSchedules";

interface AssignmentTypesManagerProps {
  churchId: string;
}

const DEFAULT_ASSIGNMENT_TYPES = [
  { name: "Dirigente", description: "Dirigente do culto", requires_youtube_link: false, sort_order: 1 },
  { name: "Porteiro", description: "Porteiro do culto", requires_youtube_link: false, sort_order: 2 },
  { name: "Porteira", description: "Porteira do culto", requires_youtube_link: false, sort_order: 3 },
  { name: "Serviço de Água", description: "Responsável pelo serviço de água", requires_youtube_link: false, sort_order: 4 },
  { name: "Ofertório", description: "Responsável pelo ofertório", requires_youtube_link: false, sort_order: 5 },
  { name: "Ministério de Louvor", description: "Equipe de louvor", requires_youtube_link: false, sort_order: 6 },
  { name: "Hino de Abertura", description: "Hino cantado na abertura", requires_youtube_link: true, sort_order: 7 },
  { name: "Hinos Cantados", description: "Hinos cantados durante o culto", requires_youtube_link: true, sort_order: 8 },
  { name: "Leitura Oficial", description: "Responsável pela leitura bíblica", requires_youtube_link: false, sort_order: 9 },
  { name: "Pregador", description: "Pregador do culto", requires_youtube_link: false, sort_order: 10 },
  { name: "Encerramento", description: "Responsável pelo encerramento", requires_youtube_link: false, sort_order: 11 },
];

export function AssignmentTypesManager({ churchId }: AssignmentTypesManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [requiresYoutubeLink, setRequiresYoutubeLink] = useState(false);

  const { data: assignmentTypes, isLoading } = useAssignmentTypes(churchId);
  const createAssignmentType = useCreateAssignmentType();
  const deleteAssignmentType = useDeleteAssignmentType();

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const maxOrder = assignmentTypes?.reduce((max, t) => Math.max(max, t.sort_order), 0) || 0;
    await createAssignmentType.mutateAsync({
      church_id: churchId,
      name: newName.trim(),
      description: newDescription.trim() || undefined,
      requires_youtube_link: requiresYoutubeLink,
      sort_order: maxOrder + 1,
    });
    setNewName("");
    setNewDescription("");
    setRequiresYoutubeLink(false);
    setIsOpen(false);
  };

  const handleCreateDefaults = async () => {
    for (const type of DEFAULT_ASSIGNMENT_TYPES) {
      await createAssignmentType.mutateAsync({
        church_id: churchId,
        ...type,
      });
    }
  };

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
        <h3 className="text-lg font-semibold">Funções da Escala</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Função
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Função de Escala</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Dirigente"
                />
              </div>
              <div>
                <Label>Descrição (opcional)</Label>
                <Input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Descrição da função"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="youtube"
                  checked={requiresYoutubeLink}
                  onCheckedChange={(checked) => setRequiresYoutubeLink(checked as boolean)}
                />
                <Label htmlFor="youtube" className="text-sm cursor-pointer">
                  Requer link do YouTube (para hinos)
                </Label>
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={createAssignmentType.isPending}>
                {createAssignmentType.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Criar Função
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {assignmentTypes && assignmentTypes.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <ListChecks className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhuma função cadastrada</p>
            <Button onClick={handleCreateDefaults} disabled={createAssignmentType.isPending}>
              {createAssignmentType.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Adicionar Funções Padrão
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-2">
        {assignmentTypes?.map((type) => (
          <Card key={type.id}>
            <CardContent className="py-3 px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{type.name}</p>
                    {type.requires_youtube_link && (
                      <Youtube className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  {type.description && (
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  )}
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir função?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. A função "{type.name}" será removida permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteAssignmentType.mutate(type.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
