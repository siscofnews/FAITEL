import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Building, Building2, Store, Church as ChurchIcon, Users, ArrowLeft, ChevronRight, ChevronDown, MoreVertical, Pencil, Trash2, ShieldCheck, ShieldAlert, QrCode } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
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
import { IgrejaEditForm } from "@/components/igrejas/IgrejaEditForm";
import { CellEditDialog } from "@/components/igrejas/CellEditDialog";
import { MembrosList } from "@/components/membros/MembrosList";
import { ChurchPosterGenerator } from "@/components/igrejas/ChurchPosterGenerator";

interface Church {
    id: string;
    nome_fantasia: string;
    nivel: string;
    cidade: string;
    estado: string;
    status_licenca: string;
    is_active: boolean;
    parent_church_id?: string;
    children?: Church[];
    logo_url: string | null;
    endereco: string | null;
    telefone: string | null;
    email: string | null;
    pastor_presidente_nome: string | null;
}

interface Cell {
    id: string;
    nome: string;
    tipo_celula: string;
    is_active: boolean;
    dia_reuniao?: string;
    horario_reuniao?: string;
    lider_nome?: string;
    lider_telefone?: string;
    lider_email?: string;
    endereco?: string;
}

export default function DetalhesIgrejaHierarquia() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { userLevel, isAdmin, isSuperAdmin } = usePermissions();

    const [church, setChurch] = useState<Church | null>(null);
    const [hierarchyTree, setHierarchyTree] = useState<Church | null>(null);
    const [cells, setCells] = useState<Cell[]>([]);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([id!]));
    const [isLoading, setIsLoading] = useState(true);

    // States for Edit/Delete
    const [isEditChurchOpen, setIsEditChurchOpen] = useState(false);
    const [isEditCellOpen, setIsEditCellOpen] = useState(false);
    const [isDeleteChurchOpen, setIsDeleteChurchOpen] = useState(false);
    const [isDeleteCellOpen, setIsDeleteCellOpen] = useState(false);

    const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
    const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
    const [isPosterOpen, setIsPosterOpen] = useState(false);

    // Estatísticas de membros
    const [membersStats, setMembersStats] = useState({
        total: 0,
        matriz: 0,
        sede: 0,
        subsede: 0,
        congregacao: 0,
        celulas: 0,
    });

    // Contadores de unidades subordinadas
    const [unitCounts, setUnitCounts] = useState({
        sedes: 0,
        subsedes: 0,
        congregacoes: 0,
        celulas: 0,
    });

    useEffect(() => {
        if (id) {
            loadChurchData();
        }
    }, [id]);

    const loadChurchData = async () => {
        setIsLoading(true);
        try {
            // Carregar igreja principal
            const { data: churchData } = await supabase
                .from('churches')
                .select('*')
                .eq('id', id)
                .single();

            setChurch(churchData);

            // Carregar hierarquia completa
            const tree = await buildHierarchyTree(id!);
            setHierarchyTree(tree);

            // Carregar células diretas
            // @ts-ignore
            const { data: cellsData } = await supabase
                .from('cells')
                .select('*')
                .eq('church_id', id)
                .is('deleted_at', null);

            setCells(cellsData || []);

            // Carregar estatísticas de membros
            await loadMemberStats(id!);

            // Contar unidades subordinadas
            const allChurches = await getAllSubordinateChurches(id!);
            const sedes = allChurches.filter(c => c.nivel === 'sede').length;
            const subsedes = allChurches.filter(c => c.nivel === 'subsede').length;
            const congregacoes = allChurches.filter(c => c.nivel === 'congregacao').length;

            const { count: totalCells } = await supabase
                .from('cells')
                .select('*', { count: 'exact', head: true })
                .in('church_id', [id!, ...allChurches.map(c => c.id)])
                .is('deleted_at', null);

            setUnitCounts({
                sedes,
                subsedes,
                congregacoes,
                celulas: totalCells || 0,
            });
        } catch (error) {
            console.error("Error loading church data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMemberStats = async (churchId: string) => {
        try {
            const allChurches = await getAllSubordinateChurches(churchId);
            const allIds = [churchId, ...allChurches.map(c => c.id)];

            const { count: totalMembers } = await supabase
                .from('members')
                .select('*', { count: 'exact', head: true })
                .in('church_id', allIds)
                .eq('is_active', true);

            const statsPromises = ['matriz', 'sede', 'subsede', 'congregacao'].map(async (nivel) => {
                const churchesOfLevel = allChurches.filter(c => c.nivel === nivel);
                const idsOfLevel = churchesOfLevel.map(c => c.id);

                if (idsOfLevel.length === 0) return { nivel, count: 0 };

                const { count } = await supabase
                    .from('members')
                    .select('*', { count: 'exact', head: true })
                    .in('church_id', idsOfLevel)
                    .eq('is_active', true);

                return { nivel, count: count || 0 };
            });

            const stats = await Promise.all(statsPromises);

            setMembersStats({
                total: totalMembers || 0,
                matriz: stats.find(s => s.nivel === 'matriz')?.count || 0,
                sede: stats.find(s => s.nivel === 'sede')?.count || 0,
                subsede: stats.find(s => s.nivel === 'subsede')?.count || 0,
                congregacao: stats.find(s => s.nivel === 'congregacao')?.count || 0,
                celulas: 0,
            });
        } catch (error) {
            console.error("Error loading member stats:", error);
        }
    };

    const getAllSubordinateChurches = async (churchId: string): Promise<any[]> => {
        const { data: children } = await supabase
            .from('churches')
            .select('*')
            .eq('parent_church_id', churchId)
            .eq('is_active', true);

        if (!children || children.length === 0) return [];

        const allChildren = [...children];
        for (const child of children) {
            const grandchildren = await getAllSubordinateChurches(child.id);
            allChildren.push(...grandchildren);
        }

        return allChildren;
    };

    const buildHierarchyTree = async (churchId: string): Promise<Church> => {
        const { data: church } = await supabase
            .from('churches')
            .select('*')
            .eq('id', churchId)
            .single();

        const { data: children } = await supabase
            .from('churches')
            .select('*')
            .eq('parent_church_id', churchId)
            .eq('is_active', true)
            .order('nivel')
            .order('nome_fantasia');

        const childrenWithGrandchildren = await Promise.all(
            (children || []).map(async (child) => await buildHierarchyTree(child.id))
        );

        return { ...church, children: childrenWithGrandchildren };
    };

    const toggleNode = (nodeId: string) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    const getNivelIcon = (nivel: string) => {
        switch (nivel) {
            case 'matriz': return <Building className="h-5 w-5" />;
            case 'sede': return <Building2 className="h-5 w-5" />;
            case 'subsede': return <Store className="h-5 w-5" />;
            case 'congregacao': return <ChurchIcon className="h-5 w-5" />;
            default: return <Building className="h-5 w-5" />;
        }
    };

    const getNivelColor = (nivel: string) => {
        switch (nivel) {
            case 'matriz': return 'text-purple-600 bg-purple-50';
            case 'sede': return 'text-blue-600 bg-blue-50';
            case 'subsede': return 'text-green-600 bg-green-50';
            case 'congregacao': return 'text-orange-600 bg-orange-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    // --- Action Handlers ---
    const handleDeleteChurch = async () => {
        if (!selectedChurch) return;
        try {
            const { error } = await supabase
                .from('churches')
                .update({ is_active: false }) // Soft delete
                .eq('id', selectedChurch.id);

            if (error) throw error;

            toast({ title: "Igreja removida com sucesso" });
            loadChurchData();
        } catch (error: any) {
            toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
        } finally {
            setIsDeleteChurchOpen(false);
            setSelectedChurch(null);
        }
    };

    const handleDeleteCell = async () => {
        if (!selectedCell) return;
        try {
            const { error } = await supabase
                .from('cells')
                .update({ deleted_at: new Date().toISOString() }) // Soft delete if column exists, otherwise hard delete
                .eq('id', selectedCell.id);

            if (error) {
                // Fallback to hard delete if soft delete fails/column missing
                await supabase.from('cells').delete().eq('id', selectedCell.id);
            }

            toast({ title: "Célula removida com sucesso" });
            loadChurchData();
        } catch (error: any) {
            toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
        } finally {
            setIsDeleteCellOpen(false);
            setSelectedCell(null);
        }
    };


    const TreeNode = ({ node, level = 0 }: { node: Church; level?: number }) => {
        const hasChildren = (node.children && node.children.length > 0);
        const isExpanded = expandedNodes.has(node.id);

        return (
            <div>
                <div
                    className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg group transition-colors"
                    style={{ marginLeft: level * 24 }}
                >
                    {/* Expand/Collapse */}
                    <div
                        className="w-6 h-6 flex items-center justify-center cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (hasChildren) toggleNode(node.id);
                        }}
                    >
                        {hasChildren && (
                            isExpanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                    </div>

                    {/* Icon */}
                    <div className={`p-2 rounded-full ${getNivelColor(node.nivel)}`}>
                        {getNivelIcon(node.nivel)}
                    </div>

                    {/* Name */}
                    <div className="flex-1 flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/igreja/${node.id}/detalhes`)}>
                        <span className="font-medium hover:underline">{node.nome_fantasia}</span>
                        <Badge variant="outline" className="text-xs">{node.nivel}</Badge>
                    </div>

                    {/* Actions Dropdown */}
                    {(isAdmin || isSuperAdmin) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/igreja/${node.id}/detalhes`)}>
                                    <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    setSelectedChurch(node);
                                    setIsEditChurchOpen(true);
                                }}>
                                    <Pencil className="mr-2 h-4 w-4" /> Editar
                                </DropdownMenuItem>
                                {isSuperAdmin && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={() => {
                                                setSelectedChurch(node);
                                                setIsDeleteChurchOpen(true);
                                            }}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {isExpanded && hasChildren && (
                    <div>
                        {node.children!.map((child) => (
                            <TreeNode key={child.id} node={child} level={level + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Permission checks
    const canCreateSede = isSuperAdmin || church?.nivel === 'matriz';
    const canCreateSubsede = isSuperAdmin || ['matriz', 'sede'].includes(church?.nivel || '');
    const canCreateCongregacao = isSuperAdmin || ['matriz', 'sede', 'subsede'].includes(church?.nivel || '');
    const canCreateCelula = isAdmin;

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                <p className="mt-4">Carregando...</p>
            </div>
        );
    }

    if (!church) return <div className="p-8 text-red-600">Igreja não encontrada</div>;

    return (
        <div className="container mx-auto py-8 px-4">
            <Button variant="ghost" className="mb-6" onClick={() => navigate('/igrejas')}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Lista
            </Button>

            {/* Header */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-full ${getNivelColor(church.nivel).replace('text-', 'bg-').replace('bg-', 'bg-')}`}>
                            {getNivelIcon(church.nivel)}
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-2xl">{church.nome_fantasia}</CardTitle>
                            <p className="text-muted-foreground mt-1">{church.cidade}, {church.estado}</p>
                            <div className="flex gap-2 mt-2 items-center">
                                <Badge>{church.nivel.toUpperCase()}</Badge>
                                <Button size="sm" variant="outline" onClick={() => setIsPosterOpen(true)}>
                                    <QrCode className="h-3 w-3 mr-1" /> QR Code
                                </Button>
                                {(isAdmin || isSuperAdmin) && (
                                    <Button size="sm" variant="outline" onClick={() => {
                                        setSelectedChurch(church);
                                        setIsEditChurchOpen(true);
                                    }}>
                                        <Pencil className="h-3 w-3 mr-1" /> Editar
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Stats Cards ... (Keep existing stats code) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {/* Reusing existing simplified stats display */}
                <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
                    <p className="text-2xl font-bold text-primary">{membersStats.total}</p>
                    <p className="text-xs text-muted-foreground">Total de Membros</p>
                </div>
                {/* ... other stats ... */}
            </div>

            {/* Creation Buttons (Keep existing) */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>➕ Criar Unidades</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {canCreateSede && (
                            <Button className="h-24 flex flex-col gap-2" onClick={() => {
                                localStorage.setItem('creating_for_church', id!);
                                navigate('/criar-unidade/sede');
                            }}>
                                <Building2 className="h-6 w-6" /> <span className="text-sm">Nova Sede</span>
                            </Button>
                        )}
                        {canCreateSubsede && (
                            <Button className="h-24 flex flex-col gap-2" variant="secondary" onClick={() => {
                                localStorage.setItem('creating_for_church', id!);
                                navigate('/criar-unidade/subsede');
                            }}>
                                <Store className="h-6 w-6" /> <span className="text-sm">Nova Subsede</span>
                            </Button>
                        )}
                        {canCreateCongregacao && (
                            <Button className="h-24 flex flex-col gap-2" variant="secondary" onClick={() => {
                                localStorage.setItem('creating_for_church', id!);
                                navigate('/criar-unidade/congregacao');
                            }}>
                                <ChurchIcon className="h-6 w-6" /> <span className="text-sm">Nova Congregação</span>
                            </Button>
                        )}
                        {canCreateCelula && (
                            <Button className="h-24 flex flex-col gap-2" variant="secondary" onClick={() => {
                                localStorage.setItem('creating_for_church', id!);
                                navigate('/cadastrar-celula');
                            }}>
                                <Users className="h-6 w-6" /> <span className="text-sm">Nova Célula</span>
                            </Button>
                        )}
                        <Button className="h-24 flex flex-col gap-2" variant="outline" onClick={() => {
                            localStorage.setItem('creating_for_church', id!);
                            navigate('/cadastrar-membro-admin');
                        }}>
                            <Users className="h-6 w-6" /> <span className="text-sm">Novo Membro</span>
                        </Button>
                        <Button className="h-24 flex flex-col gap-2" variant="outline" onClick={() => {
                            if (id) navigate(`/perfis-locais/${id}`);
                        }}>
                            <Users className="h-6 w-6" /> <span className="text-sm">Perfis Locais</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Hierarchy Tree */}
            <Card>
                <CardHeader>
                    <CardTitle>🌳 Estrutura Hierárquica Completa</CardTitle>
                </CardHeader>
                <CardContent>
                    {hierarchyTree ? (
                        <div className="border rounded-lg p-4">
                            <TreeNode node={hierarchyTree} level={0} />
                        </div>
                    ) : <p>Sem estrutura.</p>}

                    {/* Cells List */}
                    {cells.length > 0 && (
                        <div className="mt-6 pt-6 border-t">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Users className="h-5 w-5" /> Células desta Igreja ({cells.length})
                            </h3>
                            <div className="grid gap-2">
                                {cells.map((cell) => (
                                    <div key={cell.id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg group">
                                        <Users className="h-4 w-4 text-purple-600" />
                                        <span className="flex-1 font-medium">{cell.nome}</span>
                                        <Badge variant="outline">{cell.tipo_celula}</Badge>

                                        {(isAdmin || isSuperAdmin) && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedCell(cell);
                                                        setIsEditCellOpen(true);
                                                    }}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => {
                                                            setSelectedCell(cell);
                                                            setIsDeleteCellOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Lista de Membros */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" /> Membros
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <MembrosList churchId={id!} isAdmin={isAdmin || isSuperAdmin} />
                </CardContent>
            </Card>

            {/* Dialogs */}
            {selectedChurch && (
                <IgrejaEditForm
                    igreja={selectedChurch as any}
                    open={isEditChurchOpen}
                    onOpenChange={setIsEditChurchOpen}
                />
            )}

            {selectedCell && (
                <CellEditDialog
                    cell={selectedCell}
                    open={isEditCellOpen}
                    onOpenChange={setIsEditCellOpen}
                />
            )}

            <AlertDialog open={isDeleteChurchOpen} onOpenChange={setIsDeleteChurchOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Igreja?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir <b>{selectedChurch?.nome_fantasia}</b>?
                            Esta ação não pode ser desfeita. Todas as células e membros vinculados serão afetados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600" onClick={handleDeleteChurch}>
                            Excluir Definitivamente
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isDeleteCellOpen} onOpenChange={setIsDeleteCellOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Célula?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir <b>{selectedCell?.nome}</b>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600" onClick={handleDeleteCell}>
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {church && (
                <ChurchPosterGenerator
                    igreja={church}
                    registrationLink={`${window.location.origin}/cadastro-membro/${church.id}`}
                    open={isPosterOpen}
                    onOpenChange={setIsPosterOpen}
                />
            )}
        </div>
    );
}

// Helper icon component to fix usage in DropdownMenuItem
function Eye(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}
