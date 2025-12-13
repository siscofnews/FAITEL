import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { loadContatos, saveContato, deleteContato } from "@/wiring/contatos";
import { Bell, Edit, Mail, MessageCircle, Phone, Plus, Search, Trash2, Users, Clock } from "lucide-react";

export default function ContatosManager() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [contatos, setContatos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContato, setEditingContato] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    whatsapp: "",
    ativo: true,
    preferencia_notificacao: "ambos" as 'email' | 'whatsapp' | 'ambos',
    dias_antecedencia: 3,
    horario_lembrete: "09:00",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await loadContatos('-updated_at');
      setContatos(data);
    } catch (error: any) {
      toast({ title: "Erro ao carregar contatos", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredContatos = contatos.filter((c) => (
    c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.whatsapp?.includes(searchTerm)
  ));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingContato) await saveContato(formData as any, editingContato.id);
      else await saveContato(formData as any);
      setIsDialogOpen(false);
      setEditingContato(null);
      setFormData({ nome: "", email: "", whatsapp: "", ativo: true, preferencia_notificacao: "ambos", dias_antecedencia: 3, horario_lembrete: "09:00" });
      await loadData();
      toast({ title: "Contato salvo" });
    } catch (error: any) {
      toast({ title: "Erro ao salvar contato", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (contato: any) => {
    setEditingContato(contato);
    setFormData({
      nome: contato.nome,
      email: contato.email || "",
      whatsapp: contato.whatsapp || "",
      ativo: contato.ativo,
      preferencia_notificacao: contato.preferencia_notificacao || "ambos",
      dias_antecedencia: contato.dias_antecedencia || 3,
      horario_lembrete: (contato.horario_lembrete || "09:00").slice(0,5),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este contato?")) return;
    try {
      await deleteContato(id);
      await loadData();
      toast({ title: "Contato excluído" });
    } catch (error: any) {
      toast({ title: "Erro ao excluir contato", description: error.message, variant: "destructive" });
    }
  };

  const toggleAtivo = async (contato: any) => {
    try {
      await saveContato({ ...contato, ativo: !contato.ativo } as any, contato.id);
      await loadData();
    } catch (error: any) {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    }
  };

  const getPreferenceIcon = (preference: string) => {
    if (preference === 'email') return <Mail className="w-4 h-4" />;
    if (preference === 'whatsapp') return <MessageCircle className="w-4 h-4" />;
    return <Bell className="w-4 h-4" />;
  };

  const getPreferenceColor = (preference: string) => {
    if (preference === 'email') return 'bg-blue-100 text-blue-800';
    if (preference === 'whatsapp') return 'bg-green-100 text-green-800';
    if (preference === 'ambos') return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 p-6">
      <Card className="shadow-xl bg-white/90 backdrop-blur-sm border border-indigo-200">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-xl">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Users className="w-8 h-8" />
              Gerenciar Contatos para Lembretes
            </CardTitle>
            <Button onClick={() => { setEditingContato(null); setFormData({ nome: "", email: "", whatsapp: "", ativo: true, preferencia_notificacao: "ambos", dias_antecedencia: 3, horario_lembrete: "09:00" }); setIsDialogOpen(true); }} variant="ghost" className="text-white hover:bg-white/20">
              <Plus className="w-5 h-5 mr-2" />
              Novo Contato
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar contatos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContatos.map((contato) => (
              <Card key={contato.id} className={`border-2 ${contato.ativo ? 'border-green-200' : 'border-gray-200'}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-slate-800">{contato.nome}</h3>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(contato)} className="h-8 w-8 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(contato.id)} className="h-8 w-8 p-0 text-red-500 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {contato.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{contato.email}</span>
                      </div>
                    )}
                    {contato.whatsapp && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4" />
                        <span>{contato.whatsapp}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>{contato.dias_antecedencia} dias antes às {contato.horario_lembrete}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={`${getPreferenceColor(contato.preferencia_notificacao)} flex items-center gap-1`}>
                      {getPreferenceIcon(contato.preferencia_notificacao)}
                      {contato.preferencia_notificacao}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">Ativo</span>
                      <Switch checked={contato.ativo} onCheckedChange={() => toggleAtivo(contato)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredContatos.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold mb-2 text-slate-800">{searchTerm ? 'Nenhum contato encontrado' : 'Nenhum contato cadastrado'}</h3>
              <p className="text-slate-600 mb-6">{searchTerm ? 'Tente ajustar o termo de busca' : 'Adicione contatos para receber lembretes automáticos'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingContato ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" value={formData.nome} onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" placeholder="+5511999999999" value={formData.whatsapp} onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))} />
            </div>
            <div>
              <Label>Preferência de Notificação</Label>
              <Select value={formData.preferencia_notificacao} onValueChange={(value) => setFormData(prev => ({ ...prev, preferencia_notificacao: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Apenas Email</SelectItem>
                  <SelectItem value="whatsapp">Apenas WhatsApp</SelectItem>
                  <SelectItem value="ambos">Email e WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dias_antecedencia">Dias de Antecedência</Label>
                <Input id="dias_antecedencia" type="number" min="1" max="30" value={formData.dias_antecedencia} onChange={(e) => setFormData(prev => ({ ...prev, dias_antecedencia: parseInt(e.target.value) || 3 }))} />
              </div>
              <div>
                <Label htmlFor="horario_lembrete">Horário</Label>
                <Input id="horario_lembrete" type="time" value={formData.horario_lembrete} onChange={(e) => setFormData(prev => ({ ...prev, horario_lembrete: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="ativo" checked={formData.ativo} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))} />
              <Label htmlFor="ativo">Contato ativo</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">{editingContato ? 'Atualizar' : 'Salvar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

