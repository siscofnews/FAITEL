import { Bell, Search, LogOut, Home, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { setScopeOverride, getUserScopeStates } from "@/wiring/accessScope";

export function Header() {
  const { user, signOut } = useAuth();
  const [scope, setScope] = useState<string[]>([]);
  const [isPresEstadual, setIsPresEstadual] = useState(false);
  const [overrideActive, setOverrideActive] = useState(false);
  const BR_STATES = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

  useEffect(() => {
    (async () => {
      try {
        if (!user?.id) return;
        const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
        setIsPresEstadual((roles || []).some((r: any) => r.role === 'presidente_estadual'));
        const states = await getUserScopeStates(user.id);
        setScope(states);
        try { setOverrideActive(!!localStorage.getItem('siscof_scope_override')); } catch {}
      } catch {}
    })();
  }, [user?.id]);
  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Search */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar igrejas, pessoas, eventos..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isPresEstadual && (
            <div className="flex items-center gap-2">
              {scope.length > 0 && <Badge variant="outline">Escopo: {scope.join(', ')}</Badge>}
              {overrideActive && <Badge variant="destructive">Override ativo</Badge>}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" /> Estados
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px]">
                  <div className="grid grid-cols-6 gap-2">
                    {BR_STATES.map(uf => (
                      <Button key={uf} variant={scope.includes(uf) ? 'secondary' : 'outline'} size="sm" onClick={() => {
                        setScope(prev => prev.includes(uf) ? prev.filter(s => s !== uf) : [...prev, uf]);
                      }}>{uf}</Button>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <Button variant="secondary" size="sm" onClick={() => { setScopeOverride(scope); }}>Aplicar</Button>
                    <Button variant="outline" size="sm" onClick={() => { setScopeOverride([]); (async () => { if (user?.id) { const states = await getUserScopeStates(user.id); setScope(states); } })(); }}>Limpar escopo</Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
          <Button variant="ghost" size="icon" asChild>
            <a href="/">
              <Home className="h-5 w-5" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-[10px] font-bold flex items-center justify-center text-accent-foreground">
              3
            </span>
          </Button>
          <Button variant="ghost" size="icon" onClick={async()=>{ try { await signOut(); } catch {} try { localStorage.removeItem('siscof_dev_super'); } catch {} window.location.href = '/login'; }}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
