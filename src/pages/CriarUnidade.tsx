import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Building2, Store, Church, ArrowLeft, Upload, Loader2, Eye, EyeOff, Users } from "lucide-react";
import { PhotoUpload } from "@/components/PhotoUpload";

export default function CriarUnidade() {
    const { nivel } = useParams<{ nivel: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Pega o ID da igreja pai do localStorage (setado na tela anterior)
    const parentChurchId = localStorage.getItem('creating_for_church');

    const [isLoading, setIsLoading] = useState(false);
    const [logoUrl, setLogoUrl] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        nome_fantasia: '',
        razao_social: '',
        cnpj: '',
        endereco: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: 'AC',
        cep: '',
        telefone: '',
        email: '',
        pastor_presidente_nome: '',
        pastor_presidente_cpf: '',
        pastor_email: '',      // Novo: Email para login
        pastor_senha: '',      // Novo: Senha para login
    });

    const nivelLabels: Record<string, string> = {
        sede: 'Sede',
        subsede: 'Subsede',
        congregacao: 'Congregação',
        celula: 'Célula'
    };

    const nivelIcons: Record<string, any> = {
        sede: <Building2 className="h-8 w-8" />,
        subsede: <Store className="h-8 w-8" />,
        congregacao: <Church className="h-8 w-8" />,
        celula: <Users className="h-8 w-8" />
    };

    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, "");
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        endereco: data.logradouro || "",
                        bairro: data.bairro || "",
                        cidade: data.localidade || "",
                        estado: data.uf || "",
                    }));
                    // Focar no número
                    const numeroInput = document.getElementById("numero");
                    if (numeroInput) {
                        numeroInput.focus();
                    }
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Criar igreja primeiro
            const { data: newChurch, error: churchError } = await supabase
                .from('churches')
                .insert({
                    nome_fantasia: formData.nome_fantasia,
                    razao_social: formData.razao_social,
                    cnpj: formData.cnpj || null, // CNPJ opcional
                    endereco: formData.endereco,
                    numero: formData.numero,
                    bairro: formData.bairro,
                    cidade: formData.cidade,
                    estado: formData.estado,
                    cep: formData.cep,
                    telefone: formData.telefone,
                    email: formData.email, // Email da igreja
                    pastor_presidente_nome: formData.pastor_presidente_nome,
                    pastor_presidente_cpf: formData.pastor_presidente_cpf,
                    nivel: nivel as any,
                    parent_church_id: parentChurchId,
                    logo_url: logoUrl || null,
                    is_approved: true,
                    is_active: true,
                    status_licenca: 'ATIVO',
                    data_vencimento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                })
                .select()
                .single();

            if (churchError) throw churchError;

            // 2. Se forneceu email e senha, criar usuário pastor
            if (formData.pastor_email && formData.pastor_senha && newChurch) {
                try {
                    // CRIAÇÃO WORKAROUND:
                    // Usamos um cliente temporário sem persistência de sessão para criar o usuário
                    // Isso evita deslogar o admin atual
                    const tempClient = createClient(
                        import.meta.env.VITE_SUPABASE_URL,
                        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                        {
                            auth: {
                                autoRefreshToken: false,
                                persistSession: false,
                                detectSessionInUrl: false
                            }
                        }
                    );

                    const { data: authData, error: authError } = await tempClient.auth.signUp({
                        email: formData.pastor_email,
                        password: formData.pastor_senha,
                        options: {
                            data: {
                                full_name: formData.pastor_presidente_nome,
                            }
                        }
                    });

                    if (authError) {
                        console.error("Erro ao criar usuário:", authError);
                        // Se falhar o auth, a igreja já foi criada. Avisamos o admin.
                        toast({
                            title: "⚠️ Igreja criada, mas erro no login",
                            description: `Erro ao criar usuário: ${authError.message}. A igreja foi criada com sucesso.`,
                            variant: "destructive",
                        });
                    } else if (authData.user) {
                        // Usuario criado (pode estar pendente de confirmação)
                        // Vinculamos ele como pastor desta igreja na tabela members
                        await supabase.from('members').insert({
                            user_id: authData.user.id, // ID do auth (mesmo se pendente)
                            full_name: formData.pastor_presidente_nome,
                            email: formData.pastor_email,
                            church_id: newChurch.id,
                            is_active: true,
                            cargo_eclesiastico: 'Pastor',
                            role: 'pastor'
                        });

                        // E damos permissão de admin na user_roles
                        await supabase.from('user_roles').insert({
                            user_id: authData.user.id,
                            church_id: newChurch.id,
                            role: 'pastor', // Role de pastor gerencia sua igreja
                        });
                    }
                } catch (userError) {
                    console.error("Erro ao criar conta do pastor:", userError);
                }
            }

            toast({
                title: "✅ Sucesso!",
                description: formData.pastor_email
                    ? `${nivelLabels[nivel!]} e login do pastor criados!`
                    : `${nivelLabels[nivel!]} criada com sucesso!`,
            });

            // Limpa localStorage e volta para detalhes da igreja pai
            localStorage.removeItem('creating_for_church');
            navigate(`/igreja/${parentChurchId}/detalhes`);
        } catch (error: any) {
            toast({
                title: "Erro ao criar",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <Button
                variant="ghost"
                className="mb-4"
                onClick={() => navigate('/painel-hierarquico')}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
            </Button>

            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary text-primary-foreground">
                            {nivelIcons[nivel!] || <Building2 className="h-8 w-8" />}
                        </div>
                        <div>
                            <CardTitle className="text-2xl">
                                Criar Nova {nivelLabels[nivel!] || nivel}
                            </CardTitle>
                            <CardDescription>
                                Preencha os dados da nova unidade subordinada
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Seção de Identidade */}
                        <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Upload className="h-4 w-4" /> Identidade Visual
                            </h3>
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="space-y-2">
                                    <Label>Logo da Igreja</Label>
                                    <PhotoUpload
                                        currentPhotoUrl={logoUrl}
                                        onPhotoUploaded={setLogoUrl}
                                        bucket="church-logos"
                                    />
                                    <p className="text-xs text-muted-foreground max-w-[200px]">
                                        Recomendado: 500x500px, PNG ou JPG.
                                    </p>
                                </div>
                                <div className="flex-1 space-y-4 w-full">
                                    <div>
                                        <Label htmlFor="nome_fantasia">Nome da Igreja *</Label>
                                        <Input
                                            id="nome_fantasia"
                                            value={formData.nome_fantasia}
                                            onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                                            placeholder={`Ex: Assembleia de Deus - ${nivelLabels[nivel!]}`}
                                            required
                                            className="text-lg font-medium"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email da Igreja</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="contato@igreja.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dados Legais e Endereço */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="razao_social">Razão Social</Label>
                                <Input
                                    id="razao_social"
                                    value={formData.razao_social}
                                    onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                                    placeholder="Razão social (opcional)"
                                />
                            </div>
                            <div>
                                <Label htmlFor="cnpj">CNPJ <span className="text-muted-foreground font-normal">(Opcional)</span></Label>
                                <Input
                                    id="cnpj"
                                    value={formData.cnpj}
                                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                                    placeholder="00.000.000/0000-00"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="endereco">Endereço *</Label>
                                <Input
                                    id="endereco"
                                    value={formData.endereco}
                                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                                    placeholder="Rua, Avenida..."
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="numero">Número *</Label>
                                <Input
                                    id="numero"
                                    value={formData.numero}
                                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                                    placeholder="123"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="bairro">Bairro *</Label>
                                <Input
                                    id="bairro"
                                    value={formData.bairro}
                                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                                    placeholder="Bairro"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="cidade">Cidade *</Label>
                                <Input
                                    id="cidade"
                                    value={formData.cidade}
                                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="estado">Estado *</Label>
                                <select
                                    id="estado"
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                    value={formData.estado}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                    required
                                >
                                    <option value="AC">Acre</option>
                                    <option value="AL">Alagoas</option>
                                    <option value="AP">Amapá</option>
                                    <option value="AM">Amazonas</option>
                                    <option value="BA">Bahia</option>
                                    <option value="CE">Ceará</option>
                                    <option value="DF">Distrito Federal</option>
                                    <option value="ES">Espírito Santo</option>
                                    <option value="GO">Goiás</option>
                                    <option value="MA">Maranhão</option>
                                    <option value="MT">Mato Grosso</option>
                                    <option value="MS">Mato Grosso do Sul</option>
                                    <option value="MG">Minas Gerais</option>
                                    <option value="PA">Pará</option>
                                    <option value="PB">Paraíba</option>
                                    <option value="PR">Paraná</option>
                                    <option value="PE">Pernambuco</option>
                                    <option value="PI">Piauí</option>
                                    <option value="RJ">Rio de Janeiro</option>
                                    <option value="RN">Rio Grande do Norte</option>
                                    <option value="RS">Rio Grande do Sul</option>
                                    <option value="RO">Rondônia</option>
                                    <option value="RR">Roraima</option>
                                    <option value="SC">Santa Catarina</option>
                                    <option value="SP">São Paulo</option>
                                    <option value="SE">Sergipe</option>
                                    <option value="TO">Tocantins</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="cep">CEP</Label>
                                <Input
                                    id="cep"
                                    value={formData.cep}
                                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                                    onBlur={handleCepBlur}
                                    placeholder="00000-000"
                                />
                            </div>
                            <div>
                                <Label htmlFor="telefone">Telefone</Label>
                                <Input
                                    id="telefone"
                                    value={formData.telefone}
                                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>

                        {/* Dados do Pastor e Acesso */}
                        <div className="pt-6 border-t space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Users className="h-5 w-5" /> Dados do Responsável & Acesso
                            </h3>
                            <div className="p-4 bg-blue-50 border-blue-100 border rounded-lg space-y-4">
                                <div>
                                    <Label htmlFor="pastor_presidente_nome">Nome do Pastor Responsável *</Label>
                                    <Input
                                        id="pastor_presidente_nome"
                                        value={formData.pastor_presidente_nome}
                                        onChange={(e) => setFormData({ ...formData, pastor_presidente_nome: e.target.value })}
                                        placeholder="Nome completo"
                                        required
                                        className="bg-white"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="pastor_presidente_cpf">CPF do Pastor *</Label>
                                        <Input
                                            id="pastor_presidente_cpf"
                                            value={formData.pastor_presidente_cpf}
                                            onChange={(e) => setFormData({ ...formData, pastor_presidente_cpf: e.target.value })}
                                            placeholder="000.000.000-00"
                                            required
                                            className="bg-white"
                                        />
                                    </div>
                                    <div>
                                        {/* Placeholder para alinhar grid se necessário */}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="pastor_email">Email de Login do Pastor</Label>
                                        <Input
                                            id="pastor_email"
                                            type="email"
                                            value={formData.pastor_email}
                                            onChange={(e) => setFormData({ ...formData, pastor_email: e.target.value })}
                                            placeholder="email@login.com"
                                            className="bg-white"
                                        />
                                        <p className="text-xs text-muted-foreground">Será usado para o pastor acessar o sistema.</p>
                                    </div>

                                    <div className="space-y-2 relative">
                                        <Label htmlFor="pastor_senha">Senha de Acesso</Label>
                                        <div className="relative">
                                            <Input
                                                id="pastor_senha"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.pastor_senha}
                                                onChange={(e) => setFormData({ ...formData, pastor_senha: e.target.value })}
                                                placeholder="Mínimo 6 caracteres"
                                                className="bg-white pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/painel-hierarquico')}
                                disabled={isLoading}
                                className="w-1/3"
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading} className="w-2/3 gradient-primary">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Criando Unidade...
                                    </>
                                ) : (
                                    `Confirmar Criação`
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
