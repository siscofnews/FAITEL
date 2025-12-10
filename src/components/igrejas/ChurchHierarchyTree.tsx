import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Building2,
  Church,
  Home,
  Users,
  ChevronRight,
  ChevronDown,
  MapPin,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";

export interface ChurchNode {
  id: string;
  nome_fantasia: string;
  cidade: string | null;
  estado: string | null;
  nivel: "matriz" | "sede" | "subsede" | "congregacao" | "celula";
  logo_url: string | null;
  parent_church_id: string | null;
  children?: ChurchNode[];
}

const typeConfig = {
  matriz: { icon: Building2, color: "text-primary", bg: "bg-primary/10", label: "Matriz" },
  sede: { icon: Church, color: "text-accent-foreground", bg: "bg-accent/20", label: "Sede" },
  subsede: { icon: Home, color: "text-navy-light", bg: "bg-navy-light/10", label: "Subsede" },
  congregacao: { icon: Home, color: "text-muted-foreground", bg: "bg-muted", label: "Congregação" },
  celula: { icon: Users, color: "text-green-600", bg: "bg-green-100", label: "Célula" },
};

const levelOrder = ["matriz", "sede", "subsede", "congregacao", "celula"] as const;

// Check if a church can be dropped on a target
function canDropOn(dragLevel: string, targetLevel: string): boolean {
  const dragIndex = levelOrder.indexOf(dragLevel as any);
  const targetIndex = levelOrder.indexOf(targetLevel as any);
  // Can only drop on a parent level (target must be at least one level above)
  return targetIndex < dragIndex && targetIndex === dragIndex - 1;
}

interface TreeNodeProps {
  church: ChurchNode;
  level?: number;
  searchTerm?: string;
  canDrag?: boolean;
  onMoveChurch?: (churchId: string, newParentId: string | null) => void;
  allChurches?: ChurchNode[];
}

function TreeNode({ 
  church, 
  level = 0, 
  searchTerm = "", 
  canDrag = false,
  onMoveChurch,
  allChurches = []
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const config = typeConfig[church.nivel] || typeConfig.congregacao;
  const Icon = config.icon;
  const hasChildren = church.children && church.children.length > 0;

  // Draggable setup - only non-matriz churches can be dragged
  const isDraggable = canDrag && church.nivel !== "matriz";
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: church.id,
    data: { church },
    disabled: !isDraggable,
  });

  // Droppable setup - can receive children based on hierarchy rules
  const { setNodeRef: setDropRef, isOver, active } = useDroppable({
    id: `drop-${church.id}`,
    data: { church },
  });

  // Check if the current active dragged item can be dropped here
  const activeChurch = active?.data?.current?.church as ChurchNode | undefined;
  const canReceiveDrop = activeChurch && canDropOn(activeChurch.nivel, church.nivel);

  // Check if this node or any children match the search
  const matchesSearch = (node: ChurchNode): boolean => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matches =
      node.nome_fantasia.toLowerCase().includes(term) ||
      node.cidade?.toLowerCase().includes(term) ||
      node.estado?.toLowerCase().includes(term);
    if (matches) return true;
    return node.children?.some(matchesSearch) || false;
  };

  if (!matchesSearch(church)) return null;

  return (
    <div className="select-none">
      <div
        ref={(node) => {
          setDragRef(node);
          setDropRef(node);
        }}
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-lg transition-all",
          "hover:bg-secondary/50 group",
          isDragging && "opacity-50 bg-secondary",
          isOver && canReceiveDrop && "ring-2 ring-primary bg-primary/10",
          isOver && !canReceiveDrop && active && "ring-2 ring-destructive/50 bg-destructive/5"
        )}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        {/* Drag Handle */}
        {isDraggable && (
          <button
            {...attributes}
            {...listeners}
            className="p-1 rounded hover:bg-secondary cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
        )}

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "p-1 rounded hover:bg-secondary transition-colors",
            !hasChildren && "invisible"
          )}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* Icon */}
        <div className={cn("p-1.5 rounded-lg shrink-0", config.bg)}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>

        {/* Church Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground truncate">
              {church.nome_fantasia}
            </span>
            <span
              className={cn(
                "text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0",
                config.bg,
                config.color
              )}
            >
              {config.label}
            </span>
          </div>
          {(church.cidade || church.estado) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate">
                {[church.cidade, church.estado].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* Children Count */}
        {hasChildren && (
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {church.children!.length}
          </span>
        )}

        {/* View Button */}
        <Link to={`/igrejas/${church.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            Ver
          </Button>
        </Link>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute top-0 bottom-0 w-px bg-border"
            style={{ left: `${level * 24 + (canDrag ? 48 : 24)}px` }}
          />
          {church.children!.map((child) => (
            <TreeNode
              key={child.id}
              church={child}
              level={level + 1}
              searchTerm={searchTerm}
              canDrag={canDrag}
              onMoveChurch={onMoveChurch}
              allChurches={allChurches}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Overlay component for dragging
function DragOverlayContent({ church }: { church: ChurchNode }) {
  const config = typeConfig[church.nivel] || typeConfig.congregacao;
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2 py-2 px-4 rounded-lg bg-card border-2 border-primary shadow-lg">
      <div className={cn("p-1.5 rounded-lg shrink-0", config.bg)}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>
      <span className="font-medium text-foreground">{church.nome_fantasia}</span>
      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", config.bg, config.color)}>
        {config.label}
      </span>
    </div>
  );
}

interface ChurchHierarchyTreeProps {
  churches: ChurchNode[];
  searchTerm?: string;
  onRefresh?: () => void;
}

// Build tree structure from flat list
function buildTree(churches: ChurchNode[]): ChurchNode[] {
  const churchMap = new Map<string, ChurchNode>();
  const roots: ChurchNode[] = [];

  // First pass: create a map of all churches
  churches.forEach((church) => {
    churchMap.set(church.id, { ...church, children: [] });
  });

  // Second pass: build the tree
  churches.forEach((church) => {
    const node = churchMap.get(church.id)!;
    if (church.parent_church_id && churchMap.has(church.parent_church_id)) {
      const parent = churchMap.get(church.parent_church_id)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Sort children by level and name
  const sortChildren = (nodes: ChurchNode[]) => {
    nodes.sort((a, b) => {
      const levelDiff = levelOrder.indexOf(a.nivel) - levelOrder.indexOf(b.nivel);
      if (levelDiff !== 0) return levelDiff;
      return a.nome_fantasia.localeCompare(b.nome_fantasia);
    });
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortChildren(node.children);
      }
    });
  };

  sortChildren(roots);
  return roots;
}

interface PendingMove {
  draggedChurch: ChurchNode;
  targetChurch: ChurchNode;
}

export function ChurchHierarchyTree({ churches, searchTerm = "", onRefresh }: ChurchHierarchyTreeProps) {
  const { isSuperAdmin, user } = useAuth();
  const [activeChurch, setActiveChurch] = useState<ChurchNode | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);

  const tree = buildTree(churches);

  // Check if user can drag (super admin or pastor presidente)
  const canDrag = isSuperAdmin;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const church = event.active.data.current?.church as ChurchNode;
    setActiveChurch(church);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveChurch(null);

    if (!over || !active) return;

    const draggedChurch = active.data.current?.church as ChurchNode;
    const targetChurch = over.data.current?.church as ChurchNode;

    if (!draggedChurch || !targetChurch) return;
    if (draggedChurch.id === targetChurch.id) return;

    // Validate hierarchy rules
    if (!canDropOn(draggedChurch.nivel, targetChurch.nivel)) {
      toast.error("Movimento inválido", {
        description: `Uma ${typeConfig[draggedChurch.nivel].label} só pode ser movida para uma ${
          levelOrder.indexOf(draggedChurch.nivel) > 0 
            ? typeConfig[levelOrder[levelOrder.indexOf(draggedChurch.nivel) - 1]].label 
            : "hierarquia superior"
        }.`,
      });
      return;
    }

    // Show confirmation dialog
    setPendingMove({ draggedChurch, targetChurch });
  };

  const confirmMove = async () => {
    if (!pendingMove || !user) return;
    
    const { draggedChurch, targetChurch } = pendingMove;
    setPendingMove(null);
    setIsMoving(true);
    
    // Find previous parent name
    const previousParent = churches.find(c => c.id === draggedChurch.parent_church_id);
    
    try {
      // Get user profile for moved_by_name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      // Update church parent
      const { error: updateError } = await supabase
        .from("churches")
        .update({ parent_church_id: targetChurch.id })
        .eq("id", draggedChurch.id);

      if (updateError) throw updateError;

      // Log movement to history
      const { error: historyError } = await supabase
        .from("church_movement_history")
        .insert({
          church_id: draggedChurch.id,
          church_name: draggedChurch.nome_fantasia,
          previous_parent_id: draggedChurch.parent_church_id,
          previous_parent_name: previousParent?.nome_fantasia || null,
          new_parent_id: targetChurch.id,
          new_parent_name: targetChurch.nome_fantasia,
          moved_by: user.id,
          moved_by_name: profile?.full_name || user.email,
        });

      if (historyError) {
        console.error("Error logging movement history:", historyError);
      }

      toast.success("Igreja movida com sucesso!", {
        description: `${draggedChurch.nome_fantasia} agora está vinculada a ${targetChurch.nome_fantasia}.`,
      });

      // Refresh the tree
      onRefresh?.();
    } catch (error) {
      console.error("Error moving church:", error);
      toast.error("Erro ao mover igreja", {
        description: "Não foi possível atualizar a hierarquia. Tente novamente.",
      });
    } finally {
      setIsMoving(false);
    }
  };

  const cancelMove = () => {
    setPendingMove(null);
  };

  if (tree.length === 0) {
    return (
      <div className="text-center py-12">
        <Church className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhuma igreja encontrada.</p>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={cn(
          "bg-card rounded-2xl border border-border p-4",
          isMoving && "opacity-70 pointer-events-none"
        )}>
          {canDrag && (
            <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <GripVertical className="h-4 w-4 inline mr-1" />
                Arraste uma igreja para reorganizar a hierarquia. Respeite os níveis: 
                <span className="font-medium"> Matriz → Sede → Subsede → Congregação → Célula</span>
              </p>
            </div>
          )}
          <div className="space-y-1">
            {tree.map((church) => (
              <TreeNode 
                key={church.id} 
                church={church} 
                searchTerm={searchTerm}
                canDrag={canDrag}
                allChurches={churches}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeChurch && <DragOverlayContent church={activeChurch} />}
        </DragOverlay>
      </DndContext>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!pendingMove} onOpenChange={(open) => !open && cancelMove()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar movimentação</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Você está prestes a mover:</p>
              <p className="font-medium text-foreground">
                {pendingMove?.draggedChurch.nome_fantasia}
              </p>
              <p>Para ficar vinculada a:</p>
              <p className="font-medium text-foreground">
                {pendingMove?.targetChurch.nome_fantasia}
              </p>
              <p className="text-sm mt-4">
                Esta ação irá alterar a hierarquia organizacional da igreja.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelMove}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMove}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
