import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Download, Users, Church, UserCheck, UserX, Loader2, CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getUserScopeStates } from "@/wiring/accessScope";
import { exportToCSV, exportToExcel } from "@/lib/export-utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Member {
  id: string;
  full_name: string;
  role: string;
  is_active: boolean;
  church_id: string;
  created_at: string;
  churches: {
    id?: string;
    nome_fantasia: string;
  } | null;
  // properties added during processing
  novos?: number;
  total?: number;
}

const roleLabels: Record<string, string> = {
  membro: "Membro",
  obreiro: "Obreiro",
  diacono: "Diácono",
  presbitero: "Presbítero",
  evangelista: "Evangelista",
  pastor: "Pastor",
};

const COLORS = [
  "hsl(225, 65%, 40%)",
  "hsl(43, 96%, 56%)",
  "hsl(160, 60%, 45%)",
  "hsl(280, 60%, 50%)",
  "hsl(20, 80%, 50%)",
  "hsl(200, 70%, 50%)",
];

export default function Relatorios() {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedChurchId, setSelectedChurchId] = useState<string>("all");
  const [compareChurches, setCompareChurches] = useState<string[]>([]);
  const [scopeStates, setScopeStates] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      if (user?.id) {
        try { setScopeStates(await getUserScopeStates(user.id)); } catch {}
      }
    })();
  }, [user?.id]);

  // Fetch churches for filter dropdown
  const { data: churchesData } = useQuery({
    queryKey: ["churches-statistics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("churches")
        .select("id, nome_fantasia, is_active")
        .eq("is_approved", true)
        .in(scopeStates.length ? "estado" : "id", scopeStates.length ? scopeStates : undefined as any)
        .order("nome_fantasia");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all members with church info
  const { data: membersData, isLoading } = useQuery({
    queryKey: ["members-statistics", startDate?.toISOString(), endDate?.toISOString(), selectedChurchId, scopeStates.join(";")],
    queryFn: async () => {
      let query = supabase
        .from("members")
        .select("id, full_name, role, is_active, church_id, created_at, churches!inner(nome_fantasia,estado)");
      
      if (startDate) {
        query = query.gte("created_at", startDate.toISOString());
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte("created_at", endOfDay.toISOString());
      }
      if (selectedChurchId !== "all") {
        query = query.eq("church_id", selectedChurchId);
      }
      if (scopeStates.length) {
        query = query.in("churches.estado", scopeStates);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all members for comparison (without filters)
  const { data: allMembersData } = useQuery({
    queryKey: ["members-all-for-comparison"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("id, full_name, role, is_active, church_id, created_at, churches!inner(id, nome_fantasia,estado)")
        .in(scopeStates.length ? "churches.estado" : "id", scopeStates.length ? scopeStates : undefined as any);
      
      if (error) throw error;
      return data || [];
    },
    enabled: compareChurches.length > 0,
  });

  // Calculate statistics
  const totalMembers = membersData?.length || 0;
  const activeMembers = membersData?.filter(m => m.is_active).length || 0;
  const inactiveMembers = totalMembers - activeMembers;
  const totalChurches = churchesData?.length || 0;
  const activeChurches = churchesData?.filter(c => c.is_active).length || 0;

  // Members by role
  const membersByRole = membersData?.reduce((acc: Record<string, number>, member) => {
    const role = member.role || "membro";
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {}) || {};

  const roleChartData = Object.entries(membersByRole).map(([role, count], index) => ({
    name: roleLabels[role] || role,
    value: count,
    color: COLORS[index % COLORS.length],
  }));

  // Members by church (top 10)
  const membersByChurch = membersData?.reduce((acc: Record<string, number>, member: Member) => {
    const churchName = member.churches?.nome_fantasia || "Sem igreja";
    acc[churchName] = (acc[churchName] || 0) + 1;
    return acc;
  }, {}) || {};

  const churchChartData = Object.entries(membersByChurch)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({
      name: name.length > 20 ? name.substring(0, 20) + "..." : name,
      fullName: name,
      membros: count,
    }));

  // Status chart data
  const statusChartData = [
    { name: "Ativos", value: activeMembers, color: "hsl(160, 60%, 45%)" },
    { name: "Inativos", value: inactiveMembers, color: "hsl(0, 70%, 50%)" },
  ];

  // Comparison data for selected churches
  const comparisonData = compareChurches.map((churchId, index) => {
    const church = churchesData?.find(c => c.id === churchId);
    const churchMembers = (allMembersData as Member[] | undefined)?.filter((m) => m.church_id === churchId) || [];
    const active = churchMembers.filter((m) => m.is_active).length;
    const inactive = churchMembers.length - active;
    
    // Count by role
    const roleCount = churchMembers.reduce((acc: Record<string, number>, m) => {
      const role = m.role || "membro";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    return {
      id: churchId,
      name: church?.nome_fantasia || "Igreja",
      shortName: (church?.nome_fantasia || "Igreja").length > 15 
        ? (church?.nome_fantasia || "Igreja").substring(0, 15) + "..." 
        : (church?.nome_fantasia || "Igreja"),
      total: churchMembers.length,
      active,
      inactive,
      roleCount,
      color: COLORS[index % COLORS.length],
    };
  });

  // Bar chart data for comparison
  const comparisonBarData = [
    { 
      metric: "Total", 
      ...Object.fromEntries(comparisonData.map(c => [c.shortName, c.total]))
    },
    { 
      metric: "Ativos", 
      ...Object.fromEntries(comparisonData.map(c => [c.shortName, c.active]))
    },
    { 
      metric: "Inativos", 
      ...Object.fromEntries(comparisonData.map(c => [c.shortName, c.inactive]))
    },
  ];

  // Monthly evolution data (last 12 months)
  const monthlyEvolutionData = (() => {
    if (!membersData || membersData.length === 0) return [];
    
    const now = new Date();
    const months: { month: string; date: Date; novos: number; total: number }[] = [];
    
    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: format(date, "MMM/yy", { locale: ptBR }),
        date,
        novos: 0,
        total: 0,
      });
    }
    
    // Count members per month
    membersData.forEach((member: Member) => {
      const createdAt = new Date(member.created_at);
      months.forEach((m) => {
        const monthStart = m.date;
        const monthEnd = new Date(m.date.getFullYear(), m.date.getMonth() + 1, 0, 23, 59, 59);
        
        // Count new members in this month
        if (createdAt >= monthStart && createdAt <= monthEnd) {
          m.novos++;
        }
        // Count total members up to this month end
        if (createdAt <= monthEnd) {
          m.total++;
        }
      });
    });
    
    return months.map(m => ({
      month: m.month,
      novos: m.novos,
      total: m.total,
    }));
  })();

  // Export data
  const exportStatistics = (format: "csv" | "excel") => {
    if (!membersData || membersData.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    const exportData = [
      { categoria: "Total de Membros", valor: totalMembers },
      { categoria: "Membros Ativos", valor: activeMembers },
      { categoria: "Membros Inativos", valor: inactiveMembers },
      { categoria: "Total de Igrejas", valor: totalChurches },
      { categoria: "Igrejas Ativas", valor: activeChurches },
      ...Object.entries(membersByRole).map(([role, count]) => ({
        categoria: `Membros - ${roleLabels[role] || role}`,
        valor: count,
      })),
      ...Object.entries(membersByChurch).map(([church, count]) => ({
        categoria: `Igreja - ${church}`,
        valor: count,
      })),
    ];

    const columns: { key: keyof typeof exportData[0]; label: string }[] = [
      { key: "categoria", label: "Categoria" },
      { key: "valor", label: "Valor" },
    ];

    const filename = `relatorio-${new Date().toISOString().split("T")[0]}`;

    if (format === "csv") {
      exportToCSV(exportData, filename, columns);
      toast.success("Relatório CSV exportado com sucesso");
    } else {
      exportToExcel(exportData, filename, columns);
      toast.success("Relatório Excel exportado com sucesso");
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground mt-1">Estatísticas de membros por igreja, função e status</p>
        </div>
        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="gold">
                <Download className="h-5 w-5 mr-2" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportStatistics("csv")}>
                Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportStatistics("excel")}>
                Exportar Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-card rounded-xl border border-border">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-foreground">Filtros:</span>
          
          {/* Church Filter */}
          <Select value={selectedChurchId} onValueChange={setSelectedChurchId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Todas as igrejas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as igrejas</SelectItem>
              {churchesData?.map((church) => (
                <SelectItem key={church.id} value={church.id}>
                  {church.nome_fantasia}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Date Range */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[160px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Data inicial"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                locale={ptBR}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <span className="text-muted-foreground">até</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[160px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Data final"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                locale={ptBR}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {(startDate || endDate || selectedChurchId !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStartDate(undefined);
              setEndDate(undefined);
              setSelectedChurchId("all");
            }}
          >
            <X className="h-4 w-4 mr-1" />
            Limpar filtros
          </Button>
        )}

        {(startDate || endDate || selectedChurchId !== "all") && (
          <span className="text-sm text-muted-foreground ml-auto">
            {totalMembers} membro(s) encontrado(s)
          </span>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { 
            title: "Total de Membros", 
            value: totalMembers.toLocaleString("pt-BR"), 
            icon: Users,
            color: "gradient-primary"
          },
          { 
            title: "Membros Ativos", 
            value: activeMembers.toLocaleString("pt-BR"), 
            icon: UserCheck,
            color: "bg-green-500"
          },
          { 
            title: "Membros Inativos", 
            value: inactiveMembers.toLocaleString("pt-BR"), 
            icon: UserX,
            color: "bg-red-500"
          },
          { 
            title: "Igrejas Ativas", 
            value: `${activeChurches}/${totalChurches}`, 
            icon: Church,
            color: "gradient-gold"
          },
        ].map((kpi, index) => (
          <div
            key={kpi.title}
            className="bg-card rounded-2xl border border-border p-6 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-3xl font-bold text-foreground mt-2">{kpi.value}</p>
              </div>
              <div className={cn("p-3 rounded-xl", kpi.color)}>
                <kpi.icon className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Evolution Chart */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-lg font-display font-bold text-foreground">Evolução de Membros</h2>
          <p className="text-sm text-muted-foreground">Crescimento nos últimos 12 meses</p>
        </div>
        {monthlyEvolutionData.length > 0 ? (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyEvolutionData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(225, 65%, 40%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(225, 65%, 40%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNovos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(43, 96%, 56%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(43, 96%, 56%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(225, 65%, 40%)"
                  strokeWidth={2}
                  fill="url(#colorTotal)"
                  name="Total acumulado"
                />
                <Area
                  type="monotone"
                  dataKey="novos"
                  stroke="hsl(43, 96%, 56%)"
                  strokeWidth={2}
                  fill="url(#colorNovos)"
                  name="Novos membros"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Nenhum dado disponível
          </div>
        )}
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(225, 65%, 40%)" }} />
            <span className="text-sm text-muted-foreground">Total acumulado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(43, 96%, 56%)" }} />
            <span className="text-sm text-muted-foreground">Novos membros no mês</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Members by Role */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="mb-6">
            <h2 className="text-lg font-display font-bold text-foreground">Membros por Função</h2>
            <p className="text-sm text-muted-foreground">Distribuição por cargo ministerial</p>
          </div>
          {roleChartData.length > 0 ? (
            <>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {roleChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                      }}
                      formatter={(value: number) => [value, "Membros"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {roleChartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </div>

        {/* Members by Status */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="mb-6">
            <h2 className="text-lg font-display font-bold text-foreground">Membros por Status</h2>
            <p className="text-sm text-muted-foreground">Ativos vs inativos</p>
          </div>
          {totalMembers > 0 ? (
            <>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                      }}
                      formatter={(value: number) => [value, "Membros"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {statusChartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </div>
      </div>

      {/* Members by Church Chart */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="mb-6">
          <h2 className="text-lg font-display font-bold text-foreground">Membros por Igreja</h2>
          <p className="text-sm text-muted-foreground">Top 10 igrejas com mais membros</p>
        </div>
        {churchChartData.length > 0 ? (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={churchChartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  width={150}
                  tick={{ fill: "hsl(var(--foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number, name: string, props: { payload: { fullName: string } }) => [value, props.payload.fullName]}
                  labelFormatter={() => ""}
                />
                <Bar 
                  dataKey="membros" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]} 
                  name="Membros"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Nenhum dado disponível
          </div>
        )}
      </div>

      {/* Summary Table */}
      <div className="bg-card rounded-2xl border border-border p-6 mt-6">
        <div className="mb-6">
          <h2 className="text-lg font-display font-bold text-foreground">Resumo por Função</h2>
          <p className="text-sm text-muted-foreground">Detalhamento de membros por cargo</p>
        </div>
        <div className="space-y-4">
          {roleChartData.map((item, index) => {
            const percentage = totalMembers > 0 ? Math.round((item.value / totalMembers) * 100) : 0;
            return (
              <div
                key={item.name}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.value} membros ({percentage}%)
                  </span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Church Comparison Section */}
      <div className="bg-card rounded-2xl border border-border p-6 mt-6">
        <div className="mb-6">
          <h2 className="text-lg font-display font-bold text-foreground">Comparativo entre Igrejas</h2>
          <p className="text-sm text-muted-foreground">Selecione até 4 igrejas para comparar estatísticas</p>
        </div>
        
        {/* Church Selection */}
        <div className="flex flex-wrap gap-2 mb-6">
          {churchesData?.slice(0, 20).map((church) => {
            const isSelected = compareChurches.includes(church.id);
            return (
              <Button
                key={church.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (isSelected) {
                    setCompareChurches(compareChurches.filter(id => id !== church.id));
                  } else if (compareChurches.length < 4) {
                    setCompareChurches([...compareChurches, church.id]);
                  } else {
                    toast.error("Máximo de 4 igrejas para comparar");
                  }
                }}
                className="text-xs"
              >
                {church.nome_fantasia.length > 20 
                  ? church.nome_fantasia.substring(0, 20) + "..." 
                  : church.nome_fantasia}
              </Button>
            );
          })}
        </div>

        {compareChurches.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCompareChurches([])}
            className="mb-6"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar seleção
          </Button>
        )}

        {compareChurches.length >= 2 ? (
          <>
            {/* Comparison Bar Chart */}
            <div className="h-[300px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                  {comparisonData.map((church, index) => (
                    <Bar
                      key={church.id}
                      dataKey={church.shortName}
                      fill={church.color}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {comparisonData.map((church) => (
                <div
                  key={church.id}
                  className="p-4 rounded-xl border border-border"
                  style={{ borderLeftColor: church.color, borderLeftWidth: "4px" }}
                >
                  <h3 className="font-semibold text-foreground mb-3 truncate" title={church.name}>
                    {church.name}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium text-foreground">{church.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ativos:</span>
                      <span className="font-medium text-green-600">{church.active}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Inativos:</span>
                      <span className="font-medium text-red-500">{church.inactive}</span>
                    </div>
                    <div className="pt-2 border-t border-border mt-2">
                      <span className="text-xs text-muted-foreground">Por função:</span>
                      <div className="mt-1 space-y-1">
                        {Object.entries(church.roleCount).slice(0, 3).map(([role, count]) => (
                          <div key={role} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{roleLabels[role] || role}:</span>
                            <span className="text-foreground">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            {compareChurches.length === 1 
              ? "Selecione pelo menos mais uma igreja para comparar"
              : "Selecione pelo menos 2 igrejas para ver o comparativo"}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
