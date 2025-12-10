import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Church } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";

interface CellFormData {
    nome: string;
    church_id: string;
    tipo_celula: string;
    dia_reuniao: string;
    horario_reuniao: string;
    cep: string;
    endereco: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    descricao: string;
    lider_nome: string;
    funcao_lider: string;
    lider_email: string;
    lider_telefone: string;
}

const estados = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
    "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function CadastrarCelula() {
    const [formData, setFormData] = useState<CellFormData>({
        nome: "",
        church_id: "",
        tipo_celula: "",
        dia_reuniao: "",
        horario_reuniao: "",
        cep: "",
        endereco: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "",
        descricao: "",
        lider_nome: "",
        funcao_lider: "",
        lider_email: "",
        lider_telefone: "",
    });

    const [churches, setChurches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingChurches, setIsLoadingChurches] = useState(true);

    const { toast } = useToast();
    const navigate = useNavigate();
    const { userLevel, churchId, accessibleChurches, isAdmin } = usePermissions();

    useEffect(() => {
        // Se tem church_id do localStorage (vindo da página de detalhes), usa ele
        const storedChurchId = localStorage.getItem('creating_for_church');
        if (storedChurchId) {
            setFormData(prev => ({ ...prev, church_id: storedChurchId }));
            setIsLoadingChurches(false);
        } else {
            loadAccessibleChurches();
        }
    }, []);

    const loadAccessibleChurches = async () => {
        setIsLoadingChurches(true);
        try {
            // Buscar igrejas acessíveis ao usuário
            const { data, error } = await supabase
                .from('churches')
                .select('id, nome_fantasia, nivel')
                .in('id', accessibleChurches.length > 0 ? accessibleChurches : [churchId])
                .eq('is_approved', true)
                .eq('is_active', true)
                .order('nivel');

            if (error) throw error;

            setChurches(data || []);

            // Se só tem uma igreja, seleciona automaticamente
            if (data && data.length === 1) {
                setFormData(prev => ({ ...prev, church_id: data[0].id }));
            } else if (churchId) {
                setFormData(prev => ({ ...prev, church_id: churchId }));
            }
        } catch (error: any) {
            console.error("Error loading churches:", error);
            toast({
                title: "Erro ao carregar igrejas",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoadingChurches(false);
        }
    };

    const fetchAddressByCep = async (cep: string) => {
        const cleanCep = cep.replace(/\D/g, "");
        if (cleanCep.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    endereco: data.logradouro || prev.endereco,
                    bairro: data.bairro || prev.bairro,
                    cidade: data.localidade || prev.cidade,
                    estado: data.uf || prev.estado,
                }));
                document.getElementById("numero")?.focus();
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nome || !formData.church_id || !formData.tipo_celula) {
            toast({
                title: "Campos obrigatórios",
                description: "Preencha nome, igreja e tipo de célula",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('cells')
                .insert({
                    nome: formData.nome,
                    church_id: formData.church_id,
                    tipo_celula: formData.tipo_celula,
                    dia_reuniao: formData.dia_reuniao,
                    horario_reuniao: formData.horario_reuniao,
                    endereco_reuniao: `${formData.endereco}, ${formData.numero} - ${formData.bairro}`, // Legacy support
                    cep: formData.cep,
                    endereco: formData.endereco,
                    numero: formData.numero,
                    bairro: formData.bairro,
                    cidade: formData.cidade,
                    estado: formData.estado,
                    descricao: formData.descricao,
                    lider_nome: formData.lider_nome,
                    funcao_lider: formData.funcao_lider,
                    lider_email: formData.lider_email,
                    lider_telefone: formData.lider_telefone,
                    is_active: true,
                })
                .select()
                .single();

            if (error) throw error;

            toast({
                title: "✅ Célula cadastrada!",
                description: `${formData.nome} foi cadastrada com sucesso.`,
            });

            // Limpa localStorage e volta para detalhes da igreja
            const churchId = localStorage.getItem('creating_for_church');
            localStorage.removeItem('creating_for_church');
            if (churchId) {
                navigate(`/igreja/${churchId}/detalhes`);
            } else {
                navigate('/igrejas');
            }
        } catch (error: any) {
            console.error("Error creating cell:", error);
            toast({
                title: "Erro ao cadastrar célula",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof CellFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!isAdmin) {
        return (
            <div className="container mx-auto py-8">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-800">
                            ⚠️ Apenas administradores podem cadastrar células.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Church className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">Cadastrar Célula</h1>
                </div>
                <p className="text-muted-foreground">
                    Crie uma nova célula para sua igreja (jovens, crianças, homens, mulheres, etc)
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados da Célula</CardTitle>
                    <CardDescription>
                        Preencha as informações da célula e do líder responsável
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nome da Célula */}
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome da Célula *</Label>
                            <Input
                                id="nome"
                                placeholder="Ex: Célula de Jovens - Zona Norte"
                                value={formData.nome}
                                onChange={(e) => handleChange('nome', e.target.value)}
                                required
                            />
                        </div>

                        {/* Dados do Líder */}
                        <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                            <h3 className="font-semibold flex items-center gap-2">
                                👤 Dados do Líder
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="lider_nome">Líder de Célula</Label>
                                    <Input
                                        id="lider_nome"
                                        placeholder="Nome do Líder"
                                        value={formData.lider_nome}
                                        onChange={(e) => handleChange('lider_nome', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="funcao_lider">Função / Cargo</Label>
                                    <Select
                                        value={formData.funcao_lider}
                                        onValueChange={(value) => handleChange('funcao_lider', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o cargo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Líder">Líder</SelectItem>
                                            <SelectItem value="Co-Líder">Co-Líder</SelectItem>
                                            <SelectItem value="Anfitrião">Anfitrião</SelectItem>
                                            <SelectItem value="Secretário">Secretário</SelectItem>
                                            <SelectItem value="Tesoureiro">Tesoureiro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lider_email">Email do Líder</Label>
                                    <Input
                                        id="lider_email"
                                        type="email"
                                        placeholder="email@exemplo.com"
                                        value={formData.lider_email}
                                        onChange={(e) => handleChange('lider_email', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lider_telefone">Telefone / WhatsApp</Label>
                                    <Input
                                        id="lider_telefone"
                                        placeholder="(00) 00000-0000"
                                        value={formData.lider_telefone}
                                        onChange={(e) => handleChange('lider_telefone', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Igreja */}
                        <div className="space-y-2">
                            <Label htmlFor="church_id">Igreja / Unidade *</Label>
                            <Select
                                value={formData.church_id}
                                onValueChange={(value) => handleChange('church_id', value)}
                                disabled={isLoadingChurches || churches.length === 1}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a igreja" />
                                </SelectTrigger>
                                <SelectContent>
                                    {churches.map((church) => (
                                        <SelectItem key={church.id} value={church.id}>
                                            {church.nome_fantasia} ({church.nivel})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                A célula será vinculada a esta unidade
                            </p>
                        </div>

                        {/* Tipo de Célula */}
                        <div className="space-y-2">
                            <Label htmlFor="tipo_celula">Tipo de Célula *</Label>
                            <Select
                                value={formData.tipo_celula}
                                onValueChange={(value) => handleChange('tipo_celula', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="criancas">👶 Crianças</SelectItem>
                                    <SelectItem value="jovens">🎸 Jovens</SelectItem>
                                    <SelectItem value="adolescentes">🎓 Adolescentes</SelectItem>
                                    <SelectItem value="homens">👔 Homens</SelectItem>
                                    <SelectItem value="mulheres">👗 Mulheres</SelectItem>
                                    <SelectItem value="casais">💑 Casais</SelectItem>
                                    <SelectItem value="geral">📖 Geral</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Dia da Reunião */}
                        <div className="space-y-2">
                            <Label htmlFor="dia_reuniao">Dia da Reunião</Label>
                            <Select
                                value={formData.dia_reuniao}
                                onValueChange={(value) => handleChange('dia_reuniao', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o dia" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Segunda-feira">Segunda-feira</SelectItem>
                                    <SelectItem value="Terça-feira">Terça-feira</SelectItem>
                                    <SelectItem value="Quarta-feira">Quarta-feira</SelectItem>
                                    <SelectItem value="Quinta-feira">Quinta-feira</SelectItem>
                                    <SelectItem value="Sexta-feira">Sexta-feira</SelectItem>
                                    <SelectItem value="Sábado">Sábado</SelectItem>
                                    <SelectItem value="Domingo">Domingo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Horário */}
                        <div className="space-y-2">
                            <Label htmlFor="horario_reuniao">Horário da Reunião</Label>
                            <Input
                                id="horario_reuniao"
                                type="time"
                                value={formData.horario_reuniao}
                                onChange={(e) => handleChange('horario_reuniao', e.target.value)}
                            />
                        </div>

                        {/* Endereço da Reunião */}
                        {/* Endereço Detalhado */}
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                Endereço da Reunião
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="cep">CEP</Label>
                                    <Input
                                        id="cep"
                                        placeholder="00000-000"
                                        value={formData.cep}
                                        onChange={(e) => handleChange('cep', e.target.value)}
                                        onBlur={(e) => fetchAddressByCep(e.target.value)}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="endereco">Endereço</Label>
                                    <Input
                                        id="endereco"
                                        placeholder="Rua, Avenida..."
                                        value={formData.endereco}
                                        onChange={(e) => handleChange('endereco', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="numero">Número</Label>
                                    <Input
                                        id="numero"
                                        placeholder="123"
                                        value={formData.numero}
                                        onChange={(e) => handleChange('numero', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="bairro">Bairro</Label>
                                    <Input
                                        id="bairro"
                                        placeholder="Bairro"
                                        value={formData.bairro}
                                        onChange={(e) => handleChange('bairro', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="cidade">Cidade</Label>
                                    <Input
                                        id="cidade"
                                        placeholder="Cidade"
                                        value={formData.cidade}
                                        onChange={(e) => handleChange('cidade', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="estado">Estado</Label>
                                    <Select
                                        value={formData.estado}
                                        onValueChange={(value) => handleChange("estado", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="UF" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {estados.map((uf) => (
                                                <SelectItem key={uf} value={uf}>
                                                    {uf}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Descrição */}
                        <div className="space-y-2">
                            <Label htmlFor="descricao">Descrição</Label>
                            <Textarea
                                id="descricao"
                                placeholder="Informações adicionais sobre a célula..."
                                value={formData.descricao}
                                onChange={(e) => handleChange('descricao', e.target.value)}
                                rows={4}
                            />
                        </div>

                        {/* Botões */}
                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Cadastrando...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Cadastrar Célula
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    const churchId = localStorage.getItem('creating_for_church');
                                    if (churchId) {
                                        navigate(`/igreja/${churchId}/detalhes`);
                                    } else {
                                        navigate('/igrejas');
                                    }
                                }}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Informações sobre permissões */}
            <Card className="mt-6 border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-2">📋 Sobre células:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Você pode criar células para sua igreja e todas as filhas</li>
                            <li>Células são grupos específicos (jovens, crianças, homens, etc)</li>
                            <li>Cada célula pode ter seu próprio líder e local de reunião</li>
                            <li>Membros podem se vincular a células no cadastro</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
