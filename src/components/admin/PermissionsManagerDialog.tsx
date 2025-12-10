import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuditService } from "@/services/AuditService";

interface PermissionsManagerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    userName: string;
    churchId: string;
}

const PERMISSION_GROUPS = [
    {
        title: "Membros",
        permissions: [
            { key: "can_view_members", label: "Visualizar Membros" },
            { key: "can_edit_members", label: "Editar Membros" },
            { key: "can_delete_members", label: "Excluir Membros" }
        ]
    },
    {
        title: "Escalas e Cultos",
        permissions: [
            { key: "can_view_scales", label: "Visualizar Escalas" },
            { key: "can_manage_scales", label: "Gerenciar/Criar Escalas" },
            { key: "can_edit_worship", label: "Editar Liturgia/Louvor" }
        ]
    },
    {
        title: "Financeiro",
        permissions: [
            { key: "can_view_financial", label: "Visualizar Relatórios Financeiros" },
            { key: "can_edit_financial", label: "Lançar Dízimos e Ofertas" }
        ]
    },
    {
        title: "Sistema e Configurações",
        permissions: [
            { key: "can_manage_news", label: "Gerenciar Notícias/Eventos" },
            { key: "can_manage_site", label: "Gerenciar Banners/Site" },
            { key: "can_manage_permissions", label: "Gerenciar Permissões (Admin)" }
        ]
    }
];

export function PermissionsManagerDialog({
    open,
    onOpenChange,
    userId,
    userName,
    churchId
}: PermissionsManagerDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [permissions, setPermissions] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (open && userId && churchId) {
            loadPermissions();
        }
    }, [open, userId, churchId]);

    const loadPermissions = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("app_permissions" as any)
                .select("*")
                .eq("user_id", userId)
                .eq("church_id", churchId)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                // Filter out non-boolean keys if necessary, or just use the object
                setPermissions(data);
            } else {
                // No permissions yet, reset to false
                setPermissions({});
            }
        } catch (error) {
            console.error("Error loading permissions", error);
            toast.error("Erro ao carregar permissões.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = (key: string, checked: boolean) => {
        setPermissions(prev => ({ ...prev, [key]: checked }));
    };

    const handleSelectAll = (checked: boolean) => {
        const newPerms = { ...permissions };
        PERMISSION_GROUPS.forEach(group => {
            group.permissions.forEach(perm => {
                newPerms[perm.key] = checked;
            });
        });
        setPermissions(newPerms);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Prepare data object based on all known keys
            const permissionsData: any = {
                user_id: userId,
                church_id: churchId,
                updated_at: new Date().toISOString()
            };

            PERMISSION_GROUPS.forEach(group => {
                group.permissions.forEach(perm => {
                    permissionsData[perm.key] = permissions[perm.key] || false;
                });
            });

            // Upsert permissions
            const { error } = await supabase
                .from("app_permissions" as any)
                .upsert(permissionsData, { onConflict: "user_id,church_id" });

            if (error) throw error;

            // Log Action
            await AuditService.logAction({
                action: 'GRANT_PERMISSION',
                entity: 'USER',
                entity_id: userId,
                church_id: churchId,
                details: {
                    target_user: userName,
                    permissions_granted: permissionsData
                }
            });

            toast.success(`Permissões atualizadas para ${userName}`);
            onOpenChange(false);

        } catch (error) {
            console.error("Error saving permissions", error);
            toast.error("Erro ao salvar permissões.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-primary">
                        <Shield className="w-6 h-6" />
                        <DialogTitle>Gerenciar Permissões</DialogTitle>
                    </div>
                    <DialogDescription>
                        Defina o que <strong>{userName}</strong> pode acessar nesta igreja.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto pr-2">
                        <div className="flex justify-end mb-4">
                            <Button variant="outline" size="sm" onClick={() => handleSelectAll(true)}>
                                Marcar Todas (Acesso Total)
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {PERMISSION_GROUPS.map((group) => (
                                <div key={group.title} className="bg-muted/30 p-4 rounded-lg border">
                                    <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        {group.title}
                                    </h4>
                                    <div className="space-y-3">
                                        {group.permissions.map((perm) => (
                                            <div key={perm.key} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={perm.key}
                                                    checked={!!permissions[perm.key]}
                                                    onCheckedChange={(checked) => handleToggle(perm.key, checked === true)}
                                                />
                                                <Label htmlFor={perm.key} className="text-sm font-medium cursor-pointer">
                                                    {perm.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 bg-yellow-50 p-3 rounded-md border border-yellow-200 flex items-start gap-2 text-yellow-800 text-sm">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>
                                Atenção: Permissões de "Gerenciar Permissões" permitem que este usuário dê acesso total a outros. Use com cuidado.
                            </p>
                        </div>
                    </div>
                )}

                <DialogFooter className="mt-4 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSaving} className="min-w-[120px]">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Salvar Permissões
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
