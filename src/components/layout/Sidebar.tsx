import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Church,
  GraduationCap,
  Calendar,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  Building2,
  MessageSquare,
  CreditCard,
  LogOut,
  ShieldCheck,
  X,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Portal", href: "/", icon: Church },
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Igrejas", href: "/igrejas", icon: Building2 },
  { name: "Nova Igreja", href: "/cadastrar-igreja-filha", icon: PlusCircle },
  { name: "Escola de Culto", href: "/escola", icon: GraduationCap },
  { name: "Escalas", href: "/escalas", icon: Calendar },
  { name: "Assistente", href: "/assistente-lembretes", icon: MessageSquare },
  { name: "Contatos Lembretes", href: "/contatos-lembretes", icon: Users },
  { name: "Lembretes", href: "/lembretes-automaticos", icon: Calendar },
  { name: "Pessoas", href: "/pessoas", icon: Users },
  { name: "Comunicação", href: "/comunicacao", icon: MessageSquare },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Financeiro", href: "/financeiro", icon: CreditCard },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

const adminNavigation = [
  { name: "Nova Igreja", href: "/cadastrar-igreja-admin", icon: PlusCircle },
  { name: "Aprovar Igrejas", href: "/igrejas-aprovacao", icon: ShieldCheck },
  { name: "Assinaturas", href: "/assinaturas", icon: CreditCard },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { isSuperAdmin, signOut, user } = useAuth();

  const { data: pendingMembersCount } = useQuery({
    queryKey: ["pending-members-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("members")
        .select("*", { count: "exact", head: true })
        .eq("is_active", false);
      if (error) return 0;
      return count || 0;
    },
    // Refetch every minute
    refetchInterval: 60000
  });

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-32 z-20 h-[calc(100vh-8rem)] bg-card border-r border-border transition-all duration-300",
        // Desktop: always visible, collapsible
        "hidden lg:block",
        collapsed ? "lg:w-20" : "lg:w-64",
        // Mobile: slide in from left
        isOpen && "block w-[280px] max-w-[85vw]"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="gradient-primary p-2 rounded-xl">
              <Church className="h-6 w-6 text-primary-foreground" />
            </div>
            {(!collapsed || isOpen) && (
              <div className="animate-fade-in">
                <h1 className="font-display text-lg font-bold text-foreground">SISCOF</h1>
                <p className="text-xs text-muted-foreground">Gestão Eclesiástica</p>
              </div>
            )}
          </div>

          {/* Close button on mobile */}
          {isOpen && onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          )}

          {/* Collapse button on desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.name === "Pessoas" ? "/membros" : item.href}
              onClick={handleNavClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative",
                  isActive || (item.name === "Pessoas" && window.location.pathname === "/membros")
                    ? "gradient-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )
              }
            >
              <div className="relative">
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {item.name === "Pessoas" && pendingMembersCount !== undefined && pendingMembersCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-orange-500 border-2 border-card animate-pulse" />
                )}
              </div>
              {(!collapsed || isOpen) && (
                <div className="flex items-center justify-between flex-1">
                  <span className="animate-fade-in">{item.name === "Pessoas" ? "Membros" : item.name}</span>
                  {item.name === "Pessoas" && pendingMembersCount !== undefined && pendingMembersCount > 0 && (
                    <span className="bg-orange-500 text-white text-[10px] px-1.5 rounded-full animate-fade-in">
                      {pendingMembersCount}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}

          {/* Admin Navigation */}
          {isSuperAdmin && (
            <>
              {(!collapsed || isOpen) && (
                <div className="pt-4 pb-2">
                  <span className="px-3 text-xs font-semibold text-gold uppercase tracking-wider">
                    Super Admin
                  </span>
                </div>
              )}
              {adminNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gold text-navy shadow-md"
                        : "text-gold/80 hover:bg-gold/10 hover:text-gold"
                    )
                  }
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {(!collapsed || isOpen) && <span className="animate-fade-in">{item.name}</span>}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User section */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full gradient-gold flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-navy">MA</span>
            </div>
            {(!collapsed || isOpen) && (
              <div className="animate-fade-in min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Matriz Admin</p>
                <p className="text-xs text-muted-foreground truncate">Administrador</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all",
              (collapsed && !isOpen) && "justify-center"
            )}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {(!collapsed || isOpen) && <span>Sair</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
