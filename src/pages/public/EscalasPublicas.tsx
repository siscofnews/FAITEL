import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ChevronDown, Church } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Schedule {
    id: string;
    tipo: string;
    titulo: string;
    data: string;
    horario: string | null;
    observacoes: string | null;
    responsavel: {
        full_name: string;
        foto_url: string | null;
    } | null;
    equipe: string[] | null;
}

interface ChurchUnit {
    id: string;
    nome_fantasia: string;
    nivel: string;
}

interface Cell {
    id: string;
    nome: string;
    tipo_celula: string;
    church_id: string;
}

const tipoLabels: Record<string, string> = {
    louvor: "🎵 Louvor",
    pregacao: "📖 Pregação",
    diacono: "🙏 Diácono",
    portaria: "🚪 Portaria",
    midia: "🎥 Mídia",
    infantil: "👶 Infantil",
    limpeza: "🧹 Limpeza",
    som: "🔊 Som",
    outro: "📋 Outro",
};

export default function EscalasPublicas() {
    const { igrejaId } = useParams<{ igrejaId: string }>();
    const [searchParams, setSearchParams] = useSearchParams();

    const [escalas, setEscalas] = useState<Schedule[]>([]);
    const [churches, setChurches] = useState<ChurchUnit[]>([]);
    const [cells, setCells] = useState<Cell[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedType, setSelectedType] = useState<'church' | 'cell'>('church');
    const [selectedUnitId, setSelectedUnitId] = useState<string>(igrejaId || '');
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        if (igrejaId) {
            loadChurchHierarchy();
            loadCells();
        }
    }, [igrejaId]);

    useEffect(() => {
        if (selectedUnitId) {
            loadSchedules();
        }
    }, [selectedUnitId, selectedMonth, selectedYear, selectedType]);

    const loadChurchHierarchy = async () => {
        try {
            // Buscar igreja matriz
            const { data: matriz } = await supabase
                .from('churches')
                .select('id, nome_fantasia, nivel')
                .eq('id', igrejaId)
                .single();

            if (!matriz) return;

            const allChurches: ChurchUnit[] = [matriz];

            // Buscar toda a hierarquia recursivamente
            const loadChildren = async (parentId: string) => {
                const { data: children } = await supabase
                    .from('churches')
                    .select('id, nome_fantasia, nivel, parent_church_id')
                    .eq('parent_church_id', parentId)
                    .eq('is_active', true)
                    .order('nome_fantasia');

                if (children && children.length > 0) {
                    allChurches.push(...children);
                    for (const child of children) {
                        await loadChildren(child.id);
                    }
                }
            };

            await loadChildren(igrejaId!);
            setChurches(allChurches);

            // Selecionar matriz por padrão
            if (!searchParams.get('unit')) {
                setSelectedUnitId(igrejaId!);
            }
        } catch (error) {
            console.error("Error loading hierarchy:", error);
        }
    };

    const loadCells = async () => {
        try {
            const { data } = await supabase
                .from('cells')
                .select('id, nome, tipo_celula, church_id')
                .or(`church_id.eq.${igrejaId}`)
                .eq('is_active', true)
                .order('nome');

            if (data) {
                setCells(data);
            }
        } catch (error) {
            console.error("Error loading cells:", error);
        }
    };

    const loadSchedules = async () => {
        setIsLoading(true);
        try {
            const startDate = startOfMonth(new Date(selectedYear, selectedMonth));
            const endDate = endOfMonth(new Date(selectedYear, selectedMonth));

            const { data, error } = await supabase
                .from('service_schedules')
                .select(`
          id,
          tipo,
          titulo,
          data,
          horario,
          observacoes,
          equipe,
          responsavel:responsavel_id(full_name, foto_url)
        `)
                .eq('church_id', selectedUnitId)
                .eq('is_public', true)
                .gte('data', format(startDate, 'yyyy-MM-dd'))
                .lte('data', format(endDate, 'yyyy-MM-dd'))
                .order('data')
                .order('horario');

            if (error) throw error;
            setEscalas(data || []);
        } catch (error) {
            console.error("Error loading schedules:", error);
            setEscalas([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnitChange = (value: string) => {
        setSelectedUnitId(value);
        setSearchParams({ unit: value });
    };

    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
            <div className="container mx-auto max-w-5xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <Calendar className="h-10 w-10 text-primary" />
                        <h1 className="text-4xl font-bold text-gray-800">Escalas de Serviço</h1>
                    </div>
                    <p className="text-gray-600">Confira a programação de serviços da igreja</p>
                </div>

                {/* Filtros */}
                <Card className="mb-6 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ChevronDown className="h-5 w-5" />
                            Filtrar Escalas
                        </CardTitle>
                        <CardDescription>
                            Selecione a unidade e o período para visualizar as escalas
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Tipo de Unidade */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tipo de Unidade</label>
                                <Select value={selectedType} onValueChange={(v) => setSelectedType(v as 'church' | 'cell')}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="church">
                                            <span className="flex items-center gap-2">
                                                <Church className="h-4 w-4" />
                                                Igreja (Matriz/Sede/Subsede/Congregação)
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="cell">
                                            <span className="flex items-center gap-2">
                                                👥 Célula
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Seletor de Unidade */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {selectedType === 'church' ? 'Selecionar Igreja' : 'Selecionar Célula'}
                                </label>
                                <Select value={selectedUnitId} onValueChange={handleUnitChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Escolha..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedType === 'church' ? (
                                            churches.map((church) => (
                                                <SelectItem key={church.id} value={church.id}>
                                                    <span className="flex items-center gap-2">
                                                        {church.nivel === 'matriz' && '🏛️'}
                                                        {church.nivel === 'sede' && '🏢'}
                                                        {church.nivel === 'subsede' && '🏪'}
                                                        {church.nivel === 'congregacao' && '⛪'}
                                                        {church.nome_fantasia}
                                                        <Badge variant="outline" className="ml-2">
                                                            {church.nivel}
                                                        </Badge>
                                                    </span>
                                                </SelectItem>
                                            ))
                                        ) : (
                                            cells.map((cell) => (
                                                <SelectItem key={cell.id} value={cell.id}>
                                                    <span className="flex items-center gap-2">
                                                        {cell.tipo_celula === 'jovens' && '🎸'}
                                                        {cell.tipo_celula === 'criancas' && '👶'}
                                                        {cell.tipo_celula === 'adolescentes' && '🎓'}
                                                        {cell.tipo_celula === 'homens' && '👔'}
                                                        {cell.tipo_celula === 'mulheres' && '👗'}
                                                        {cell.nome}
                                                    </span>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Mês e Ano */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Mês</label>
                                <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map((month, index) => (
                                            <SelectItem key={index} value={index.toString()}>
                                                {month}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ano</label>
                                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de Escalas */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                        <p className="mt-4 text-gray-600">Carregando escalas...</p>
                    </div>
                ) : escalas.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                Nenhuma escala encontrada
                            </h3>
                            <p className="text-gray-500">
                                Não há escalas cadastradas para {months[selectedMonth]} de {selectedYear}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {escalas.map((escala) => (
                            <Card key={escala.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-xl mb-1">{escala.titulo}</CardTitle>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {format(new Date(escala.data), "dd 'de' MMMM", { locale: ptBR })}
                                                </span>
                                                {escala.horario && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {escala.horario}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="text-sm">
                                            {tipoLabels[escala.tipo] || escala.tipo}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {escala.responsavel && (
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <span className="font-medium">Responsável:</span>
                                            <span>{escala.responsavel.full_name}</span>
                                        </div>
                                    )}

                                    {escala.equipe && escala.equipe.length > 0 && (
                                        <div>
                                            <p className="font-medium mb-2">Equipe:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {escala.equipe.map((pessoa, idx) => (
                                                    <Badge key={idx} variant="outline">
                                                        {pessoa}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {escala.observacoes && (
                                        <div className="pt-2 border-t">
                                            <p className="text-sm text-gray-600">{escala.observacoes}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
