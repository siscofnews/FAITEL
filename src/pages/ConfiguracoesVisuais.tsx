import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Palette,
    Image as ImageIcon,
    Type,
    Upload,
    Save,
    Eye,
    Award
} from "lucide-react";

export default function ConfiguracoesVisuais() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        header_text: "",
        primary_color: "#4F46E5",
        secondary_color: "#7C3AED",
        logo_url: "",
        certificate_header: ""
    });
    const [uploadingLogo, setUploadingLogo] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("visual_settings")
                .select("*")
                .eq("is_active", true);

            if (error) throw error;

            if (data) {
                const settingsObj: any = {};
                data.forEach((item) => {
                    settingsObj[item.setting_type] = item.setting_value;
                });
                setSettings({
                    header_text: settingsObj.header_text || "",
                    primary_color: settingsObj.primary_color || "#4F46E5",
                    secondary_color: settingsObj.secondary_color || "#7C3AED",
                    logo_url: settingsObj.logo || "",
                    certificate_header: settingsObj.certificate_header || ""
                });
            }
        } catch (error: any) {
            console.error("Erro ao carregar configurações:", error);
            toast({
                title: "Erro ao carregar configurações",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Arquivo inválido",
                description: "Por favor, selecione uma imagem",
                variant: "destructive"
            });
            return;
        }

        // Validar tamanho (máximo 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast({
                title: "Arquivo muito grande",
                description: "O tamanho máximo é 2MB",
                variant: "destructive"
            });
            return;
        }

        setUploadingLogo(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${Date.now()}.${fileExt}`;
            const filePath = `logos/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('siscof-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('siscof-assets')
                .getPublicUrl(filePath);

            setSettings(prev => ({ ...prev, logo_url: publicUrl }));

            toast({
                title: "Logo enviado!",
                description: "Não esqueça de salvar as configurações",
            });
        } catch (error: any) {
            console.error("Erro ao fazer upload:", error);
            toast({
                title: "Erro no upload",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Upsert para cada configuração
            const settingsToSave = [
                { setting_type: 'header_text', setting_value: settings.header_text },
                { setting_type: 'primary_color', setting_value: settings.primary_color },
                { setting_type: 'secondary_color', setting_value: settings.secondary_color },
                { setting_type: 'logo', setting_value: settings.logo_url },
                { setting_type: 'certificate_header', setting_value: settings.certificate_header }
            ];

            for (const setting of settingsToSave) {
                const { error } = await supabase
                    .from("visual_settings")
                    .upsert({
                        ...setting,
                        is_active: true
                    }, { onConflict: 'setting_type' });

                if (error) throw error;
            }

            toast({
                title: "Configurações salvas!",
                description: "As alterações foram aplicadas com sucesso",
            });
        } catch (error: any) {
            console.error("Erro ao salvar:", error);
            toast({
                title: "Erro ao salvar",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Configurações Visuais
                    </h1>
                    <p className="text-lg md:text-xl mt-3 text-slate-600 font-medium">
                        Personalize a aparência do sistema
                    </p>
                </div>

                <Tabs defaultValue="branding" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="branding">Marca e Logo</TabsTrigger>
                        <TabsTrigger value="colors">Cores</TabsTrigger>
                        <TabsTrigger value="certificates">Certificados</TabsTrigger>
                    </TabsList>

                    {/* Aba de Branding */}
                    <TabsContent value="branding" className="space-y-6 mt-6">
                        <Card className="shadow-xl bg-white/90 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                                <CardTitle className="flex items-center gap-3 text-xl">
                                    <ImageIcon className="w-6 h-6 text-indigo-600" />
                                    Logo da Instituição
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-base font-semibold">
                                        Faça upload do logo (PNG, JPG - máx 2MB)
                                    </Label>

                                    {settings.logo_url && (
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                                            <img
                                                src={settings.logo_url}
                                                alt="Logo atual"
                                                className="h-20 object-contain"
                                            />
                                            <Badge variant="secondary">Logo Atual</Badge>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <Input
                                            id="logo-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            disabled={uploadingLogo}
                                            className="hidden"
                                        />
                                        <Label
                                            htmlFor="logo-upload"
                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl cursor-pointer hover:from-blue-600 hover:to-indigo-600 transition-all"
                                        >
                                            <Upload className="w-5 h-5" />
                                            {uploadingLogo ? "Enviando..." : "Selecionar Logo"}
                                        </Label>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="header_text" className="text-base font-semibold">
                                        Texto do Cabeçalho Principal
                                    </Label>
                                    <Input
                                        id="header_text"
                                        value={settings.header_text}
                                        onChange={(e) => setSettings(prev => ({ ...prev, header_text: e.target.value }))}
                                        placeholder="Ex: SISCOF - Sistema de Escola de Culto"
                                        className="text-base"
                                    />
                                    <p className="text-sm text-slate-600">
                                        Este texto aparecerá no topo do sistema quando não houver logo
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Aba de Cores */}
                    <TabsContent value="colors" className="space-y-6 mt-6">
                        <Card className="shadow-xl bg-white/90 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
                                <CardTitle className="flex items-center gap-3 text-xl">
                                    <Palette className="w-6 h-6 text-purple-600" />
                                    Esquema de Cores
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="primary_color" className="text-base font-semibold">
                                            Cor Primária
                                        </Label>
                                        <div className="flex items-center gap-4">
                                            <Input
                                                id="primary_color"
                                                type="color"
                                                value={settings.primary_color}
                                                onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                                                className="h-14 w-24 cursor-pointer"
                                            />
                                            <div
                                                className="flex-1 h-14 rounded-lg border-2 flex items-center justify-center text-white font-semibold"
                                                style={{ backgroundColor: settings.primary_color }}
                                            >
                                                {settings.primary_color}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600">
                                            Usada em botões principais e destaques
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="secondary_color" className="text-base font-semibold">
                                            Cor Secundária
                                        </Label>
                                        <div className="flex items-center gap-4">
                                            <Input
                                                id="secondary_color"
                                                type="color"
                                                value={settings.secondary_color}
                                                onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                                                className="h-14 w-24 cursor-pointer"
                                            />
                                            <div
                                                className="flex-1 h-14 rounded-lg border-2 flex items-center justify-center text-white font-semibold"
                                                style={{ backgroundColor: settings.secondary_color }}
                                            >
                                                {settings.secondary_color}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600">
                                            Usada em elementos complementares
                                        </p>
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="mt-8 p-6 bg-slate-50 rounded-xl border-2 border-slate-200">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Eye className="w-5 h-5" />
                                        Pré-visualização
                                    </h3>
                                    <div className="space-y-4">
                                        <Button
                                            style={{ backgroundColor: settings.primary_color }}
                                            className="text-white"
                                        >
                                            Botão Primário
                                        </Button>
                                        <Button
                                            style={{ backgroundColor: settings.secondary_color }}
                                            className="text-white ml-4"
                                        >
                                            Botão Secundário
                                        </Button>
                                        <div
                                            className="mt-4 p-4 rounded-lg text-white font-bold text-xl"
                                            style={{
                                                background: `linear-gradient(to right, ${settings.primary_color}, ${settings.secondary_color})`
                                            }}
                                        >
                                            Exemplo de Gradiente
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Aba de Certificados */}
                    <TabsContent value="certificates" className="space-y-6 mt-6">
                        <Card className="shadow-xl bg-white/90 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
                                <CardTitle className="flex items-center gap-3 text-xl">
                                    <Award className="w-6 h-6 text-amber-600" />
                                    Cabeçalho de Certificados
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="certificate_header" className="text-base font-semibold">
                                        Texto do Cabeçalho
                                    </Label>
                                    <Textarea
                                        id="certificate_header"
                                        value={settings.certificate_header}
                                        onChange={(e) => setSettings(prev => ({ ...prev, certificate_header: e.target.value }))}
                                        placeholder="Ex: CERTIFICADO DE CONCLUSÃO"
                                        className="text-base"
                                        rows={3}
                                    />
                                    <p className="text-sm text-slate-600">
                                        Este texto aparecerá no topo dos certificados emitidos
                                    </p>
                                </div>

                                {/* Preview do Certificado */}
                                <div className="mt-8 p-8 bg-white border-4 border-amber-400 rounded-lg shadow-xl">
                                    <div className="text-center space-y-6">
                                        {settings.logo_url && (
                                            <img
                                                src={settings.logo_url}
                                                alt="Logo"
                                                className="h-16 mx-auto object-contain"
                                            />
                                        )}
                                        <h2
                                            className="text-3xl font-bold uppercase"
                                            style={{ color: settings.primary_color }}
                                        >
                                            {settings.certificate_header || "CERTIFICADO"}
                                        </h2>
                                        <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                                        <p className="text-lg">
                                            Certificamos que <strong>Nome do Aluno</strong> concluiu com êxito o curso de...
                                        </p>
                                        <Badge
                                            className="text-base px-4 py-2"
                                            style={{ backgroundColor: settings.secondary_color }}
                                        >
                                            Exemplo de Preview
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Botão Salvar */}
                <div className="flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        size="lg"
                        className="px-8 py-6 text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-2xl shadow-xl"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        {saving ? "Salvando..." : "Salvar Configurações"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
