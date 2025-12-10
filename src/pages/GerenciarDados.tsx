import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Edit } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Church {
    id: string;
    nome_fantasia: string;
    razao_social?: string;
    cnpj?: string;
    nivel: string;
    status_licenca: string;
    is_active: boolean;
    endereco?: string;
    cidade?: string;
    estado?: string;
    telefone?: string;
    email?: string;
    created_at: string;
}

interface Member {
    id: string;
    full_name: string;
    email: string;
    telefone: string;
    church_id: string;
    is_active: boolean;
    cargo_eclesiastico?: string;
    church?: { nome_fantasia: string };
}

interface Cell {
    id: string;
    nome: string;
    tipo_celula: string;
    church_id: string;
    is_active: boolean;
    dia_reuniao?: string;
    horario_reuniao?: string;
    church?: { nome_fantasia: string };
}

interface Schedule {
    id: string;
    titulo: string;
    tipo: string;
    data: string;
    church_id: string;
    church?: { nome_fantasia: string };
}

export default function GerenciarDados() {
    const { toast } = useToast();

    const [churches, setChurches] = useState<Church[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [cells, setCells] = useState<Cell[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);

    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        type: string;
        id: string;
        name: string;
    }>({ open: false, type: '', id: '', name: '' });

    const [editDialog, setEditDialog] = useState<{
        open: boolean;
        type: string;
        data: any;
    }>({ open: false, type: '', data: null });

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        await Promise.all([
            loadChurches(),
            loadMembers(),
            loadCells(),
            loadSchedules(),
        ]);
    };

    const loadChurches = async () => {
        const { data } = await supabase
            .from('churches')
            .select('*')
            .order('created_at', { ascending: false });

        setChurches(data || []);
    };

    const loadMembers = async () => {
        const { data } = await supabase
            .from('members')
            .select('*, church:churches(nome_fantasia)')
            .order('created_at', { ascending: false });

        setMembers(data || []);
    };

    const loadCells = async () => {
        const { data } = await supabase
            .from('cells')
            .select('*, church:churches(nome_fantasia)')
            .order('created_at', { ascending: false });

        setCells(data || []);
    };

    const loadSchedules = async () => {
        const { data } = await supabase
            .from('service_schedules')
            .select('*, church:churches(nome_fantasia)')
            .order('data', { ascending: false });

        setSchedules(data || []);
    };

    const openEditDialog = (type: string, data: any) => {
        setEditDialog({ open: true, type, data: { ...data } });
    };

    const handleSaveEdit = async () => {
        const { type, data } = editDialog;

        try {
            let error;

            switch (type) {
                case 'church':
                    ({ error } = await supabase
                        .from('churches')
                        .update({
                            nome_fantasia: data.nome_fantasia,
                            status_licenca: data.status_licenca,
                            is_active: data.is_active,
                        })
                        .eq('id', data.id));
                    break;

                case 'member':
                    ({ error } = await supabase
                        .from('members')
                        .update({
                            full_name: data.full_name,
                            email: data.email,
                            telefone: data.telefone,
                            is_active: data.is_active,
                        })
                        .eq('id', data.id));
                    break;

                case 'cell':
                    ({ error } = await supabase
                        .from('cells')
                        .update({
                            nome: data.nome,
                            is_active: data.is_active,
                        })
                        .eq('id', data.id));
                    break;
            }

            if (error) throw error;

            toast({
                title: "✅ Atualizado!",
                description: "Dados salvos com sucesso",
            });

            setEditDialog({ open: false, type: '', data: null });
            loadAllData();
        } catch (error: any) {
            toast({
                title: "Erro ao salvar",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleDelete = async () => {
        const { type, id } = deleteDialog;

        try {
            let error;

            switch (type) {
                case 'church':
                    ({ error } = await supabase.from('churches').delete().eq('id', id));
                    break;
                case 'member':
                    ({ error } = await supabase.from('members').delete().eq('id', id));
                    break;
                case 'cell':
                    ({ error } = await supabase.from('cells').delete().eq('id', id));
                    break;
                case 'schedule':
                    ({ error } = await supabase.from('service_schedules').delete().eq('id', id));
                    break;
            }

            if (error) throw error;

            toast({
                title: "✅ Excluído!",
                description: "Registro removido com sucesso",
            });

            loadAllData();
        } catch (error: any) {
            toast({
                title: "Erro ao excluir",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setDeleteDialog({ open: false, type: '', id: '', name: '' });
        }
    };

    const openDeleteDialog = (type: string, id: string, name: string) => {
        setDeleteDialog({ open: true, type, id, name });
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">🔧 Gerenciar Dados do Sistema</h1>
                <p className="text-muted-foreground">
                    Como Super Admin, você pode editar ou excluir qualquer registro aqui
                </p>
            </div>

            <Tabs defaultValue="churches" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="churches">
                        🏛️ Igrejas ({churches.length})
                    </TabsTrigger>
                    <TabsTrigger value="members">
                        👥 Membros ({members.length})
                    </TabsTrigger>
                    <TabsTrigger value="cells">
                        📱 Células ({cells.length})
                    </TabsTrigger>
                    <TabsTrigger value="schedules">
                        📅 Escalas ({schedules.length})
                    </TabsTrigger>
                </TabsList>

                {/* TAB: IGREJAS */}
                <TabsContent value="churches">
                    <Card>
                        <CardHeader>
                            <CardTitle>Igrejas Cadastradas</CardTitle>
                            <CardDescription>
                                Aqui você vê todas as igrejas. Clique em Editar ou Excluir.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Nível</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Ativa</TableHead>
                                        <TableHead>Data Criação</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {churches.map((church) => (
                                        <TableRow key={church.id}>
                                            <TableCell className="font-medium">
                                                {church.nome_fantasia}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{church.nivel}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={church.status_licenca === 'ATIVO' ? 'default' : 'secondary'}>
                                                    {church.status_licenca}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {church.is_active ? '✅' : '❌'}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(church.created_at).toLocaleDateString('pt-BR')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog('church', church)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" /> Editar
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => openDeleteDialog('church', church.id, church.nome_fantasia)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" /> Excluir
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {churches.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    Nenhuma igreja cadastrada
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB: MEMBROS */}
                <TabsContent value="members">
                    <Card>
                        <CardHeader>
                            <CardTitle>Membros Cadastrados</CardTitle>
                            <CardDescription>
                                Gerencie os membros do sistema - edite ou exclua
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Telefone</TableHead>
                                        <TableHead>Igreja</TableHead>
                                        <TableHead>Ativo</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {members.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell className="font-medium">
                                                {member.full_name}
                                            </TableCell>
                                            <TableCell>{member.email}</TableCell>
                                            <TableCell>{member.telefone || '-'}</TableCell>
                                            <TableCell>{member.church?.nome_fantasia || '-'}</TableCell>
                                            <TableCell>
                                                {member.is_active ? '✅' : '❌'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog('member', member)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" /> Editar
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => openDeleteDialog('member', member.id, member.full_name)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" /> Excluir
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {members.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    Nenhum membro cadastrado
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB: CÉLULAS */}
                <TabsContent value="cells">
                    <Card>
                        <CardHeader>
                            <CardTitle>Células Cadastradas</CardTitle>
                            <CardDescription>
                                Gerencie as células do sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Igreja</TableHead>
                                        <TableHead>Ativa</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cells.map((cell) => (
                                        <TableRow key={cell.id}>
                                            <TableCell className="font-medium">
                                                {cell.nome}
                                            </TableCell>
                                            <TableCell>
                                                <Badge>{cell.tipo_celula}</Badge>
                                            </TableCell>
                                            <TableCell>{cell.church?.nome_fantasia || '-'}</TableCell>
                                            <TableCell>
                                                {cell.is_active ? '✅' : '❌'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog('cell', cell)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" /> Editar
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => openDeleteDialog('cell', cell.id, cell.nome)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" /> Excluir
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {cells.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    Nenhuma célula cadastrada
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB: ESCALAS */}
                <TabsContent value="schedules">
                    <Card>
                        <CardHeader>
                            <CardTitle>Escalas Cadastradas</CardTitle>
                            <CardDescription>
                                Gerencie as escalas de serviço
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Igreja</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {schedules.map((schedule) => (
                                        <TableRow key={schedule.id}>
                                            <TableCell className="font-medium">
                                                {schedule.titulo}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{schedule.tipo}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(schedule.data).toLocaleDateString('pt-BR')}
                                            </TableCell>
                                            <TableCell>{schedule.church?.nome_fantasia || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => openDeleteDialog('schedule', schedule.id, schedule.titulo)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" /> Excluir
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {schedules.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    Nenhuma escala cadastrada
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Dialog de Edição */}
            <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>✏️ Editar {editDialog.type === 'church' ? 'Igreja' : editDialog.type === 'member' ? 'Membro' : 'Célula'}</DialogTitle>
                        <DialogDescription>
                            Altere os dados abaixo e salve
                        </DialogDescription>
                    </DialogHeader>

                    {editDialog.data && editDialog.type === 'church' && (
                        <div className="space-y-4">
                            <div>
                                <Label>Nome da Igreja</Label>
                                <Input
                                    value={editDialog.data.nome_fantasia || ''}
                                    onChange={(e) => setEditDialog({
                                        ...editDialog,
                                        data: { ...editDialog.data, nome_fantasia: e.target.value }
                                    })}
                                />
                            </div>
                            <div>
                                <Label>Status Licença</Label>
                                <Select
                                    value={editDialog.data.status_licenca}
                                    onValueChange={(v) => setEditDialog({
                                        ...editDialog,
                                        data: { ...editDialog.data, status_licenca: v }
                                    })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ATIVO">ATIVO</SelectItem>
                                        <SelectItem value="VENCIDO">VENCIDO</SelectItem>
                                        <SelectItem value="BLOQUEADO">BLOQUEADO</SelectItem>
                                        <SelectItem value="PENDENTE_DE_VALIDACAO">PENDENTE</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={editDialog.data.is_active}
                                    onChange={(e) => setEditDialog({
                                        ...editDialog,
                                        data: { ...editDialog.data, is_active: e.target.checked }
                                    })}
                                />
                                <Label>Igreja Ativa</Label>
                            </div>
                        </div>
                    )}

                    {editDialog.data && editDialog.type === 'member' && (
                        <div className="space-y-4">
                            <div>
                                <Label>Nome Completo</Label>
                                <Input
                                    value={editDialog.data.full_name || ''}
                                    onChange={(e) => setEditDialog({
                                        ...editDialog,
                                        data: { ...editDialog.data, full_name: e.target.value }
                                    })}
                                />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={editDialog.data.email || ''}
                                    onChange={(e) => setEditDialog({
                                        ...editDialog,
                                        data: { ...editDialog.data, email: e.target.value }
                                    })}
                                />
                            </div>
                            <div>
                                <Label>Telefone</Label>
                                <Input
                                    value={editDialog.data.telefone || ''}
                                    onChange={(e) => setEditDialog({
                                        ...editDialog,
                                        data: { ...editDialog.data, telefone: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={editDialog.data.is_active}
                                    onChange={(e) => setEditDialog({
                                        ...editDialog,
                                        data: { ...editDialog.data, is_active: e.target.checked }
                                    })}
                                />
                                <Label>Membro Ativo</Label>
                            </div>
                        </div>
                    )}

                    {editDialog.data && editDialog.type === 'cell' && (
                        <div className="space-y-4">
                            <div>
                                <Label>Nome da Célula</Label>
                                <Input
                                    value={editDialog.data.nome || ''}
                                    onChange={(e) => setEditDialog({
                                        ...editDialog,
                                        data: { ...editDialog.data, nome: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={editDialog.data.is_active}
                                    onChange={(e) => setEditDialog({
                                        ...editDialog,
                                        data: { ...editDialog.data, is_active: e.target.checked }
                                    })}
                                />
                                <Label>Célula Ativa</Label>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialog({ open: false, type: '', data: null })}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveEdit}>
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de Confirmação de Exclusão */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>⚠️ Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir <strong>{deleteDialog.name}</strong>?
                            <br />
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Exclu ir Permanentemente
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
