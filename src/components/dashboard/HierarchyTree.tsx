import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Building2, Church, Home, Users } from "lucide-react";

interface HierarchyNode {
  id: string;
  name: string;
  type: "matriz" | "sede" | "subsede" | "congregacao" | "celula";
  pastor?: string;
  members?: number;
  children?: HierarchyNode[];
}

const mockHierarchy: HierarchyNode[] = [
  {
    id: "1",
    name: "Igreja Matriz Central",
    type: "matriz",
    pastor: "Pr. João Silva",
    members: 5000,
    children: [
      {
        id: "2",
        name: "Sede Norte",
        type: "sede",
        pastor: "Pr. Pedro Santos",
        members: 1200,
        children: [
          {
            id: "3",
            name: "Subsede Jardim América",
            type: "subsede",
            pastor: "Pr. Carlos Lima",
            members: 400,
            children: [
              {
                id: "4",
                name: "Congregação Vila Nova",
                type: "congregacao",
                pastor: "Líder Maria Costa",
                members: 150,
                children: [
                  { id: "5", name: "Célula Família Unida", type: "celula", members: 12 },
                  { id: "6", name: "Célula Jovens em Ação", type: "celula", members: 15 },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "7",
        name: "Sede Sul",
        type: "sede",
        pastor: "Pr. André Oliveira",
        members: 800,
        children: [
          {
            id: "8",
            name: "Congregação Centro",
            type: "congregacao",
            pastor: "Líder Ana Souza",
            members: 200,
          },
        ],
      },
    ],
  },
];

const typeConfig = {
  matriz: { icon: Building2, color: "text-primary", bg: "bg-primary/10" },
  sede: { icon: Church, color: "text-accent", bg: "bg-accent/10" },
  subsede: { icon: Home, color: "text-navy-light", bg: "bg-navy-light/10" },
  congregacao: { icon: Home, color: "text-muted-foreground", bg: "bg-muted" },
  celula: { icon: Users, color: "text-green-600", bg: "bg-green-100" },
};

function TreeNode({ node, level = 0 }: { node: HierarchyNode; level?: number }) {
  const [expanded, setExpanded] = useState(level < 2);
  const config = typeConfig[node.type];
  const Icon = config.icon;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="animate-fade-in">
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-secondary",
          level === 0 && "bg-secondary/50"
        )}
        style={{ marginLeft: `${level * 24}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          <button className="p-1 hover:bg-muted rounded">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}
        <div className={cn("p-2 rounded-lg", config.bg)}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{node.name}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {node.pastor && <span>{node.pastor}</span>}
            {node.members && <span>• {node.members} membros</span>}
          </div>
        </div>
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium capitalize",
            config.bg,
            config.color
          )}
        >
          {node.type}
        </span>
      </div>
      {expanded && hasChildren && (
        <div className="mt-1">
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function HierarchyTree() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-display font-bold text-foreground">
            Estrutura Hierárquica
          </h2>
          <p className="text-sm text-muted-foreground">
            Visualize todas as unidades da sua organização
          </p>
        </div>
      </div>
      <div className="space-y-1">
        {mockHierarchy.map((node) => (
          <TreeNode key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}
