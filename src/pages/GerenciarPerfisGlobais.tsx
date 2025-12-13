import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, Edit, Trash2, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Modulos, Planos, PlanModules } from "@/entities/Assinaturas";

interface RoleGlobal {
    id: string;
    name: string;
    description: string;
    level: number;
    permissions: Record<string, any>;
    created_at: string;
}

export default function GerenciarPerfisGlobais() {
  const [roles, setRoles] = useState<RoleGlobal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<RoleGlobal | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [modules, setModules] = useState<{ key: string; name: string }[]>([]);
  const [plans, setPlans] = useState<{ id?: string; name: string }[]>([]);
  const [newModule, setNewModule] = useState<{ key: string; name: string }>({ key: "", name: "" });
  const [planModules, setPlanModules] = useState<Record<string, Set<string>>>({});

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        level: "3",
        permissions: "{}"
    });

  useEffect(() => {
        fetchRoles();
        fetchModulesAndPlans();
  }, []);

  const fetchRoles = async () => {
        try {
            const { data, error } = await supabase
                .from("role_global")
                .select("*")
                .order("level", { ascending: true });

            if (error) throw error;
            setRoles(data || []);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar perfis",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
  };

    const fetchModulesAndPlans = async () => {
        try {
            const [mods, pls] = await Promise.all([Modulos.list(), Planos.list()]);
            setModules(mods);
            setPlans(pls);
            // Load plan_modules per plan
            const entries = await Promise.all((pls || []).map(async (p) => {
                if (!p.id) return [p, new Set<string>()] as const;
                const links = await PlanModules.listByPlan(p.id);
                return [p, new Set(links.map(l => l.module_key))] as const;
            }));
            const map: Record<string, Set<string>> = {};
            entries.forEach(([p, set]) => { if (p.id) map[p.id] = set; });
            setPlanModules(map);
        } catch (error: any) {
            // Silent fail, keep page usable
        }
    };

    const togglePlanModule = async (planId: string, moduleKey: string, checked: boolean) => {
        if (!planId) return;
        try {
            if (checked) await PlanModules.add(planId, moduleKey);
            else await PlanModules.remove(planId, moduleKey);
            setPlanModules(prev => {
                const set = new Set(prev[planId] || []);
                if (checked) set.add(moduleKey); else set.delete(moduleKey);
                return { ...prev, [planId]: set };
            });
        } catch (error: any) {
            // Optionally show toast
        }
    };

    const handleSave = async () => {
        try {
            const permissions = JSON.parse(formData.permissions);

            if (editingRole) {
                // Update
                const { error } = await supabase
                    .from("role_global")
                    .update({
                        name: formData.name,
                        description: formData.description,
                        level: parseInt(formData.level),
                        permissions
                    })
                    .eq("id", editingRole.id);

                if (error) throw error;
                toast({ title: "Perfil atualizado com sucesso!" });
            } else {
                // Create
                const { error } = await supabase
                    .from("role_global")
                    .insert({
                        name: formData.name,
                        description: formData.description,
                        level: parseInt(formData.level),
                        permissions
                    });

                if (error) throw error;
                toast({ title: "Perfil criado com sucesso!" });
            }

            setIsDialogOpen(false);
            setEditingRole(null);
            setFormData({ name: "", description: "", level: "3", permissions: "{}" });
            fetchRoles();
        } catch (error: any) {
            toast({
                title: "Erro ao salvar perfil",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleEdit = (role: RoleGlobal) => {
        setEditingRole(role);
        setFormData({
            name: role.name,
            description: role.description || "",
            level: role.level.toString(),
            permissions: JSON.stringify(role.permissions, null, 2)
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este perfil?")) return;

        try {
            const { error } = await supabase
                .from("role_global")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast({ title: "Perfil excluído com sucesso!" });
            fetchRoles();
        } catch (error: any) {
            toast({
                title: "Erro ao excluir perfil",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const getLevelLabel = (level: number) => {
        if (level === 1) return "Global";
        if (level === 2.0) return "Matriz";
        if (level >= 2.1 && level < 3) return "Local";
        return "Operacional";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Carregando perfis...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">Gerenciar Perfis Globais</h1>
                        <p className="text-muted-foreground">Sistema de Dual RBAC - SISCOF 3.0</p>
                    </div>
                </div>
                <Button onClick={() => {
                    setEditingRole(null);
                    setFormData({ name: "", description: "", level: "3", permissions: "{}" });
                    setIsDialogOpen(true);
                }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Perfil
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {roles.map((role) => (
                    <Card key={role.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-xl">{role.name}</CardTitle>
                                    <CardDescription className="mt-1">
                                        Nível {role.level} - {getLevelLabel(role.level)}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(role)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(role.id)}
                                        className="text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                {role.description || "Sem descrição"}
                            </p>
                            <div className="text-xs text-muted-foreground">
                                <strong>Permissões:</strong>
                                <pre className="mt-2 bg-muted p-2 rounded text-xs overflow-x-auto">
                                    {JSON.stringify(role.permissions, null, 2)}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Módulos Globais */}
            <div className="mt-8 grid gap-4 md:grid-cols-2">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-xl">Módulos Globais</CardTitle>
                        <CardDescription>Lista de módulos disponíveis para planos e perfis</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {modules.length === 0 ? (
                            <p className="text-muted-foreground">Nenhum módulo cadastrado.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {modules.map((m) => (
                                    <Badge key={m.key} variant="outline" className="justify-start">{m.name} <span className="ml-2 text-xs text-muted-foreground">({m.key})</span></Badge>
                                ))}
                            </div>
                        )}

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div>
                                <Label>Chave *</Label>
                                <Input value={newModule.key} onChange={(e) => setNewModule({ ...newModule, key: e.target.value })} placeholder="ex: finance" />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Nome *</Label>
                                <Input value={newModule.name} onChange={(e) => setNewModule({ ...newModule, name: e.target.value })} placeholder="ex: Financeiro" />
                            </div>
                        </div>

                        <div className="mt-3">
                            <Button
                                variant="secondary"
                                onClick={async () => {
                                    if (!newModule.key || !newModule.name) { toast({ title: "Informe chave e nome" }); return; }
                                    try {
                                        await Modulos.upsert([{ key: newModule.key, name: newModule.name }]);
                                        setNewModule({ key: "", name: "" });
                                        fetchModulesAndPlans();
                                        toast({ title: "Módulo salvo" });
                                    } catch (error: any) {
                                        toast({ title: "Erro ao salvar módulo", description: error.message, variant: "destructive" });
                                    }
                                }}
                            >
                                Salvar Módulo
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-xl">Planos Disponíveis</CardTitle>
                        <CardDescription>Planos de assinatura do SISCOF</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {plans.length === 0 ? (
                            <p className="text-muted-foreground">Nenhum plano cadastrado.</p>
                        ) : (
                            <div className="space-y-4">
                                {plans.map((p) => (
                                    <fieldset key={p.id} className="border rounded-lg p-3">
                                        <legend className="px-2 text-sm font-semibold">{p.name}</legend>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {modules.map((m) => (
                                                <div key={`${p.id}-${m.key}`} className="flex items-center justify-between p-2 bg-muted rounded">
                                                    <span className="text-sm">{m.name}</span>
                                                    <Switch
                                                        checked={!!(p.id && planModules[p.id]?.has(m.key))}
                                                        onCheckedChange={(checked) => p.id && togglePlanModule(p.id, m.key, checked)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </fieldset>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingRole ? "Editar Perfil Global" : "Novo Perfil Global"}
                        </DialogTitle>
                        <DialogDescription>
                            Defina as permissões globais que servirão como TETO máximo para os administradores locais.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome do Perfil *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: PRIMEIRO TESOUREIRO"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descrição breve do perfil"
                                rows={2}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="level">Nível de Acesso *</Label>
                            <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Nível 1 - Global (Super Admin)</SelectItem>
                                    <SelectItem value="2">Nível 2.0 - Matriz (Super Pastor)</SelectItem>
                                    <SelectItem value="2.1">Nível 2.1 - Sede/Subsede</SelectItem>
                                    <SelectItem value="3">Nível 3 - Operacional</SelectItem>
                                    <SelectItem value="4">Nível 4 - Usuário Básico</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="permissions">Permissões (JSON) *</Label>
                            <Textarea
                                id="permissions"
                                value={formData.permissions}
                                onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
                                placeholder='{"modules": {"create": true, "read": true}}'
                                rows={10}
                                className="font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                                Exemplo: {"{"}
                                "members": {"{"}
                                "create": true, "read": true, "update": true, "delete": false
                                {"}"}
                                {"}"}
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
