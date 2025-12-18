import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, Save, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CadastrarProfessor() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [foto, setFoto] = useState<File | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string>("");

    const [formData, setFormData] = useState({
        nome_completo: "",
        email: "",
        telefone: "",
        cpf: "",
        data_nascimento: "",
        especialidades: "",
        formacao: "",
        mini_bio: ""
    });

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeFoto = () => {
        setFoto(null);
        setFotoPreview("");
    };

    const uploadFoto = async (professorId: string): Promise<string | null> => {
        if (!foto) return null;

        try {
            const fileExt = foto.name.split('.').pop();
            const fileName = `${professorId}.${fileExt}`;
            const filePath = `professores/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('fotos-de-alunos')
                .upload(filePath, foto, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('fotos-de-alunos')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Erro ao fazer upload da foto:', error);
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Criar usuário no Supabase Auth
            const tempPassword = Math.random().toString(36).slice(-8);

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: tempPassword,
                options: {
                    data: {
                        full_name: formData.nome_completo,
                        role: 'professor'
                    }
                }
            });

            if (authError) throw authError;

            // Inserir na tabela de professores
            const { data: professorData, error: insertError } = await supabase
                .from('ead_professors')
                .insert({
                    user_id: authData.user?.id,
                    nome_completo: formData.nome_completo,
                    email: formData.email,
                    telefone: formData.telefone,
                    cpf: formData.cpf,
                    data_nascimento: formData.data_nascimento || null,
                    especialidades: formData.especialidades,
                    formacao: formData.formacao,
                    mini_bio: formData.mini_bio,
                    status: 'ativo'
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Upload da foto
            if (foto && professorData) {
                const fotoUrl = await uploadFoto(professorData.id);
                if (fotoUrl) {
                    await supabase
                        .from('ead_professors')
                        .update({ foto_url: fotoUrl })
                        .eq('id', professorData.id);
                }
            }

            // Adicionar role
            await supabase
                .from('ead_roles')
                .insert({
                    user_id: authData.user?.id,
                    role: 'professor'
                });

            toast({
                title: "Professor cadastrado!",
                description: `Credenciais enviadas para ${formData.email}`,
            });

            navigate('/ead/admin/professores');
        } catch (error: any) {
            toast({
                title: "Erro ao cadastrar professor",
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
                    <UserCircle className="w-8 h-8" />
                    Cadastrar Professor
                </h1>
                <p className="text-muted-foreground mt-2">
                    Registre um novo professor ou tutor no sistema
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Foto do Professor */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Foto do Professor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center gap-4">
                            {fotoPreview ? (
                                <div className="relative">
                                    <img
                                        src={fotoPreview}
                                        alt="Preview"
                                        className="w-40 h-40 object-cover rounded-full border-4 border-primary"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2"
                                        onClick={removeFoto}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="w-40 h-40 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                                    <UserCircle className="w-20 h-20 text-gray-400" />
                                </div>
                            )}

                            <div>
                                <Input
                                    id="foto-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFotoChange}
                                    className="hidden"
                                />
                                <Label htmlFor="foto-upload">
                                    <Button type="button" variant="outline" asChild>
                                        <span className="cursor-pointer">
                                            <Upload className="w-4 h-4 mr-2" />
                                            {foto ? "Trocar Foto" : "Escolher Foto"}
                                        </span>
                                    </Button>
                                </Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Dados Pessoais */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Dados Pessoais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label htmlFor="nome_completo">Nome Completo *</Label>
                                <Input
                                    id="nome_completo"
                                    required
                                    value={formData.nome_completo}
                                    onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
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
                                />
                            </div>

                            <div>
                                <Label htmlFor="telefone">Telefone</Label>
                                <Input
                                    id="telefone"
                                    value={formData.telefone}
                                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label htmlFor="cpf">CPF</Label>
                                <Input
                                    id="cpf"
                                    value={formData.cpf}
                                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                                <Input
                                    id="data_nascimento"
                                    type="date"
                                    value={formData.data_nascimento}
                                    onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Formação Acadêmica */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Formação Acadêmica</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="formacao">Formação</Label>
                            <Textarea
                                id="formacao"
                                value={formData.formacao}
                                onChange={(e) => setFormData({ ...formData, formacao: e.target.value })}
                                placeholder="Ex: Mestre em Teologia, Bacharel em Filosofia..."
                                rows={2}
                            />
                        </div>

                        <div>
                            <Label htmlFor="especialidades">Especialidades</Label>
                            <Input
                                id="especialidades"
                                value={formData.especialidades}
                                onChange={(e) => setFormData({ ...formData, especialidades: e.target.value })}
                                placeholder="Ex: Teologia Sistemática, Hermenêutica..."
                            />
                        </div>

                        <div>
                            <Label htmlFor="mini_bio">Mini Biografia</Label>
                            <Textarea
                                id="mini_bio"
                                value={formData.mini_bio}
                                onChange={(e) => setFormData({ ...formData, mini_bio: e.target.value })}
                                placeholder="Breve apresentação do professor..."
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-3 justify-end">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? "Salvando..." : "Cadastrar Professor"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
