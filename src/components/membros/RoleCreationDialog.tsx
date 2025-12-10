import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RoleCreationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRoleCreated: (roleName: string) => void;
}

export function RoleCreationDialog({
    open,
    onOpenChange,
    onRoleCreated,
}: RoleCreationDialogProps) {
    const [newRole, setNewRole] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRole.trim()) return;

        setIsSubmitting(true);
        try {
            // Formata como Título (ex: "Líder De Jovens") ou mantém como digitado?
            // O usuário pediu "manter a ortografia exata". Vamos apenas fazer trim.
            const formattedRole = newRole.trim();

            const { error } = await supabase
                .from("church_roles")
                .insert({ name: formattedRole });

            if (error) {
                if (error.code === "23505") { // Unique violation
                    toast.error("Este cargo já existe.");
                } else {
                    throw error;
                }
                return;
            }

            toast.success("Cargo criado com sucesso!");
            onRoleCreated(formattedRole);
            setNewRole("");
            onOpenChange(false);
        } catch (error) {
            console.error("Erro ao criar cargo:", error);
            toast.error("Erro ao criar cargo. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Criar Novo Cargo</DialogTitle>
                    <DialogDescription>
                        Adicione um novo cargo à lista oficial do sistema.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateRole}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nome
                            </Label>
                            <Input
                                id="name"
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                placeholder="Ex: Web Designer"
                                className="col-span-3"
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={!newRole.trim() || isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Criar Cargo
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
