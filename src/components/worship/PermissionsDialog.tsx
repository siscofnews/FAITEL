import { useState, useEffect } from "react";
import {
    Users,
    Shield,
    Check,
    X,
    Loader2,
    Search,
    Lock
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PermissionsDialogProps {
    churchId: string;
}

interface UserPermissionData {
    user_id: string;
    full_name: string;
    email: string; // From auth or profile
    permissions: {
        id: string;
        can_view_scale: boolean;
        can_edit_scale: boolean;
        can_view_financial: boolean;
        can_edit_financial: boolean;
        can_edit_worship: boolean;
        can_edit_departments: boolean;
        can_manage_permissions: boolean;
    } | null;
}

export function PermissionsDialog({ churchId }: PermissionsDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<UserPermissionData[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (open && churchId) {
            fetchUsersAndPermissions();
        }
    }, [open, churchId]);

    const fetchUsersAndPermissions = async () => {
        setLoading(true);
        try {
            // 1. Fetch profiles (simulating users for now, ideally user_roles or similar)
            // In a real app we'd query users associated with this church.
            // For now, let's query profiles that have a role in this church?
            // Or just query all profiles? Let's assume user_roles lists users in this church.

            const { data: rolesData, error: rolesError } = await supabase
                .from('user_roles')
                .select('user_id, role, profiles(id, full_name)')
                .eq('church_id', churchId);

            if (rolesError) throw rolesError;

            // 2. Fetch existing permissions for this church
            const { data: permsData, error: permsError } = await supabase
                .from('schedule_permissions')
                .select('*')
                .eq('church_id', churchId);

            if (permsError) throw permsError;

            // 3. Map together
            const mapped: UserPermissionData[] = rolesData.map((role: any) => {
                const p = permsData.find((p: any) => p.user_id === role.user_id) || null;
                return {
                    user_id: role.user_id,
                    full_name: role.profiles?.full_name || "Usuário Desconhecido",
                    email: "", // Not available easily in this join without auth view
                    permissions: p
                };
            });

            setUsers(mapped);

        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar usuários.");
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = async (userId: string, currentPerms: any, field: string) => {
        const newVal = !currentPerms?.[field];

        // Optimistic update
        setUsers(prev => prev.map(u => {
            if (u.user_id === userId) {
                const updatedPerms = u.permissions
                    ? { ...u.permissions, [field]: newVal }
                    : {
                        // Default if creating new
                        can_view_scale: false, can_edit_scale: false,
                        can_view_financial: false, can_edit_financial: false,
                        can_edit_worship: false, can_edit_departments: false,
                        can_manage_permissions: false,
                        [field]: newVal
                    };
                return { ...u, permissions: updatedPerms as any };
            }
            return u;
        }));

        try {
            if (currentPerms?.id) {
                // Update
                const { error } = await supabase
                    .from('schedule_permissions')
                    .update({ [field]: newVal })
                    .eq('id', currentPerms.id);
                if (error) throw error;
            } else {
                // Insert
                const { data, error } = await supabase
                    .from('schedule_permissions')
                    .insert({
                        church_id: churchId,
                        user_id: userId,
                        [field]: newVal
                    })
                    .select()
                    .single();

                if (error) throw error;

                // Update local state with real ID
                setUsers(prev => prev.map(u =>
                    u.user_id === userId ? { ...u, permissions: data } : u
                ));
            }
        } catch (error) {
            toast.error("Erro ao atualizar permissão.");
            // Revert would be nice here
        }
    };

    const filteredUsers = users.filter(u => u.full_name?.toLowerCase().includes(search.toLowerCase()));

    const permLabels: Record<string, string> = {
        can_view_scale: "Ver Escala (Liturgia)",
        can_edit_scale: "Editar Escala (Geral)",
        can_view_financial: "Ver Financeiro",
        can_edit_financial: "Editar Financeiro",
        can_edit_worship: "Editar Louvor",
        can_edit_departments: "Editar Apoio/Depts",
        can_manage_permissions: "Gerenciar Permissões"
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Shield className="w-4 h-4" />
                    Gerenciar Acessos
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Permissões de Acesso - Escala de Culto</DialogTitle>
                    <DialogDescription>
                        Defina o que cada usuário pode ver ou editar neste módulo.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-2 my-4">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar usuário..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1"
                    />
                </div>

                <div className="flex-1 min-h-0 border rounded-md">
                    {loading ? (
                        <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <ScrollArea className="h-full">
                            <div className="p-4 space-y-6">
                                {filteredUsers.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-10">Nenhum usuário encontrado.</div>
                                ) : (
                                    filteredUsers.map(user => (
                                        <div key={user.user_id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/20 rounded-lg gap-4">
                                            <div className="flex items-center gap-3 min-w-[200px]">
                                                <Avatar>
                                                    <AvatarFallback>{user.full_name?.[0] || "?"}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">{user.full_name}</p>
                                                    <span className="text-xs text-muted-foreground">ID: ...{user.user_id.slice(-4)}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 justify-end flex-1">
                                                {Object.entries(permLabels).map(([key, label]) => {
                                                    const isOn = (user.permissions as any)?.[key];
                                                    return (
                                                        <div
                                                            key={key}
                                                            className={`
                                                                flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs cursor-pointer transition-colors
                                                                ${isOn ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-muted text-muted-foreground hover:bg-muted'}
                                                            `}
                                                            onClick={() => togglePermission(user.user_id, user.permissions, key)}
                                                        >
                                                            {isOn ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                            {label}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
