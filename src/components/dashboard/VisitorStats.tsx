import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Eye, TrendingUp, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface VisitorStatsData {
  id: string;
  page_path: string;
  visit_date: string;
  visit_count: number;
}

export function VisitorStats() {
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");

  const { data: visitorStats, isLoading } = useQuery({
    queryKey: ["visitor-stats"],
    queryFn: async () => {
      const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("visitor_stats")
        .select("*")
        .gte("visit_date", thirtyDaysAgo)
        .order("visit_date", { ascending: true });
      
      if (error) throw error;
      return data as VisitorStatsData[];
    },
  });

  // Calculate totals
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  
  const todayVisits = visitorStats?.filter(v => v.visit_date === todayStr)
    .reduce((sum, v) => sum + v.visit_count, 0) || 0;

  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
  const weekVisits = visitorStats?.filter(v => {
    const date = new Date(v.visit_date);
    return date >= weekStart && date <= weekEnd;
  }).reduce((sum, v) => sum + v.visit_count, 0) || 0;

  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const monthVisits = visitorStats?.filter(v => {
    const date = new Date(v.visit_date);
    return date >= monthStart && date <= monthEnd;
  }).reduce((sum, v) => sum + v.visit_count, 0) || 0;

  // Generate chart data based on period
  const getChartData = () => {
    if (!visitorStats) return [];

    let days: Date[] = [];
    
    if (period === "day") {
      days = eachDayOfInterval({ start: subDays(today, 6), end: today });
    } else if (period === "week") {
      days = eachDayOfInterval({ start: subDays(today, 13), end: today });
    } else {
      days = eachDayOfInterval({ start: subMonths(today, 1), end: today });
    }

    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const visits = visitorStats
        .filter(v => v.visit_date === dayStr)
        .reduce((sum, v) => sum + v.visit_count, 0);
      
      return {
        date: format(day, period === "month" ? "dd/MM" : "EEE", { locale: ptBR }),
        visitantes: visits,
      };
    });
  };

  const chartData = getChartData();

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">Estatísticas de Visitantes</h2>
            <p className="text-sm text-muted-foreground">Acessos ao portal</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-secondary/50 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Hoje</p>
          <p className="text-xl font-bold text-foreground">{todayVisits.toLocaleString("pt-BR")}</p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Esta Semana</p>
          <p className="text-xl font-bold text-foreground">{weekVisits.toLocaleString("pt-BR")}</p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Este Mês</p>
          <p className="text-xl font-bold text-foreground">{monthVisits.toLocaleString("pt-BR")}</p>
        </div>
      </div>

      {/* Period Tabs */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as "day" | "week" | "month")}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="day" className="text-xs">7 Dias</TabsTrigger>
          <TabsTrigger value="week" className="text-xs">14 Dias</TabsTrigger>
          <TabsTrigger value="month" className="text-xs">30 Dias</TabsTrigger>
        </TabsList>

        <TabsContent value={period} className="mt-0">
          {isLoading ? (
            <div className="h-[150px] flex items-center justify-center text-muted-foreground">
              Carregando...
            </div>
          ) : chartData.length > 0 ? (
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVisitantes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitantes"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVisitantes)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[150px] flex items-center justify-center text-muted-foreground text-sm">
              Nenhum dado disponível
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
