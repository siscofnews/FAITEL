import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { LogoUpload } from "@/components/LogoUpload";
import { Church, Building2, Settings, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ConfigurarIgreja() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { churchId, isAdmin, isSuperAdmin } = usePermissions();
    const [isLoading, setIsLoading] = useState(false);
    const [church, setChurch] = useState<any>(null);

    const [formData, setFormData] = useState({
        nome_fantasia: "",
        endereco: "",
        cidade: "",
        estado: "",
        telefone: "",
        email: "",
        pastor_presidente_nome: "",
    });

    // Carregar dados da igreja
    useState(() => {
        if (churchId) {
            loadChurchData();
        }
    });

    const loadChurchData = async () => {
        try {
            const { data, error } = await supabase
                .from('churches')
                .select('*')
                .eq('id', churchId)
                .single();

            if (error) throw error;

            setChurch(data);
            setFormData({
                nome_fantasia: data.nome_fantasia || "",
                endereco: data.endereco || "",
                cidade: data.cidade || "",
                estado: data.estado || "",
                telefone: data.telefone || "",
                email: data.email || "",
                pastor_presidente_nome: data.pastor_presidente_nome || "",
            });
        } catch (error: any) {
            console.error("Error loading church:", error);
            toast({
                title: "Erro ao carregar dados",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase
                .from('churches')
                .update(formData)
                .eq('id', churchId);

            if (error) throw error;

            toast({
                title: "✅ Dados atualizados!",
                description: "As informações da igreja foram salvas com sucesso",
            });
        } catch (error: any) {
            console.error("Error updating church:", error);
            toast({
                title: "Erro ao salvar",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAdmin && !isSuperAdmin) {
        return (
            <div className="container mx-auto py-8">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-800">
                            ⚠️ Apenas administradores podem configurar a igreja.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Settings className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">Configurar Igreja</h1>
                </div>
                <p className="text-muted-foreground">
                    Gerencie as informações e identidade visual da sua igreja
                </p>
            </div>

            <Tabs defaultValue="dados" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="dados">
                        <Building2 className="h-4 w-4 mr-2" />
                        Dados da Igreja
                    </TabsTrigger>
                    <TabsTrigger value="logo">
                        <Church className="h-4 w-4 mr-2" />
                        Logo / Identidade
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="dados">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações da Igreja</CardTitle>
                            <CardDescription>
                                Atualize os dados cadastrais da sua igreja
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="nome_fantasia">Nome da Igreja *</Label>
                                        <Input
                                            id="nome_fantasia"
                                            value={formData.nome_fantasia}
                                            onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="pastor">Pastor Presidente</Label>
                                        <Input
                                            id="pastor"
                                            value={formData.pastor_presidente_nome}
                                            onChange={(e) => setFormData({ ...formData, pastor_presidente_nome: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="telefone">Telefone</Label>
                                        <Input
                                            id="telefone"
                                            value={formData.telefone}
                                            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="endereco">Endereço</Label>
                                        <Textarea
                                            id="endereco"
                                            value={formData.endereco}
                                            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                                            rows={2}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cidade">Cidade</Label>
                                        <Input
                                            id="cidade"
                                            value={formData.cidade}
                                            onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="estado">Estado (UF)</Label>
                                        <Input
                                            id="estado"
                                            maxLength={2}
                                            value={formData.estado}
                                            onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? (
                                            <>Salvando...</>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Salvar Alterações
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="logo">
                    <Card>
                        <CardHeader>
                            <CardTitle>Logo da Igreja</CardTitle>
                            <CardDescription>
                                Envie o logo oficial da sua igreja. Será usado em todos os relatórios e documentos.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {churchId ? (
                                <LogoUpload
                                    churchId={churchId}
                                    currentLogoUrl={church?.logo_url}
                                    onUploadSuccess={(url) => {
                                        setChurch({ ...church, logo_url: url });
                                        toast({
                                            title: "Logo atualizado!",
                                            description: "O logo da igreja foi atualizado com sucesso",
                                        });
                                    }}
                                />
                            ) : (
                                <p className="text-muted-foreground">
                                    Carregando dados da igreja...
                                </p>
                            )}

                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Sobre o Logo</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• O logo será usado em TODOS os relatórios da igreja</li>
                                    <li>• Sedes, Subsedes e Congregações usarão o logo da Matriz</li>
                                    <li>• Formato recomendado: PNG com fundo transparente</li>
                                    <li>• Dimensões ideais: 400x400px ou proporção quadrada</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
