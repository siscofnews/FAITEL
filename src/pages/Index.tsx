import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { HierarchyTree } from "@/components/dashboard/HierarchyTree";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { VisitorStats } from "@/components/dashboard/VisitorStats";
import { VisitorHeatmap } from "@/components/dashboard/VisitorHeatmap";
import { VisitorPageStats } from "@/components/dashboard/VisitorPageStats";
import { ChurchPosterGenerator } from "@/components/igrejas/ChurchPosterGenerator";
import { Building2, Users, UserCheck, UserX, TrendingUp, Church, Loader2, AlertCircle, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

import { PermissionsDialog } from "@/components/worship/PermissionsDialog";
import { useSchedulePermissions } from "@/hooks/useSchedulePermissions";

const Index = () => {
  const { isSuperAdmin } = useAuth();
  const { churchId } = usePermissions();
  // Fetch specific schedule permissions for the current church
  const { data: schedulePerms } = useSchedulePermissions(churchId);

  const [isPosterOpen, setIsPosterOpen] = useState(false);
  const [myChurch, setMyChurch] = useState<any>(null);

  useEffect(() => {
    if (churchId) {
      supabase.from('churches').select('*').eq('id', churchId).single().then(({ data }) => setMyChurch(data));
    }
  }, [churchId]);

  const handleAction = (action: string) => {
    if (action === "Presença" || action === "QR Code") {
      if (!myChurch) {
        toast.error("Você precisa estar vinculado a uma igreja para gerar o cartaz.", {
          description: "Selecione uma igreja no menu ou vincule-se a uma."
        });
        return;
      }
      setIsPosterOpen(true);
    }
  };

  // Fetch pending churches (only for super admins)
  const { data: pendingChurches } = useQuery({
    queryKey: ["dashboard-pending-churches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("churches")
        .select("id, nome_fantasia, cidade, estado, created_at, email")
        .eq("is_approved", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: isSuperAdmin,
  });

  // Fetch members statistics
  const { data: membersData, isLoading: isLoadingMembers } = useQuery({
    queryKey: ["dashboard-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("id, role, is_active, created_at, church_id");

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch churches statistics
  const { data: churchesData, isLoading: isLoadingChurches } = useQuery({
    queryKey: ["dashboard-churches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("churches")
        .select("id, nome_fantasia, is_active, is_approved, nivel, created_at")
        .eq("is_approved", true);

      if (error) throw error;
      return data || [];
    },
  });

  // Calculate statistics
  const totalMembers = membersData?.length || 0;
  const activeMembers = membersData?.filter(m => m.is_active).length || 0;
  const inactiveMembers = totalMembers - activeMembers;
  const totalChurches = churchesData?.length || 0;
  const activeChurches = churchesData?.filter(c => c.is_active).length || 0;

  // Members added this month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newMembersThisMonth = membersData?.filter(m =>
    new Date(m.created_at) >= firstDayOfMonth
  ).length || 0;

  // Churches by level
  const churchesByLevel = churchesData?.reduce((acc: Record<string, number>, church) => {
    acc[church.nivel] = (acc[church.nivel] || 0) + 1;
    return acc;
  }, {}) || {};

  const levelLabels: Record<string, string> = {
    matriz: "Matriz",
    sede: "Sede",
    subsede: "Subsede",
    congregacao: "Congregação",
    celula: "Célula",
  };

  const churchLevelData = Object.entries(churchesByLevel).map(([level, count], index) => ({
    name: levelLabels[level] || level,
    value: count,
    color: COLORS[index % COLORS.length],
  }));

  // Members by role (top 5)
  const membersByRole = membersData?.reduce((acc: Record<string, number>, member) => {
    const role = member.role || "membro";
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {}) || {};

  const roleChartData = Object.entries(membersByRole)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([role, count]) => ({
      name: roleLabels[role] || role,
      membros: count,
    }));

  const isLoading = isLoadingMembers || isLoadingChurches;
  const registrationLink = `${window.location.origin}/cadastro-membro${churchId ? `?igreja=${churchId}` : ''}`;

  return (
    <MainLayout>
      {/* Welcome Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Bem-vindo ao <span className="text-gradient">SISCOF</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema de Gestão Eclesiástica • Dashboard
          </p>
        </div>
        <div className="flex gap-2">
          {(isSuperAdmin || schedulePerms?.can_manage_permissions) && churchId && (
            <PermissionsDialog churchId={churchId} />
          )}
          <Link to="/relatorios">
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Ver Relatórios Completos
            </Button>
          </Link>
        </div>
      </div>

      {/* Pending Churches Notification */}
      {isSuperAdmin && pendingChurches && pendingChurches.length > 0 && (
        <Alert className="mb-6 border-amber-500 bg-amber-500/10">
          <Bell className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-600 font-semibold">
            {pendingChurches.length} igreja(s) aguardando aprovação
          </AlertTitle>
          <AlertDescription className="text-muted-foreground">
            <div className="mt-2 space-y-2">
              {pendingChurches.slice(0, 3).map((church) => (
                <div key={church.id} className="flex items-center justify-between text-sm">
                  <span>
                    <span className="font-medium text-foreground">{church.nome_fantasia}</span>
                    {church.cidade && church.estado && (
                      <span className="text-muted-foreground"> • {church.cidade}, {church.estado}</span>
                    )}
                  </span>
                </div>
              ))}
              {pendingChurches.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  E mais {pendingChurches.length - 3} igreja(s)...
                </p>
              )}
            </div>
            <Link to="/igrejas/aprovacao" className="mt-3 inline-block">
              <Button size="sm" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-500/10">
                <AlertCircle className="h-4 w-4 mr-2" />
                Revisar Solicitações
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total de Membros"
              value={totalMembers.toLocaleString("pt-BR")}
              change={`+${newMembersThisMonth} este mês`}
              changeType={newMembersThisMonth > 0 ? "positive" : "neutral"}
              icon={Users}
              variant="primary"
            />
            <StatsCard
              title="Membros Ativos"
              value={activeMembers.toLocaleString("pt-BR")}
              change={`${totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0}% do total`}
              changeType="positive"
              icon={UserCheck}
              variant="gold"
            />
            <StatsCard
              title="Membros Inativos"
              value={inactiveMembers.toLocaleString("pt-BR")}
              change={`${totalMembers > 0 ? Math.round((inactiveMembers / totalMembers) * 100) : 0}% do total`}
              changeType={inactiveMembers > 0 ? "negative" : "neutral"}
              icon={UserX}
            />
            <StatsCard
              title="Igrejas Ativas"
              value={`${activeChurches}/${totalChurches}`}
              change={`${Object.keys(churchesByLevel).length} níveis`}
              changeType="neutral"
              icon={Church}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Members by Role Chart */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-display font-bold text-foreground">Membros por Função</h2>
                  <p className="text-sm text-muted-foreground">Top 5 funções</p>
                </div>
                <Link to="/relatorios">
                  <Button variant="ghost" size="sm">Ver mais</Button>
                </Link>
              </div>
              {roleChartData.length > 0 ? (
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roleChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="membros" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </div>

            {/* Churches by Level Chart */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-display font-bold text-foreground">Igrejas por Nível</h2>
                  <p className="text-sm text-muted-foreground">Distribuição hierárquica</p>
                </div>
                <Link to="/igrejas">
                  <Button variant="ghost" size="sm">Ver mais</Button>
                </Link>
              </div>
              {churchLevelData.length > 0 ? (
                <>
                  <div className="h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={churchLevelData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {churchLevelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {churchLevelData.map((item) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <HierarchyTree />
            </div>
            <div>
              <QuickActions onAction={handleAction} />
            </div>
          </div>

          {/* Visitor Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <VisitorStats />
            <VisitorHeatmap />
            <VisitorPageStats />
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UpcomingEvents />
            <RecentActivity />
          </div>

          {myChurch && (
            <ChurchPosterGenerator
              open={isPosterOpen}
              onOpenChange={setIsPosterOpen}
              igreja={myChurch}
              registrationLink={registrationLink}
            />
          )}
        </>
      )}
    </MainLayout>
  );
};

export default Index;
