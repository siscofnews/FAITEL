import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format, subDays } from "date-fns";

interface PageStats {
  page_path: string;
  total: number;
  today: number;
  yesterday: number;
}

const PAGE_LABELS: Record<string, string> = {
  "/": "Portal Principal",
  "/portal": "Portal Principal",
  "/escalas": "Consulta de Escalas",
  "/eventos": "Eventos IADMA",
  "/ago-cemadeb": "AGO CEMADEB",
  "/galeria-agos": "Galeria AGOs",
};

export function VisitorPageStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["visitor-page-stats"],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
      const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("visitor_stats")
        .select("page_path, visit_date, visit_count")
        .gte("visit_date", thirtyDaysAgo);

      if (error) throw error;

      // Aggregate by page
      const pageMap = new Map<string, { total: number; today: number; yesterday: number }>();

      (data || []).forEach((row) => {
        const current = pageMap.get(row.page_path) || { total: 0, today: 0, yesterday: 0 };
        current.total += row.visit_count;
        if (row.visit_date === today) current.today += row.visit_count;
        if (row.visit_date === yesterday) current.yesterday += row.visit_count;
        pageMap.set(row.page_path, current);
      });

      // Convert to array and sort by total
      const result: PageStats[] = Array.from(pageMap.entries())
        .map(([page_path, stats]) => ({ page_path, ...stats }))
        .sort((a, b) => b.total - a.total);

      return result;
    },
  });

  const getTrend = (today: number, yesterday: number) => {
    if (today > yesterday) return { icon: TrendingUp, color: "text-green-500" };
    if (today < yesterday) return { icon: TrendingDown, color: "text-red-500" };
    return { icon: Minus, color: "text-muted-foreground" };
  };

  const totalVisits = stats?.reduce((sum, s) => sum + s.total, 0) || 0;

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-lg font-display font-bold text-foreground">Visitas por Página</h2>
          <p className="text-sm text-muted-foreground">Últimos 30 dias</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[200px] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : stats && stats.length > 0 ? (
        <div className="space-y-3">
          {stats.slice(0, 6).map((page) => {
            const TrendIcon = getTrend(page.today, page.yesterday).icon;
            const trendColor = getTrend(page.today, page.yesterday).color;
            const percentage = totalVisits > 0 ? ((page.total / totalVisits) * 100).toFixed(1) : "0";

            return (
              <div key={page.page_path} className="flex items-center gap-3">
                {/* Progress bar */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground truncate">
                      {PAGE_LABELS[page.page_path] || page.page_path}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {page.total.toLocaleString("pt-BR")}
                      </span>
                      <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                    </div>
                  </div>
                  <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">
                      Hoje: {page.today}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
          Nenhum dado disponível
        </div>
      )}
    </div>
  );
}
