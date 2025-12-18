import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Building2, Save, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CadastrarFaculdade() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>("");

    const [formData, setFormData] = useState({
        nome_fantasia: "",
        razao_social: "",
        cnpj: "",
        email: "",
        telefone: "",
        diretor_nome: "",
        diretor_email: "",
        endereco: "",
        cidade: "",
        estado: "",
        cep: "",
        site: ""
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        setLogo(null);
        setLogoPreview("");
    };

    const uploadLogo = async (faculdadeId: string): Promise<string | null> => {
        if (!logo) return null;

        try {
            const fileExt = logo.name.split('.').pop();
            const fileName = `${faculdadeId}.${fileExt}`;
            const filePath = `logos-faculdades/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('logotipos de igrejas')
                .upload(filePath, logo, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('logotipos de igrejas')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Erro ao fazer upload da logo:', error);
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Primeiro inserir a faculdade para obter o ID
            const { data: faculdadeData, error: insertError } = await supabase
                .from('ead_faculdades')
                .insert({
                    ...formData,
                    status: 'ativo'
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Fazer upload da logo se houver
            let logoUrl = null;
            if (logo && faculdadeData) {
                logoUrl = await uploadLogo(faculdadeData.id);

                // Atualizar com a URL da logo
                if (logoUrl) {
                    await supabase
                        .from('ead_faculdades')
                        .update({ logo_url: logoUrl })
                        .eq('id', faculdadeData.id);
                }
            }

            toast({
                title: "Faculdade cadastrada!",
                description: `${formData.nome_fantasia} foi cadastrada com sucesso${logoUrl ? ' com logo!' : '.'}`
            });

            // Limpar formulário
            setFormData({
                nome_fantasia: "",
                razao_social: "",
                cnpj: "",
                email: "",
                telefone: "",
                diretor_nome: "",
                diretor_email: "",
                endereco: "",
                cidade: "",
                estado: "",
                cep: "",
                site: ""
            });
            setLogo(null);
            setLogoPreview("");

        } catch (error: any) {
            toast({
                title: "Erro ao cadastrar faculdade",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Building2 className="w-8 h-8" />
                    Cadastrar Faculdade
                </h1>
                <p className="text-muted-foreground mt-2">
                    Registre uma nova instituição de ensino no sistema EAD
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Logo da Faculdade */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Logo da Faculdade</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center gap-4">
                            {logoPreview ? (
                                <div className="relative">
                                    <img
                                        src={logoPreview}
                                        alt="Preview da logo"
                                        className="w-48 h-48 object-contain border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2"
                                        onClick={removeLogo}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                                    <div className="text-center">
                                        <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500">Clique abaixo para adicionar a logo</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <Input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                                <Label htmlFor="logo-upload">
                                    <Button type="button" variant="outline" asChild>
                                        <span className="cursor-pointer">
                                            <Upload className="w-4 h-4 mr-2" />
                                            {logo ? "Trocar Logo" : "Escolher Logo"}
                                        </span>
                                    </Button>
                                </Label>
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                Formatos aceitos: JPG, PNG, SVG<br />
                                Tamanho máximo: 2MB
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Dados da Instituição */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Dados da Instituição</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label htmlFor="nome_fantasia">Nome Fantasia *</Label>
                                <Input
                                    id="nome_fantasia"
                                    required
                                    value={formData.nome_fantasia}
                                    onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                                    placeholder="Ex: FAITEL - Faculdade Internacional Teológica de Líderes"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="razao_social">Razão Social</Label>
                                <Input
                                    id="razao_social"
                                    value={formData.razao_social}
                                    onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                                    placeholder="Razão social da instituição"
                                />
                            </div>

                            <div>
                                <Label htmlFor="cnpj">CNPJ *</Label>
                                <Input
                                    id="cnpj"
                                    required
                                    value={formData.cnpj}
                                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                                    placeholder="00.000.000/0000-00"
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">Email da Instituição *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="contato@faculdade.com.br"
                                />
                            </div>

                            <div>
                                <Label htmlFor="telefone">Telefone</Label>
                                <Input
                                    id="telefone"
                                    value={formData.telefone}
                                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                    placeholder="(00) 0000-0000"
                                />
                            </div>

                            <div>
                                <Label htmlFor="site">Site</Label>
                                <Input
                                    id="site"
                                    value={formData.site}
                                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                                    placeholder="https://www.faculdade.com.br"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Diretor */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Diretor da Faculdade</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="diretor_nome">Nome do Diretor *</Label>
                                <Input
                                    id="diretor_nome"
                                    required
                                    value={formData.diretor_nome}
                                    onChange={(e) => setFormData({ ...formData, diretor_nome: e.target.value })}
                                    placeholder="Nome completo do diretor"
                                />
                            </div>

                            <div>
                                <Label htmlFor="diretor_email">Email do Diretor</Label>
                                <Input
                                    id="diretor_email"
                                    type="email"
                                    value={formData.diretor_email}
                                    onChange={(e) => setFormData({ ...formData, diretor_email: e.target.value })}
                                    placeholder="diretor@faculdade.com.br"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Endereço */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Endereço</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label htmlFor="endereco">Endereço Completo</Label>
                                <Textarea
                                    id="endereco"
                                    value={formData.endereco}
                                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                                    placeholder="Rua, Número, Complemento, Bairro"
                                    rows={2}
                                />
                            </div>

                            <div>
                                <Label htmlFor="cidade">Cidade</Label>
                                <Input
                                    id="cidade"
                                    value={formData.cidade}
                                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                                    placeholder="Cidade"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label htmlFor="estado">Estado</Label>
                                    <Input
                                        id="estado"
                                        value={formData.estado}
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                        placeholder="UF"
                                        maxLength={2}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="cep">CEP</Label>
                                    <Input
                                        id="cep"
                                        value={formData.cep}
                                        onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                                        placeholder="00000-000"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-3 justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(-1)}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? "Salvando..." : "Cadastrar Faculdade"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
