import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ChurchIcon, Loader2, CheckCircle2 } from "lucide-react";
import { PhotoUpload } from "@/components/PhotoUpload";

export default function CadastroMembroPublico() {
    const { matrizId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [matriz, setMatriz] = useState<any>(null);
    const [hierarchyUnits, setHierarchyUnits] = useState<any[]>([]);
    const [cells, setCells] = useState<any[]>([]);

    const [photoUrl, setPhotoUrl] = useState<string>('');

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        telefone: '',
        data_nascimento: '',
        genero: '',
        estado_civil: '',
        unit_id: matrizId || '', // Igreja onde congrega
        cell_id: '',
    });

    useEffect(() => {
        loadMatrizData();
    }, [matrizId]);

    const loadMatrizData = async () => {
        try {
            if (!matrizId) {
                throw new Error("ID da igreja não fornecido");
            }

            // Carregar dados da matriz
            const { data: matrizData, error: matrizError } = await supabase
                .from('churches')
                .select('*')
                .eq('id', matrizId)
                .maybeSingle();

            if (matrizError) throw matrizError;
            if (!matrizData) throw new Error("Igreja não encontrada");

            setMatriz(matrizData);

            // Carregar toda hierarquia subordinada
            const subordinates = await getAllSubordinateChurches(matrizId!);
            const allUnits = [matrizData, ...subordinates];
            setHierarchyUnits(allUnits);

            // Carregar todas as células da hierarquia
            const allIds = allUnits.map(u => u.id);
            const { data: cellsData } = await supabase
                .from('cells')
                .select('*')
                .in('church_id', allIds)
                .eq('is_active', true);

            setCells(cellsData || []);
            setFormData(prev => ({ ...prev, unit_id: matrizId || '' }));
        } catch (error) {
            console.error("Error loading data:", error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar os dados da igreja",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getAllSubordinateChurches = async (churchId: string): Promise<any[]> => {
        const { data: children } = await supabase
            .from('churches')
            .select('*')
            .eq('parent_church_id', churchId)
            .eq('is_active', true);

        if (!children || children.length === 0) return [];

        const allChildren = [...children];
        for (const child of children) {
            const grandChildren = await getAllSubordinateChurches(child.id);
            allChildren.push(...grandChildren);
        }
        return allChildren;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validações antes de enviar
        if (!formData.full_name.trim()) {
            toast({
                title: "❌ Nome obrigatório",
                description: "Por favor, preencha seu nome completo",
                variant: "destructive",
            });
            return;
        }

        if (!photoUrl) {
            toast({
                title: "❌ Foto obrigatória",
                description: "Por favor, envie uma foto sua",
                variant: "destructive",
            });
            return;
        }

        if (!formData.unit_id) {
            toast({
                title: "❌ Selecione onde congrega",
                description: "Por favor, escolha a igreja/congregação",
                variant: "destructive",
            });
            return;
        }

        setSubmitting(true);

        try {
            // Validar se a unidade existe antes de tentar inserir
            const { data: unitExists } = await supabase
                .from('churches')
                .select('id')
                .eq('id', formData.unit_id)
                .single();

            if (!unitExists) {
                throw new Error("Igreja selecionada não encontrada");
            }

            // Se célula foi selecionada, validar
            if (formData.cell_id) {
                const { data: cellExists } = await supabase
                    .from('cells')
                    .select('id')
                    .eq('id', formData.cell_id)
                    .single();

                if (!cellExists) {
                    throw new Error("Célula selecionada não encontrada");
                }
            }

            // Criar membro com tratamento de erros específicos
            const memberData = {
                full_name: formData.full_name.trim(),
                email: formData.email?.trim() || null,
                telefone: formData.telefone?.trim() || null,
                data_nascimento: formData.data_nascimento || null,
                genero: formData.genero || null,
                estado_civil: formData.estado_civil || null,
                cargo_eclesiastico: 'Membro',
                church_id: formData.unit_id,
                cell_id: formData.cell_id || null,
                photo_url: photoUrl,
                is_active: false, // Aguardando aprovação
            };

            const { data: newMember, error: memberError } = await supabase
                .from('members')
                .insert(memberData)
                .select()
                .single();

            if (memberError) {
                console.error("Member insert error:", memberError);

                // Tratamento de erros específicos
                if (memberError.code === '23505') {
                    throw new Error("Este e-mail já está cadastrado");
                } else if (memberError.code === '23503') {
                    throw new Error("Dados inválidos. Verifique as informações");
                } else {
                    throw new Error(memberError.message || "Erro ao cadastrar membro");
                }
            }

            if (!newMember) {
                throw new Error("Não foi possível criar o cadastro");
            }

            setSuccess(true);
            toast({
                title: "✅ Solicitação enviada!",
                description: `Seu cadastro na ${matriz?.nome_fantasia} foi enviado para aprovação.`,
            });

        } catch (error: any) {
            console.error("Error submitting:", error);
            toast({
                title: "❌ Erro ao cadastrar",
                description: error.message || "Tente novamente mais tarde ou entre em contato conosco",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const publicUrl = `${window.location.origin}/cadastro-membro/${matrizId}`;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
                <Card className="max-w-md w-full text-center">
                    <CardContent className="pt-12 pb-8">
                        <CheckCircle2 className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Solicitação Recebida!</h2>
                        <p className="text-muted-foreground mb-6">
                            Seu cadastro foi enviado com sucesso e está aguardando aprovação da secretaria da igreja.<br /><br />
                            Em breve você receberá a confirmação.
                        </p>
                        <Button onClick={() => window.location.reload()}>
                            Nova Solicitação
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        {matriz?.logo_url ? (
                            <img src={matriz.logo_url} alt="Logo" className="h-16 w-16 rounded-full object-cover border-2 border-blue-500" />
                        ) : (
                            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                                <ChurchIcon className="h-8 w-8 text-blue-600" />
                            </div>
                        )}
                        <div className="text-left">
                            <h1 className="text-3xl font-bold text-gray-900">{matriz?.nome_fantasia}</h1>
                            <p className="text-gray-600">Cadastro de Membros</p>
                        </div>
                    </div>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Preencha o formulário abaixo para fazer sua ficha de membro
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Formulário */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Dados Pessoais</CardTitle>
                            <CardDescription>Preencha suas informações</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Nome */}
                                <div>
                                    <Label htmlFor="full_name">Nome Completo *</Label>
                                    <Input
                                        id="full_name"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        placeholder="Seu nome completo"
                                        required
                                    />
                                </div>

                                {/* Foto */}
                                <div>
                                    <Label>Foto *</Label>
                                    <PhotoUpload
                                        onPhotoUploaded={setPhotoUrl}
                                        currentPhotoUrl={photoUrl}
                                    />
                                </div>

                                {/* Email e Telefone */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="email">E-mail</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="telefone">Telefone/WhatsApp</Label>
                                        <Input
                                            id="telefone"
                                            value={formData.telefone}
                                            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                            placeholder="(11) 99999-9999"
                                        />
                                    </div>
                                </div>

                                {/* Data Nascimento e Gênero */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                                        <Input
                                            id="data_nascimento"
                                            type="date"
                                            value={formData.data_nascimento}
                                            onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="genero">Gênero</Label>
                                        <Select value={formData.genero} onValueChange={(value) => setFormData({ ...formData, genero: value })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Masculino">Masculino</SelectItem>
                                                <SelectItem value="Feminino">Feminino</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Estado Civil */}
                                <div>
                                    <Label htmlFor="estado_civil">Estado Civil</Label>
                                    <Select value={formData.estado_civil} onValueChange={(value) => setFormData({ ...formData, estado_civil: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
                                            <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                                            <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                                            <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Unidade onde congrega */}
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-4">📍 Onde você congrega?</h3>

                                    <div className="mb-4">
                                        <Label htmlFor="unit_id">Igreja/Congregação *</Label>
                                        <Select
                                            value={formData.unit_id}
                                            onValueChange={(value) => setFormData({ ...formData, unit_id: value, cell_id: '' })}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione onde você congrega" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {hierarchyUnits.map((unit) => (
                                                    <SelectItem key={unit.id} value={unit.id}>
                                                        {unit.nome_fantasia} ({unit.nivel})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Escolha se congrega na Matriz, Sede, Subsede ou Congregação
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="cell_id">Célula (Opcional)</Label>
                                        <Select
                                            value={formData.cell_id}
                                            onValueChange={(value) => setFormData({ ...formData, cell_id: value })}
                                            disabled={!formData.unit_id}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={
                                                    !formData.unit_id
                                                        ? "Selecione a igreja primeiro"
                                                        : cells.filter(c => c.church_id === formData.unit_id).length === 0
                                                            ? "Nenhuma célula nesta unidade"
                                                            : "Selecione sua célula"
                                                } />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cells
                                                    .filter(cell => cell.church_id === formData.unit_id)
                                                    .map((cell) => (
                                                        <SelectItem key={cell.id} value={cell.id}>
                                                            {cell.nome} ({cell.tipo_celula})
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Célula vinculada à unidade selecionada acima
                                        </p>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" size="lg" disabled={submitting || !photoUrl}>
                                    {submitting ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Cadastrando...
                                        </>
                                    ) : (
                                        "Finalizar Cadastro"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* QR Code e Link */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">📱 QR Code</CardTitle>
                                <CardDescription>Compartilhe este link</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center">
                                <div className="bg-white p-4 rounded-lg">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`}
                                        alt="QR Code"
                                        className="w-[200px] h-[200px]"
                                    />
                                </div>
                                <p className="text-xs text-center text-muted-foreground mt-4">
                                    Escaneie para acessar o formulário
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">🔗 Link Direto</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-gray-100 p-3 rounded-lg text-xs break-all mb-3">
                                    {publicUrl}
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        navigator.clipboard.writeText(publicUrl);
                                        toast({ title: "✅ Link copiado!" });
                                    }}
                                >
                                    Copiar Link
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
