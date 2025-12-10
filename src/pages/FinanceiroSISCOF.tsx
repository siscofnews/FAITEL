import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, DollarSign, CreditCard, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FinanceiroSISCOF() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [subscription, setSubscription] = useState<any>(null);
    const [plan, setPlan] = useState<any>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFinancialData();
    }, []);

    const loadFinancialData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            // Buscar igreja do usuário
            const { data: userRole } = await supabase
                .from("user_roles")
                .select("church_id")
                .eq("user_id", user.id)
                .single();

            if (!userRole?.church_id) throw new Error("Igreja não encontrada");

            // Buscar assinatura
            const { data: subData } = await supabase
                .from("church_subscriptions")
                .select("*, plan:subscription_plans(*)")
                .eq("church_id", userRole.church_id)
                .single();

            if (subData) {
                setSubscription(subData);
                setPlan(subData.plan);
            }

            // Buscar faturas
            const { data: invoicesData } = await supabase
                .from("invoices")
                .select("*")
                .eq("church_id", userRole.church_id)
                .order("created_at", { ascending: false })
                .limit(10);

            setInvoices(invoicesData || []);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar dados financeiros",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { label: string; className: string; icon: any }> = {
            active: { label: "Ativa", className: "bg-green-100 text-green-800", icon: CheckCircle2 },
            suspended: { label: "Suspensa", className: "bg-red-100 text-red-800", icon: AlertTriangle },
            cancelled: { label: "Cancelada", className: "bg-gray-100 text-gray-800", icon: Clock },
            expired: { label: "Expirada", className: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
        };
        return badges[status] || badges.active;
    };

    const getInvoiceStatusBadge = (status: string) => {
        const badges: Record<string, { label: string; className: string }> = {
            paid: { label: "Pago", className: "bg-green-100 text-green-800" },
            pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-800" },
            overdue: { label: "Atrasado", className: "bg-red-100 text-red-800" },
            cancelled: { label: "Cancelado", className: "bg-gray-100 text-gray-800" },
        };
        return badges[status] || badges.pending;
    };

    const totalPending = invoices
        .filter((i) => i.status === "pending" || i.status === "overdue")
        .reduce((sum, i) => sum + parseFloat(i.amount), 0);

    const totalPaid = invoices
        .filter((i) => i.status === "paid")
        .reduce((sum, i) => sum + parseFloat(i.amount), 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <DollarSign className="h-8 w-8 text-green-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Financeiro SISCOF</h1>
                            <p className="text-sm text-gray-600">Assinatura e Pagamentos</p>
                        </div>
                    </div>
                    <Button onClick={() => navigate("/")} variant="outline" size="sm">
                        <Home className="h-4 w-4 mr-2" />
                        Home
                    </Button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Carregando dados financeiros...</p>
                    </div>
                ) : (
                    <>
                        {/* Subscription Card */}
                        {subscription && plan && (
                            <Card className="mb-8 border-2 border-primary">
                                <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-2xl">Plano {plan.name}</CardTitle>
                                            <CardDescription className="text-green-100 mt-1">
                                                Assinatura {subscription.billing_cycle === "monthly" ? "Mensal" : "Anual"}
                                            </CardDescription>
                                        </div>
                                        <Badge
                                            className={getStatusBadge(subscription.status).className}
                                            variant="secondary"
                                        >
                                            {React.createElement(getStatusBadge(subscription.status).icon, {
                                                className: "h-3 w-3 mr-1",
                                            })}
                                            {getStatusBadge(subscription.status).label}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div>
                                            <p className="text-sm text-gray-600">Valor Mensal</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                R$ {parseFloat(plan.price_monthly).toFixed(2)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Próxima Cobrança</p>
                                            <p className="text-lg font-semibold">
                                                {subscription.next_billing_date
                                                    ? new Date(subscription.next_billing_date).toLocaleDateString("pt-BR")
                                                    : "N/A"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Último Pagamento</p>
                                            <p className="text-lg font-semibold">
                                                {subscription.last_payment_at
                                                    ? new Date(subscription.last_payment_at).toLocaleDateString("pt-BR")
                                                    : "Nenhum"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Plan Features */}
                                    <div className="border-t pt-4">
                                        <h4 className="font-semibold mb-3">Recursos do Plano:</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                <span>
                                                    {plan.max_students ? `${plan.max_students} alunos` : "Alunos ilimitados"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                <span>
                                                    {plan.max_courses ? `${plan.max_courses} cursos` : "Cursos ilimitados"}
                                                </span>
                                            </div>
                                            {plan.features && typeof plan.features === "object" && (
                                                <>
                                                    {plan.features.certificates && (
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                            <span>Certificados digitais</span>
                                                        </div>
                                                    )}
                                                    {plan.features.live_streaming && (
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                            <span>Transmissão ao vivo</span>
                                                        </div>
                                                    )}
                                                    {plan.features.bi_reports && (
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                            <span>Relatórios BI</span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-gray-600">Total Pago</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600">
                                        R$ {totalPaid.toFixed(2)}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-gray-600">Pendente</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-yellow-600">
                                        R$ {totalPending.toFixed(2)}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-gray-600">Faturas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{invoices.length}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Invoices List */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Histórico de Faturas</h2>

                            {invoices.length === 0 ? (
                                <Card className="p-12 text-center">
                                    <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-xl font-semibold mb-2">Nenhuma fatura encontrada</h3>
                                    <p className="text-gray-600">Suas faturas aparecerão aqui</p>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {invoices.map((invoice) => {
                                        const statusBadge = getInvoiceStatusBadge(invoice.status);
                                        return (
                                            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <div className="font-mono text-sm text-gray-600">
                                                                    #{invoice.invoice_number}
                                                                </div>
                                                                <Badge className={statusBadge.className}>
                                                                    {statusBadge.label}
                                                                </Badge>
                                                            </div>
                                                            <div className="text-sm text-gray-600 mt-1">
                                                                Vencimento:{" "}
                                                                {new Date(invoice.due_date).toLocaleDateString("pt-BR")}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-bold text-green-600">
                                                                R$ {parseFloat(invoice.amount).toFixed(2)}
                                                            </div>
                                                            {invoice.status === "pending" && (
                                                                <Button size="sm" className="mt-2">
                                                                    <CreditCard className="h-4 w-4 mr-2" />
                                                                    Pagar via PIX
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* PIX Info */}
                        <Card className="mt-8 bg-green-50 border-green-200">
                            <CardHeader>
                                <CardTitle className="text-green-900">Chave PIX para Pagamento</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-white p-4 rounded border border-green-200">
                                    <p className="text-sm text-gray-600 mb-2">Chave PIX (Aleatória):</p>
                                    <p className="font-mono text-lg font-bold text-green-700">
                                        c4f1fb32-777f-42f2-87da-6d0aceff31a3
                                    </p>
                                </div>
                                <p className="text-sm text-gray-700 mt-4">
                                    Use esta chave para realizar o pagamento e envie o comprovante para confirmação.
                                </p>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}
