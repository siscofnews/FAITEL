import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History, ArrowRight, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MovementRecord {
  id: string;
  church_name: string;
  previous_parent_name: string | null;
  new_parent_name: string;
  moved_by_name: string | null;
  created_at: string;
}

export function ChurchMovementHistory() {
  const { data: movements, isLoading } = useQuery({
    queryKey: ["church_movement_history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("church_movement_history")
        .select("id, church_name, previous_parent_name, new_parent_name, moved_by_name, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as MovementRecord[];
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="h-4 w-4" />
          Histórico
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Movimentações
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !movements || movements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>Nenhuma movimentação registrada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {movements.map((movement) => (
                <div
                  key={movement.id}
                  className="p-4 rounded-lg border border-border bg-card hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-foreground">
                      {movement.church_name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <span className={cn(
                      "px-2 py-1 rounded-md",
                      movement.previous_parent_name 
                        ? "bg-muted text-muted-foreground" 
                        : "bg-secondary/50 text-muted-foreground italic"
                    )}>
                      {movement.previous_parent_name || "Sem vínculo"}
                    </span>
                    <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                    <span className="px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                      {movement.new_parent_name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{movement.moved_by_name || "Usuário"}</span>
                    </div>
                    <span>
                      {format(new Date(movement.created_at), "dd MMM yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
