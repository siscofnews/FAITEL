import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Filter, Eye, History, ShieldAlert } from "lucide-react";
import { AuditService, AuditAction, AuditEntity } from "@/services/AuditService";

export default function AuditLogsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [entityFilter, setEntityFilter] = useState<string>("all");
    const [actionFilter, setActionFilter] = useState<string>("all");
    const [selectedLog, setSelectedLog] = useState<any>(null);

    const { data: logs, isLoading } = useQuery({
        queryKey: ["audit-logs", entityFilter, actionFilter],
        queryFn: async () => {
            // In a real app we might paginate in DB. For now, fetch latest 100.
            let query = supabase
                .from("system_logs" as any)
                .select(`
                    id, created_at, action, entity, entity_id, details, ip_address,
                    user:user_id(email),
                    church:church_id(nome_fantasia)
                `)
                .order("created_at", { ascending: false })
                .limit(100);

            if (entityFilter !== "all") query = query.eq("entity", entityFilter);
            if (actionFilter !== "all") query = query.eq("action", actionFilter);

            const { data, error } = await query;
            if (error) throw error;
            return data;
        }
    });

    const filteredLogs = logs?.filter(log => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            log.action.toLowerCase().includes(searchLower) ||
            log.user?.email?.toLowerCase().includes(searchLower) ||
            JSON.stringify(log.details).toLowerCase().includes(searchLower)
        );
    });

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'CREATE': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Criação</Badge>;
            case 'UPDATE': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Edição</Badge>;
            case 'DELETE': return <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">Exclusão</Badge>;
            case 'GRANT_PERMISSION': return <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">Permissão</Badge>;
            default: return <Badge variant="secondary">{action}</Badge>;
        }
    };

    return (
        <MainLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
                        <History className="h-8 w-8 text-primary" />
                        Auditoria do Sistema
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Rastreio de ações, segurança e modificações.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar nos logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={entityFilter} onValueChange={setEntityFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Entidade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas Entidades</SelectItem>
                                <SelectItem value="MEMBER">Membros</SelectItem>
                                <SelectItem value="SCHEDULE">Escalas</SelectItem>
                                <SelectItem value="FINANCIAL">Financeiro</SelectItem>
                                <SelectItem value="USER">Usuários</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Ação" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas Ações</SelectItem>
                                <SelectItem value="CREATE">Criação</SelectItem>
                                <SelectItem value="UPDATE">Edição</SelectItem>
                                <SelectItem value="DELETE">Exclusão</SelectItem>
                                <SelectItem value="GRANT_PERMISSION">Permissões</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data/Hora</TableHead>
                                <TableHead>Usuário</TableHead>
                                <TableHead>Ação</TableHead>
                                <TableHead>Entidade</TableHead>
                                <TableHead className="hidden md:table-cell">Igreja</TableHead>
                                <TableHead className="text-right">Detalhes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Carregando logs...
                                    </TableCell>
                                </TableRow>
                            ) : filteredLogs?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Nenhum registro encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLogs?.map((log: any) => (
                                    <TableRow key={log.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedLog(log)}>
                                        <TableCell className="font-medium">
                                            {format(new Date(log.created_at), "dd/MM HH:mm", { locale: ptBR })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{log.user?.email || "Sistema"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getActionBadge(log.action)}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{log.entity}</Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                            {log.church?.nome_fantasia || "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-primary" />
                            Detalhes do Log
                        </DialogTitle>
                        <DialogDescription>
                            ID: {selectedLog?.id}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block">Data:</span>
                                    <span className="font-medium">{format(new Date(selectedLog.created_at), "dd/MM/yyyy HH:mm:ss")}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Usuário:</span>
                                    <span className="font-medium">{selectedLog.user?.email}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Ação:</span>
                                    <span>{selectedLog.action} em {selectedLog.entity}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Igreja Contexto:</span>
                                    <span>{selectedLog.church?.nome_fantasia || "Global"}</span>
                                </div>
                            </div>

                            <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-xs overflow-auto max-h-[300px]">
                                <pre>{JSON.stringify(selectedLog.details, null, 2)}</pre>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}
