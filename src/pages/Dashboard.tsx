import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Building2, Store, Church, Users, Plus, Eye, GraduationCap, BookOpen, Award, DollarSign } from "lucide-react";
import { Assinaturas, Modulos, PlanModules } from "@/entities/Assinaturas";

interface ChurchStats {
    sedes: number;
    subsedes: number;
    congregacoes: number;
    celulas: number;
}

interface Church {
    id: string;
    nome_fantasia: string;
    nivel: string;
    cidade: string;
    estado: string;
}

export default function Dashboard() {
    const navigate = useNavigate();
    const { churchId, userLevel, isAdmin, isSuperAdmin } = usePermissions();

    const [myChurch, setMyChurch] = useState<Church | null>(null);
    const [stats, setStats] = useState<ChurchStats>({ sedes: 0, subsedes: 0, congregacoes: 0, celulas: 0 });
    const [subordinadas, setSubordinadas] = useState<Church[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [subscription, setSubscription] = useState<any | null>(null);
    const [planModuleKeys, setPlanModuleKeys] = useState<string[]>([]);
    const [planModulesMeta, setPlanModulesMeta] = useState<{ key: string; name: string }[]>([]);

    useEffect(() => {
        if (churchId) {
            loadDashboardData();
        }
    }, [churchId]);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            // Carregar dados da igreja atual
            const { data: church } = await supabase
                .from('churches')
                .select('*')
                .eq('id', churchId)
                .single();

            setMyChurch(church);

            // Carregar estatísticas
            await loadStats();

            // Carregar unidades subordinadas diretas
            await loadSubordinadas();

            // Carregar assinatura
            const subs = await Assinaturas.listByChurch(churchId);
            const currentSub = subs[0] || null;
            setSubscription(currentSub);

            // Carregar módulos vinculados ao plano
            if (currentSub?.plan_id) {
                const links = await PlanModules.listByPlan(currentSub.plan_id);
                const keys = links.map(l => l.module_key);
                setPlanModuleKeys(keys);
                const allMods = await Modulos.list();
                setPlanModulesMeta(allMods.filter(m => keys.includes(m.key)));
            } else {
                setPlanModuleKeys([]);
                setPlanModulesMeta([]);
            }
        } catch (error) {
            console.error("Error loading dashboard:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadStats = async () => {
        // Contar sedes
        const { count: sedesCount } = await supabase
            .from('churches')
            .select('*', { count: 'exact', head: true })
            .eq('parent_church_id', churchId)
            .eq('nivel', 'sede');

        // Contar subsedes (diretas e indiretas)
        const { data: children } = await supabase
            .from('churches')
            .select('id')
            .eq('parent_church_id', churchId);

        const childIds = children?.map(c => c.id) || [];
        const allIds = [churchId, ...childIds];

        const { count: subsedesCount } = await supabase
            .from('churches')
            .select('*', { count: 'exact', head: true })
            .in('parent_church_id', allIds)
            .eq('nivel', 'subsede');

        const { count: congregacoesCount } = await supabase
            .from('churches')
            .select('*', { count: 'exact', head: true })
            .in('parent_church_id', allIds)
            .eq('nivel', 'congregacao');

        // @ts-ignore - cells table exists in DB but not in generated types yet
        const { count: celulasCount } = await supabase
            .from('cells')
            .select('*', { count: 'exact', head: true })
            .in('church_id', allIds)
            .eq('is_active', true);

        setStats({
            sedes: sedesCount || 0,
            subsedes: subsedesCount || 0,
            congregacoes: congregacoesCount || 0,
            celulas: celulasCount || 0,
        });
    };

    const loadSubordinadas = async () => {
        const { data } = await supabase
            .from('churches')
            .select('*')
            .eq('parent_church_id', churchId)
            .eq('is_active', true)
            .order('nivel')
            .order('nome_fantasia');

        setSubordinadas(data || []);
    };

    const getNivelIcon = (nivel: string) => {
        switch (nivel) {
            case 'matriz': return <Building className="h-6 w-6" />;
            case 'sede': return <Building2 className="h-6 w-6" />;
            case 'subsede': return <Store className="h-6 w-6" />;
            case 'congregacao': return <Church className="h-6 w-6" />;
            default: return <Building className="h-6 w-6" />;
        }
    };

    const getNivelColor = (nivel: string) => {
        switch (nivel) {
            case 'matriz': return 'bg-purple-500';
            case 'sede': return 'bg-blue-500';
            case 'subsede': return 'bg-green-500';
            case 'congregacao': return 'bg-orange-500';
            default: return 'bg-gray-500';
        }
    };

    const canCreateSede = isSuperAdmin || userLevel === 'matriz';
    const canCreateSubsede = isSuperAdmin || ['matriz', 'sede'].includes(userLevel);
    const canCreateCongregacao = isSuperAdmin || ['matriz', 'sede', 'subsede'].includes(userLevel);
    const canCreateCelula = isAdmin;

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                    <p className="mt-4">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!myChurch) {
        return (
            <div className="container mx-auto py-8">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-red-600">Igreja não encontrada</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header da Igreja */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-4 rounded-full ${getNivelColor(myChurch.nivel)} text-white`}>
                        {getNivelIcon(myChurch.nivel)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{myChurch.nome_fantasia}</h1>
                        <p className="text-muted-foreground">
                            {myChurch.cidade}, {myChurch.estado}
                        </p>
                        <Badge className="mt-2">{myChurch.nivel.toUpperCase()}</Badge>
                    </div>
                </div>

                {/* Indicadores de Assinatura */}
                {subscription && (
                    <Card className="border-2">
                        <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`w-3 h-3 rounded-full ${subscription.status === 'active' ? 'bg-green-500' : subscription.status === 'blocked' ? 'bg-red-600' : 'bg-yellow-500'}`}></span>
                                    <span className="text-sm">Status: <strong className="uppercase">{subscription.status}</strong></span>
                                    {subscription.last_payment_at && (
                                        <span className="text-sm text-muted-foreground">Último pagamento: {new Date(subscription.last_payment_at).toLocaleDateString('pt-BR')}</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => navigate('/financeiro-siscof')}>Ir para Financeiro</Button>
                                    {subscription.status === 'blocked' && (
                                        <Badge className="bg-destructive text-destructive-foreground">Bloqueado por inadimplência</Badge>
                                    )}
                                </div>
                            </div>
                            {subscription.status === 'pending' && (
                                <div className="mt-3">
                                    <Card className="border-yellow-300 bg-yellow-50">
                                        <CardContent className="py-3 flex items-center justify-between">
                                            <span className="text-sm">Assinatura pendente. Configure o pagamento para evitar bloqueio automático em 33 dias.</span>
                                            <Button size="sm" onClick={() => navigate('/financeiro-siscof')}>Configurar Pagamento</Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                            {subscription.plan_id && planModulesMeta.length > 0 && (
                                <div className="mt-3">
                                    <div className="text-sm mb-2">Módulos do plano</div>
                                    <div className="flex flex-wrap gap-2">
                                        {planModulesMeta.map(m => (
                                            <Badge key={m.key} variant="outline">{m.name}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* SISCOF - Escola de Culto */}
            <div className="mb-8">
                <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-3">
                            <GraduationCap className="h-8 w-8" />
                            SISCOF - Escola de Culto Online
                        </CardTitle>
                        <CardDescription className="text-blue-100">
                            Sistema Integrado de Ensino, Cursos e Certificação Digital
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <Button
                                variant="secondary"
                                className="h-20 flex flex-col gap-2"
                                onClick={() => navigate('/escola-culto')}
                            >
                                <BookOpen className="h-6 w-6" />
                                <span className="text-sm">Catálogo de Cursos</span>
                            </Button>
                            <Button
                                variant="secondary"
                                className="h-20 flex flex-col gap-2"
                                onClick={() => navigate('/escola-culto/meus-cursos')}
                            >
                                <GraduationCap className="h-6 w-6" />
                                <span className="text-sm">Meus Cursos</span>
                            </Button>
                            <Button
                                variant="secondary"
                                className="h-20 flex flex-col gap-2"
                                onClick={() => navigate('/escola-culto/certificados')}
                            >
                                <Award className="h-6 w-6" />
                                <span className="text-sm">Certificados</span>
                            </Button>
                            <Button
                                variant="secondary"
                                className="h-20 flex flex-col gap-2"
                                onClick={() => navigate('/financeiro-siscof')}
                            >
                                <DollarSign className="h-6 w-6" />
                                <span className="text-sm">Financeiro</span>
                            </Button>
                        </div>
                        <p className="text-sm text-blue-100">
                            ✨ Novo! Acesse cursos bíblicos, teológicos e ministeriais. Certificados digitais disponíveis.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Botões de Criação */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">🆕 Criar Unidades Subordinadas</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {canCreateSede && (
                        <Button
                            className="h-24 flex flex-col gap-2"
                            onClick={() => navigate('/criar-unidade/sede')}
                        >
                            <Building2 className="h-8 w-8" />
                            <span>Nova Sede</span>
                        </Button>
                    )}

                    {canCreateSubsede && (
                        <Button
                            className="h-24 flex flex-col gap-2"
                            variant="secondary"
                            onClick={() => navigate('/criar-unidade/subsede')}
                        >
                            <Store className="h-8 w-8" />
                            <span>Nova Subsede</span>
                        </Button>
                    )}

                    {canCreateCongregacao && (
                        <Button
                            className="h-24 flex flex-col gap-2"
                            variant="secondary"
                            onClick={() => navigate('/criar-unidade/congregacao')}
                        >
                            <Church className="h-8 w-8" />
                            <span>Nova Congregação</span>
                        </Button>
                    )}

                    {canCreateCelula && (
                        <Button
                            className="h-24 flex flex-col gap-2"
                            variant="secondary"
                            onClick={() => navigate('/cadastrar-celula')}
                        >
                            <Users className="h-8 w-8" />
                            <span>Nova Célula</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Estatísticas */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">📊 Estrutura Hierárquica</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-blue-500" />
                                Sedes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{stats.sedes}</p>
                            <p className="text-sm text-muted-foreground">unidades</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Store className="h-5 w-5 text-green-500" />
                                Subsedes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{stats.subsedes}</p>
                            <p className="text-sm text-muted-foreground">unidades</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Church className="h-5 w-5 text-orange-500" />
                                Congregações
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{stats.congregacoes}</p>
                            <p className="text-sm text-muted-foreground">unidades</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="h-5 w-5 text-purple-500" />
                                Células
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{stats.celulas}</p>
                            <p className="text-sm text-muted-foreground">grupos</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Lista de Unidades Subordinadas */}
            <div>
                <h2 className="text-xl font-semibold mb-4">🏘️ Unidades Subordinadas Diretas</h2>
                {subordinadas.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <p className="text-muted-foreground">
                                Nenhuma unidade subordinada cadastrada ainda.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Use os botões acima para criar novas unidades.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {subordinadas.map((church) => (
                            <Card key={church.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${getNivelColor(church.nivel)} text-white`}>
                                            {getNivelIcon(church.nivel)}
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{church.nome_fantasia}</CardTitle>
                                            <Badge variant="outline">{church.nivel}</Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {church.cidade}, {church.estado}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => navigate(`/igreja/${church.id}`)}
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        Ver Detalhes
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
