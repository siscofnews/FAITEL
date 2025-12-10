import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Church, Loader2 } from "lucide-react";
import { useServiceTypes, useCreateServiceType, useDeleteServiceType } from "@/hooks/useWorshipSchedules";

interface ServiceTypesManagerProps {
  churchId: string;
}

const DEFAULT_SERVICE_TYPES = [
  { name: "Culto da Família", description: "Culto dominical da família" },
  { name: "Santa Ceia", description: "Culto de Santa Ceia" },
  { name: "Culto de Oração", description: "Culto de oração e intercessão" },
  { name: "Culto de Doutrina", description: "Estudo bíblico e doutrinário" },
  { name: "Culto de Jovens", description: "Culto da mocidade" },
  { name: "Culto de Missões", description: "Culto missionário" },
];

export function ServiceTypesManager({ churchId }: ServiceTypesManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const { data: serviceTypes, isLoading } = useServiceTypes(churchId);
  const createServiceType = useCreateServiceType();
  const deleteServiceType = useDeleteServiceType();

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createServiceType.mutateAsync({
      church_id: churchId,
      name: newName.trim(),
      description: newDescription.trim() || undefined,
    });
    setNewName("");
    setNewDescription("");
    setIsOpen(false);
  };

  const handleCreateDefault = async (type: typeof DEFAULT_SERVICE_TYPES[0]) => {
    await createServiceType.mutateAsync({
      church_id: churchId,
      name: type.name,
      description: type.description,
    });
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
        <h3 className="text-lg font-semibold">Tipos de Culto</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Tipo de Culto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Culto da Família"
                />
              </div>
              <div>
                <Label>Descrição (opcional)</Label>
                <Input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Descrição do tipo de culto"
                />
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={createServiceType.isPending}>
                {createServiceType.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Criar Tipo de Culto
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {serviceTypes && serviceTypes.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Church className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhum tipo de culto cadastrado</p>
            <p className="text-sm text-muted-foreground mb-4">Adicione tipos de culto padrão:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {DEFAULT_SERVICE_TYPES.map((type) => (
                <Button
                  key={type.name}
                  variant="outline"
                  size="sm"
                  onClick={() => handleCreateDefault(type)}
                  disabled={createServiceType.isPending}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {type.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {serviceTypes?.map((type) => (
          <Card key={type.id}>
            <CardContent className="py-3 px-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{type.name}</p>
                {type.description && (
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                )}
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir tipo de culto?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. O tipo "{type.name}" será removido permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteServiceType.mutate(type.id)}
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
