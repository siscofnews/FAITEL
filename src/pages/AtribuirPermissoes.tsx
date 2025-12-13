import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, Shield, Search, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface User {
    id: string;
    nome: string;
    email: string | null;
    church: {
        id: string;
        nome: string;
    };
}

interface RoleGlobal {
    id: string;
    name: string;
    level: number;
}

interface UserPermission {
    id: string;
    role_global_id: string;
    role: {
        name: string;
        level: number;
    };
}

export default function AtribuirPermissoes() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<RoleGlobal[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Buscar usuários
            const { data: usersData, error: usersError } = await supabase
                .from("members")
                .select(`
          id,
          nome,
          email,
          church:churches!inner (
            id,
            nome
          )
        `)
                .limit(100);

            if (usersError) throw usersError;
            setUsers(usersData || []);

            // Buscar perfis globais
            const { data: rolesData, error: rolesError } = await supabase
                .from("role_global")
                .select("*")
                .order("level", { ascending: true });

            if (rolesError) throw rolesError;
            setRoles(rolesData || []);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar dados",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchUserPermissions = async (userId: string, orgId: string) => {
        try {
            const { data, error } = await supabase
                .from("user_local_permissions")
                .select(`
          id,
          role_global_id,
          role:role_global (
            name,
            level
          )
        `)
                .eq("user_id", userId)
                .eq("org_id", orgId);

            if (error) throw error;
            setUserPermissions(data || []);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar permissões",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleUserClick = (user: User) => {
        setSelectedUser(user);
        const church = Array.isArray(user.church) ? user.church[0] : user.church;
        fetchUserPermissions(user.id, church.id);
        setIsDialogOpen(true);
    };

    const handleAssignRole = async () => {
        if (!selectedUser || !selectedRoleId) return;

        try {
            const church = Array.isArray(selectedUser.church) ? selectedUser.church[0] : selectedUser.church;

            const { error } = await supabase
                .from("user_local_permissions")
                .upsert({
                    user_id: selectedUser.id,
                    org_id: church.id,
                    role_global_id: selectedRoleId,
                    local_overrides: {}
                }, {
                    onConflict: "user_id,org_id"
                });

            if (error) throw error;

            toast({ title: "Perfil atribuído com sucesso!" });
            fetchUserPermissions(selectedUser.id, church.id);
            setSelectedRoleId("");
        } catch (error: any) {
            toast({
                title: "Erro ao atribuir perfil",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleRemovePermission = async (permissionId: string) => {
        if (!confirm("Remover esta permissão?")) return;

        try {
            const { error } = await supabase
                .from("user_local_permissions")
                .delete()
                .eq("id", permissionId);

            if (error) throw error;

            toast({ title: "Permissão removida!" });
            if (selectedUser) {
                const church = Array.isArray(selectedUser.church) ? selectedUser.church[0] : selectedUser.church;
                fetchUserPermissions(selectedUser.id, church.id);
            }
        } catch (error: any) {
            toast({
                title: "Erro ao remover",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const filteredUsers = users.filter(user =>
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center gap-3 mb-8">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold">Atribuir Permissões</h1>
                    <p className="text-muted-foreground">Gerenciar perfis de usuários - Dual RBAC</p>
                </div>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Buscar Usuário</CardTitle>
                    <CardDescription>Encontre um usuário para gerenciar suas permissões</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredUsers.map((user) => {
                    const church = Array.isArray(user.church) ? user.church[0] : user.church;
                    return (
                        <Card
                            key={user.id}
                            className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => handleUserClick(user)}
                        >
                            <CardHeader>
                                <CardTitle className="text-lg">{user.nome}</CardTitle>
                                <CardDescription>{user.email || "Sem email"}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="w-4 h-4" />
                                    <span>{church?.nome || "Igreja não definida"}</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {filteredUsers.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                    </CardContent>
                </Card>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Gerenciar Permissões</DialogTitle>
                        <DialogDescription>
                            Usuário: {selectedUser?.nome}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Permissões Atuais */}
                        <div>
                            <h3 className="font-semibold mb-3">Perfis Atribuídos</h3>
                            {userPermissions.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Nenhum perfil atribuído</p>
                            ) : (
                                <div className="space-y-2">
                                    {userPermissions.map((permission) => {
                                        const role = Array.isArray(permission.role) ? permission.role[0] : permission.role;
                                        return (
                                            <div
                                                key={permission.id}
                                                className="flex items-center justify-between p-3 border rounded-lg"
                                            >
                                                <div>
                                                    <p className="font-medium">{role.name}</p>
                                                    <p className="text-sm text-muted-foreground">Nível {role.level}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemovePermission(permission.id)}
                                                    className="text-destructive"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Atribuir Novo Perfil */}
                        <div>
                            <h3 className="font-semibold mb-3">Atribuir Novo Perfil</h3>
                            <div className="flex gap-2">
                                <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Selecione um perfil..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.id}>
                                                {role.name} (Nível {role.level})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleAssignRole} disabled={!selectedRoleId}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Atribuir
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
