import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Save, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CadastrarPolo() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [faculdades, setFaculdades] = useState<any[]>([]);
    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>("");

    const [formData, setFormData] = useState({
        faculdade_id: "",
        nome: "",
        cnpj: "",
        email: "",
        telefone: "",
        diretor_nome: "",
        diretor_email: "",
        endereco: "",
        cidade: "",
        estado: "",
        cep: ""
    });

    useEffect(() => {
        fetchFaculdades();
    }, []);

    const fetchFaculdades = async () => {
        const { data } = await supabase
            .from('ead_faculdades')
            .select('id, nome_fantasia')
            .eq('status', 'ativo')
            .order('nome_fantasia');

        setFaculdades(data || []);
    };

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

    const uploadLogo = async (poloId: string): Promise<string | null> => {
        if (!logo) return null;

        try {
            const fileExt = logo.name.split('.').pop();
            const fileName = `${poloId}.${fileExt}`;
            const filePath = `logos-polos/${fileName}`;

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
            const { data: poloData, error: insertError } = await supabase
                .from('ead_polos')
                .insert({
                    ...formData,
                    status: 'ativo'
                })
                .select()
                .single();

            if (insertError) throw insertError;

            if (logo && poloData) {
                const logoUrl = await uploadLogo(poloData.id);
                if (logoUrl) {
                    await supabase
                        .from('ead_polos')
                        .update({ logo_url: logoUrl })
                        .eq('id', poloData.id);
                }
            }

            toast({
                title: "Polo cadastrado!",
                description: `${formData.nome} foi cadastrado com sucesso.`
            });

            navigate('/ead/admin/polos');
        } catch (error: any) {
            toast({
                title: "Erro ao cadastrar polo",
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
                    <MapPin className="w-8 h-8" />
                    Cadastrar Polo
                </h1>
                <p className="text-muted-foreground mt-2">
                    Registre um novo polo vinculado a uma faculdade
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Logo do Polo */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Logo do Polo</CardTitle>
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
                                        <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-2" />
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
                        </div>
                    </CardContent>
                </Card>

                {/* Vinculação e Dados */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Dados do Polo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label htmlFor="faculdade_id">Faculdade *</Label>
                                <Select
                                    value={formData.faculdade_id}
                                    onValueChange={(value) => setFormData({ ...formData, faculdade_id: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a faculdade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {faculdades.map((fac) => (
                                            <SelectItem key={fac.id} value={fac.id}>
                                                {fac.nome_fantasia}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="nome">Nome do Polo *</Label>
                                <Input
                                    id="nome"
                                    required
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    placeholder="Ex: Polo Salvador"
                                />
                            </div>

                            <div>
                                <Label htmlFor="cnpj">CNPJ</Label>
                                <Input
                                    id="cnpj"
                                    value={formData.cnpj}
                                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                                    placeholder="00.000.000/0000-00"
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="polo@faculdade.com.br"
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
                                <Label htmlFor="diretor_nome">Diretor do Polo *</Label>
                                <Input
                                    id="diretor_nome"
                                    required
                                    value={formData.diretor_nome}
                                    onChange={(e) => setFormData({ ...formData, diretor_nome: e.target.value })}
                                    placeholder="Nome do diretor"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="endereco">Endereço</Label>
                                <Textarea
                                    id="endereco"
                                    value={formData.endereco}
                                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                                    placeholder="Endereço completo"
                                    rows={2}
                                />
                            </div>

                            <div>
                                <Label htmlFor="cidade">Cidade</Label>
                                <Input
                                    id="cidade"
                                    value={formData.cidade}
                                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
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
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? "Salvando..." : "Cadastrar Polo"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
