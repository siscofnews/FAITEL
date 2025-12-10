import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { Calendar, Plus, Edit, Trash, Save, X, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface Schedule {
    id: string;
    tipo: string;
    titulo: string;
    data: string;
    horario: string | null;
    responsavel_id: string | null;
    equipe: string[] | null;
    observacoes: string | null;
    is_public: boolean;
    responsavel?: {
        full_name: string;
    };
}

interface Member {
    id: string;
    full_name: string;
}

const tipoOptions = [
    { value: 'louvor', label: '🎵 Louvor', color: 'bg-purple-100 text-purple-800' },
    { value: 'pregacao', label: '📖 Pregação', color: 'bg-blue-100 text-blue-800' },
    { value: 'diacono', label: '🙏 Diácono', color: 'bg-green-100 text-green-800' },
    { value: 'portaria', label: '🚪 Portaria', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'midia', label: '🎥 Mídia', color: 'bg-red-100 text-red-800' },
    { value: 'infantil', label: '👶 Infantil', color: 'bg-pink-100 text-pink-800' },
    { value: 'limpeza', label: '🧹 Limpeza', color: 'bg-teal-100 text-teal-800' },
    { value: 'som', label: '🔊 Som', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'outro', label: '📋 Outro', color: 'bg-gray-100 text-gray-800' },
];

export default function GerenciarEscalas() {
    const { toast } = useToast();
    const { churchId, isAdmin, isSuperAdmin } = usePermissions();

    const [escalas, setEscalas] = useState<Schedule[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        tipo: '',
        titulo: '',
        data: '',
        horario: '',
        responsavel_id: '',
        equipe: '',
        observacoes: '',
        is_public: true,
    });

    useEffect(() => {
        if (churchId) {
            loadEscalas();
            loadMembers();
        }
    }, [churchId]);

    const loadEscalas = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('service_schedules')
                .select(`
          *,
          responsavel:responsavel_id(full_name)
        `)
                .eq('church_id', churchId)
                .order('data', { ascending: false })
                .order('horario');

            if (error) throw error;
            setEscalas(data || []);
        } catch (error: any) {
            console.error("Error loading schedules:", error);
            toast({
                title: "Erro ao carregar escalas",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const loadMembers = async () => {
        try {
            const { data } = await supabase
                .from('members')
                .select('id, full_name')
                .eq('church_id', churchId)
                .eq('is_active', true)
                .order('full_name');

            if (data) {
                setMembers(data);
            }
        } catch (error) {
            console.error("Error loading members:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.tipo || !formData.titulo || !formData.data) {
            toast({
                title: "Campos obrigatórios",
                description: "Preencha tipo, título e data",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const equipeArray = formData.equipe
                ? formData.equipe.split(',').map(e => e.trim()).filter(Boolean)
                : null;

            const payload = {
                church_id: churchId,
                tipo: formData.tipo,
                titulo: formData.titulo,
                data: formData.data,
                horario: formData.horario || null,
                responsavel_id: formData.responsavel_id || null,
                equipe: equipeArray,
                observacoes: formData.observacoes || null,
                is_public: formData.is_public,
            };

            if (editingId) {
                const { error } = await supabase
                    .from('service_schedules')
                    .update(payload)
                    .eq('id', editingId);

                if (error) throw error;

                toast({
                    title: "✅ Escala atualizada!",
                    description: "A escala foi atualizada com sucesso",
                });
            } else {
                const { error } = await supabase
                    .from('service_schedules')
                    .insert(payload);

                if (error) throw error;

                toast({
                    title: "✅ Escala criada!",
                    description: "A escala foi criada com sucesso",
                });
            }

            handleCloseDialog();
            loadEscalas();
        } catch (error: any) {
            console.error("Error saving schedule:", error);
            toast({
                title: "Erro ao salvar",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (escala: Schedule) => {
        setEditingId(escala.id);
        setFormData({
            tipo: escala.tipo,
            titulo: escala.titulo,
            data: escala.data,
            horario: escala.horario || '',
            responsavel_id: escala.responsavel_id || '',
            equipe: escala.equipe ? escala.equipe.join(', ') : '',
            observacoes: escala.observacoes || '',
            is_public: escala.is_public,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta escala?')) return;

        try {
            const { error } = await supabase
                .from('service_schedules')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast({
                title: "Escala excluída",
                description: "A escala foi removida com sucesso",
            });

            loadEscalas();
        } catch (error: any) {
            toast({
                title: "Erro ao excluir",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingId(null);
        setFormData({
            tipo: '',
            titulo: '',
            data: '',
            horario: '',
            responsavel_id: '',
            equipe: '',
            observacoes: '',
            is_public: true,
        });
    };

    const getTipoStyle = (tipo: string) => {
        return tipoOptions.find(t => t.value === tipo)?.color || 'bg-gray-100';
    };

    if (!isAdmin && !isSuperAdmin) {
        return (
            <div className="container mx-auto py-8">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-800">⚠️ Apenas administradores podem gerenciar escalas.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold">Gerenciar Escalas</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Crie e gerencie as escalas de serviço da igreja
                    </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Escala
                </Button>
            </div>

            {/* Lista de Escalas */}
            {isLoading && escalas.length === 0 ? (
                <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                    <p className="mt-4">Carregando escalas...</p>
                </div>
            ) : escalas.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Nenhuma escala cadastrada</h3>
                        <p className="text-gray-500 mb-4">Comece criando sua primeira escala</p>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Primeira Escala
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {escalas.map((escala) => (
                        <Card key={escala.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-xl mb-2">{escala.titulo}</CardTitle>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {format(new Date(escala.data), 'dd/MM/yyyy')}
                                            </span>
                                            {escala.horario && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {escala.horario}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={getTipoStyle(escala.tipo)}>
                                            {tipoOptions.find(t => t.value === escala.tipo)?.label || escala.tipo}
                                        </Badge>
                                        {!escala.is_public && (
                                            <Badge variant="outline">🔒 Privado</Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {escala.responsavel && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">Responsável:</span>
                                        <span>{escala.responsavel.full_name}</span>
                                    </div>
                                )}

                                {escala.equipe && escala.equipe.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="h-4 w-4" />
                                            <span className="text-sm font-medium">Equipe:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {escala.equipe.map((pessoa, idx) => (
                                                <Badge key={idx} variant="secondary">
                                                    {pessoa}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {escala.observacoes && (
                                    <div className="pt-2 border-t">
                                        <p className="text-sm text-gray-600">{escala.observacoes}</p>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(escala)}>
                                        <Edit className="h-4 w-4 mr-1" />
                                        Editar
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(escala.id)}>
                                        <Trash className="h-4 w-4 mr-1" />
                                        Excluir
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Dialog de Criar/Editar */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? 'Editar Escala' : 'Nova Escala'}
                        </DialogTitle>
                        <DialogDescription>
                            Preencha os dados da escala de serviço
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Tipo */}
                            <div className="space-y-2">
                                <Label htmlFor="tipo">Tipo de Serviço *</Label>
                                <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tipoOptions.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Público/Privado */}
                            <div className="space-y-2">
                                <Label htmlFor="is_public">Visibilidade</Label>
                                <Select value={formData.is_public.toString()} onValueChange={(v) => setFormData({ ...formData, is_public: v === 'true' })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">🌐 Público</SelectItem>
                                        <SelectItem value="false">🔒 Privado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Título */}
                        <div className="space-y-2">
                            <Label htmlFor="titulo">Título *</Label>
                            <Input
                                id="titulo"
                                placeholder="Ex: Culto de Louvor e Adoração"
                                value={formData.titulo}
                                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Data */}
                            <div className="space-y-2">
                                <Label htmlFor="data">Data *</Label>
                                <Input
                                    id="data"
                                    type="date"
                                    value={formData.data}
                                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Horário */}
                            <div className="space-y-2">
                                <Label htmlFor="horario">Horário</Label>
                                <Input
                                    id="horario"
                                    type="time"
                                    value={formData.horario}
                                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Responsável */}
                        <div className="space-y-2">
                            <Label htmlFor="responsavel">Responsável</Label>
                            <Select value={formData.responsavel_id} onValueChange={(v) => setFormData({ ...formData, responsavel_id: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um membro" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Nenhum</SelectItem>
                                    {members.map(member => (
                                        <SelectItem key={member.id} value={member.id}>
                                            {member.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Equipe */}
                        <div className="space-y-2">
                            <Label htmlFor="equipe">Equipe</Label>
                            <Input
                                id="equipe"
                                placeholder="Separe nomes por vírgula: João, Maria, Pedro"
                                value={formData.equipe}
                                onChange={(e) => setFormData({ ...formData, equipe: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Digite os nomes separados por vírgula
                            </p>
                        </div>

                        {/* Observações */}
                        <div className="space-y-2">
                            <Label htmlFor="observacoes">Observações</Label>
                            <Textarea
                                id="observacoes"
                                placeholder="Informações adicionais..."
                                value={formData.observacoes}
                                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                <X className="h-4 w-4 mr-2" />
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>Salvando...</>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        {editingId ? 'Atualizar' : 'Criar'} Escala
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
