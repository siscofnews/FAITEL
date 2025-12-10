import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2, UserCheck, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Member {
    id: string;
    full_name: string;
    email: string;
    telefone: string;
    cargo_eclesiastico: string;
    is_active: boolean;
    photo_url: string | null;
}

interface MembrosListProps {
    churchId: string;
    isAdmin: boolean;
}

export function MembrosList({ churchId, isAdmin }: MembrosListProps) {
    const { toast } = useToast();
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    useEffect(() => {
        if (churchId) {
            loadMembers();
        }
    }, [churchId, page, searchTerm, itemsPerPage]);

    const loadMembers = async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('members')
                .select('*', { count: 'exact' })
                .eq('church_id', churchId)
                .order('full_name');

            if (searchTerm) {
                query = query.ilike('full_name', `%${searchTerm}%`);
            }

            const from = (page - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;

            const { data, count, error } = await query.range(from, to);

            if (error) throw error;

            setMembers((data || []) as unknown as Member[]);
            if (count) {
                setTotalPages(Math.ceil(count / itemsPerPage));
            }
        } catch (error: any) {
            console.error("Erro ao carregar membros:", error);
            toast({
                title: "Erro ao carregar membros",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleStatus = async (member: Member) => {
        try {
            const { error } = await supabase
                .from('members')
                .update({ is_active: !member.is_active })
                .eq('id', member.id);

            if (error) throw error;

            setMembers(prev => prev.map(m =>
                m.id === member.id ? { ...m, is_active: !m.is_active } : m
            ));

            toast({
                title: "Status atualizado",
                description: `Membro ${!member.is_active ? 'ativado' : 'desativado'} com sucesso.`,
            });
        } catch (error: any) {
            console.error("Erro ao atualizar status:", error);
            toast({
                title: "Erro ao atualizar",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    // Debounce search effect is handled by the dependency array on loadMembers for simplicity, 
    // but typically we'd debounce the setPage call. 
    // Given the previous code, the dependency implementation is fine for now.

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-10 w-full bg-gray-100 animate-pulse rounded-md" />
                <div className="h-48 w-full bg-gray-50 animate-pulse rounded-md" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Input
                    placeholder="Pesquisar membro por nome..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(1); // Reset page on search
                    }}
                    className="max-w-sm"
                />

                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Itens por página:</span>
                    <select
                        className="h-9 w-[70px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setPage(1);
                        }}
                    >
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            </div>

            <div className="text-xs text-muted-foreground mb-2">
                Mostrando {members.length} registros. Página {page} de {totalPages || 1}.
            </div>

            {members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-gray-50 rounded-lg border border-dashed">
                    {searchTerm ? "Nenhum membro encontrado com este nome." : "Nenhum membro encontrado nesta igreja."}
                </div>
            ) : (
                <>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Membro</TableHead>
                                    <TableHead>Cargo</TableHead>
                                    <TableHead>Contato</TableHead>
                                    <TableHead>Status</TableHead>
                                    {isAdmin && <TableHead className="text-right">Ações</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={member.photo_url || ""} />
                                                <AvatarFallback>{member.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{member.full_name}</p>
                                                <p className="text-xs text-muted-foreground">{member.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{member.cargo_eclesiastico || 'Membro'}</Badge>
                                        </TableCell>
                                        <TableCell>{member.telefone || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={member.is_active ? "default" : "secondary"}>
                                                {member.is_active ? "Ativo" : "Pendente/Inativo"}
                                            </Badge>
                                        </TableCell>
                                        {isAdmin && (
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        title={member.is_active ? "Desativar" : "Ativar"}
                                                        onClick={() => toggleStatus(member)}
                                                    >
                                                        {member.is_active ? <UserX className="h-4 w-4 text-orange-500" /> : <UserCheck className="h-4 w-4 text-green-500" />}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between py-4">
                        <span className="text-sm text-muted-foreground">
                            Página {page} de {totalPages || 1}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Próxima
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
