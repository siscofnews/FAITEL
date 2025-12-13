import { useEffect, useState } from "react";
import { Assinaturas } from "@/entities/Assinaturas";
import { useAuth } from "@/contexts/AuthContext";
import { getUserScopeStates } from "@/wiring/accessScope";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function AssinaturasAdmin() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const states = user?.id ? await getUserScopeStates(user.id) : [];
      const data = await Assinaturas.listAll(states);
      setSubs(data || []);
    } catch (error: any) {
      toast({ title: 'Erro ao carregar assinaturas', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = subs.filter((s) => {
    const okStatus = statusFilter === 'all' || s.status === statusFilter;
    const term = search.toLowerCase();
    const okSearch = !term || (s.church?.nome_fantasia || '').toLowerCase().includes(term);
    return okStatus && okSearch;
  });

  const setPaidToday = async (id: string) => {
    try {
      const todayISO = new Date().toISOString().split('T')[0];
      await Assinaturas.setPayment(id, todayISO);
      toast({ title: 'Pagamento registrado' });
      await load();
    } catch (error: any) {
      toast({ title: 'Erro ao registrar pagamento', description: error.message, variant: 'destructive' });
    }
  };

  const block = async (id: string) => {
    try {
      await Assinaturas.block(id);
      toast({ title: 'Assinatura bloqueada' });
      await load();
    } catch (error: any) {
      toast({ title: 'Erro ao bloquear', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Assinaturas</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Buscar igreja" value={search} onChange={(e) => setSearch(e.target.value)} className="w-52" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="blocked">Bloqueados</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={load} disabled={loading}>{loading ? 'Atualizando...' : 'Atualizar'}</Button>
        </div>
      </div>

      {loading ? (
        <Card><CardContent className="p-6">Carregando...</CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-6">Nenhuma assinatura encontrada.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Card key={s.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{s.church?.nome_fantasia || 'Igreja'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={s.status === 'active' ? 'bg-green-600' : s.status === 'blocked' ? 'bg-red-600' : 'bg-yellow-500'}>{s.status.toUpperCase()}</Badge>
                  {s.last_payment_at && (
                    <span className="text-sm text-muted-foreground">Último: {new Date(s.last_payment_at).toLocaleDateString('pt-BR')}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPaidToday(s.id)}>Marcar pago hoje</Button>
                  <Button variant="destructive" size="sm" onClick={() => block(s.id)}>Bloquear</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

