import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus, Download, CreditCard, Wallet, TrendingUp, AlertTriangle, Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const receitaData = [
  { mes: "Jul", receita: 45000, despesa: 32000 },
  { mes: "Ago", receita: 52000, despesa: 35000 },
  { mes: "Set", receita: 48000, despesa: 33000 },
  { mes: "Out", receita: 61000, despesa: 38000 },
  { mes: "Nov", receita: 55000, despesa: 36000 },
  { mes: "Dez", receita: 72000, despesa: 42000 },
];

interface Transacao {
  id: string;
  type: "entrada" | "saida";
  description: string;
  value: number;
  date: string;
  unit: string;
  status: "pago" | "pendente" | "atrasado";
}

const mockTransacoes: Transacao[] = [
  { id: "1", type: "entrada", description: "Dízimos - Culto Domingo", value: 15420, date: "08/12/2024", unit: "Igreja Matriz", status: "pago" },
  { id: "2", type: "entrada", description: "Ofertas Missionárias", value: 3200, date: "08/12/2024", unit: "Sede Norte", status: "pago" },
  { id: "3", type: "saida", description: "Conta de Luz - Dezembro", value: 2800, date: "05/12/2024", unit: "Igreja Matriz", status: "pago" },
  { id: "4", type: "entrada", description: "Mensalidade Escola", value: 890, date: "04/12/2024", unit: "Sede Sul", status: "pendente" },
  { id: "5", type: "saida", description: "Manutenção Equipamentos", value: 1500, date: "03/12/2024", unit: "Igreja Matriz", status: "atrasado" },
];

interface Igreja {
  id: string;
  name: string;
  status: "ativo" | "pendente" | "inativo";
  lastPayment: string;
  daysRemaining: number;
  plan: string;
  value: number;
}

const mockIgrejas: Igreja[] = [
  { id: "1", name: "Igreja Matriz Central", status: "ativo", lastPayment: "01/12/2024", daysRemaining: 26, plan: "Premium", value: 299 },
  { id: "2", name: "Sede Norte", status: "ativo", lastPayment: "28/11/2024", daysRemaining: 23, plan: "Básico", value: 99 },
  { id: "3", name: "Sede Sul", status: "pendente", lastPayment: "15/11/2024", daysRemaining: 10, plan: "Básico", value: 99 },
  { id: "4", name: "Congregação Centro", status: "inativo", lastPayment: "01/10/2024", daysRemaining: -35, plan: "Básico", value: 99 },
];

const statusConfig = {
  pago: { icon: Check, color: "text-green-600", bg: "bg-green-100" },
  pendente: { icon: Clock, color: "text-accent-foreground", bg: "bg-accent/20" },
  atrasado: { icon: X, color: "text-destructive", bg: "bg-destructive/10" },
};

const statusIgrejaConfig = {
  ativo: { color: "bg-green-100 text-green-700" },
  pendente: { color: "bg-accent/20 text-accent-foreground" },
  inativo: { color: "bg-destructive/10 text-destructive" },
};

export default function Financeiro() {
  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground mt-1">Gestão financeira e mensalidades</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-5 w-5 mr-2" />
            Exportar
          </Button>
          <Button variant="gold">
            <Plus className="h-5 w-5 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Receita do Mês", value: "R$ 72.000", icon: Wallet, variant: "gold" as const },
          { title: "Despesas do Mês", value: "R$ 42.000", icon: CreditCard, variant: "default" as const },
          { title: "Saldo Atual", value: "R$ 30.000", icon: TrendingUp, variant: "primary" as const },
          { title: "Igrejas Inadimplentes", value: "3", icon: AlertTriangle, variant: "destructive" as const },
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
              <div className={cn(
                "p-3 rounded-xl",
                kpi.variant === "gold" && "gradient-gold",
                kpi.variant === "primary" && "gradient-primary",
                kpi.variant === "default" && "bg-secondary",
                kpi.variant === "destructive" && "bg-destructive/10"
              )}>
                <kpi.icon className={cn(
                  "h-6 w-6",
                  kpi.variant === "gold" && "text-navy",
                  kpi.variant === "primary" && "text-primary-foreground",
                  kpi.variant === "default" && "text-foreground",
                  kpi.variant === "destructive" && "text-destructive"
                )} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
          <div className="mb-6">
            <h2 className="text-lg font-display font-bold text-foreground">Fluxo de Caixa</h2>
            <p className="text-sm text-muted-foreground">Receitas vs Despesas</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={receitaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString()}`, ""]}
                />
                <Area
                  type="monotone"
                  dataKey="receita"
                  stackId="1"
                  stroke="hsl(43, 96%, 56%)"
                  fill="hsl(43, 96%, 56%)"
                  fillOpacity={0.3}
                  name="Receita"
                />
                <Area
                  type="monotone"
                  dataKey="despesa"
                  stackId="2"
                  stroke="hsl(225, 65%, 40%)"
                  fill="hsl(225, 65%, 40%)"
                  fillOpacity={0.3}
                  name="Despesa"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status das Igrejas */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="mb-6">
            <h2 className="text-lg font-display font-bold text-foreground">Status das Mensalidades</h2>
            <p className="text-sm text-muted-foreground">Por igreja</p>
          </div>
          <div className="space-y-3">
            {mockIgrejas.map((igreja, index) => (
              <div
                key={igreja.id}
                className="p-3 rounded-xl bg-secondary/50 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground truncate">{igreja.name}</span>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusIgrejaConfig[igreja.status].color)}>
                    {igreja.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{igreja.plan} • R$ {igreja.value}/mês</span>
                  <span className={cn(igreja.daysRemaining < 10 && "text-destructive font-medium")}>
                    {igreja.daysRemaining > 0 ? `${igreja.daysRemaining} dias restantes` : `${Math.abs(igreja.daysRemaining)} dias atrasado`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transações Recentes */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">Transações Recentes</h2>
            <p className="text-sm text-muted-foreground">Últimas movimentações</p>
          </div>
          <Button variant="outline" size="sm">Ver todas</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Descrição</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Unidade</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Data</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Valor</th>
              </tr>
            </thead>
            <tbody>
              {mockTransacoes.map((transacao, index) => {
                const status = statusConfig[transacao.status];
                const StatusIcon = status.icon;
                return (
                  <tr
                    key={transacao.id}
                    className="border-b border-border last:border-0 animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          transacao.type === "entrada" ? "bg-green-100" : "bg-destructive/10"
                        )}>
                          {transacao.type === "entrada" ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <CreditCard className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-foreground">{transacao.description}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{transacao.unit}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{transacao.date}</td>
                    <td className="py-4 px-4">
                      <div className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium", status.bg, status.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {transacao.status}
                      </div>
                    </td>
                    <td className={cn(
                      "py-4 px-4 text-right text-sm font-semibold",
                      transacao.type === "entrada" ? "text-green-600" : "text-destructive"
                    )}>
                      {transacao.type === "entrada" ? "+" : "-"} R$ {transacao.value.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
