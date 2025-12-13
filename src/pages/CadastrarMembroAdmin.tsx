import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User } from "lucide-react";
import { PhotoUpload } from "@/components/PhotoUpload";

export default function CadastrarMembroAdmin() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const parentChurchId = localStorage.getItem('creating_for_church');
    const [isLoading, setIsLoading] = useState(false);
    const [churches, setChurches] = useState<any[]>([]);
    const [cells, setCells] = useState<any[]>([]);
    const [loadingChurches, setLoadingChurches] = useState(true);
    const [photoUrl, setPhotoUrl] = useState<string>('');

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        telefone: '',
        data_nascimento: '',
        genero: '',
        estado_civil: '',
        cargo_eclesiastico: '',
        church_id: parentChurchId || '',  // Igreja que o membro faz parte
        cell_id: '',                       // Célula (opcional)
        criar_login: false,
        senha: '',
    });


    useEffect(() => {
        loadChurchesAndCells();
    }, [parentChurchId]);

    const loadChurchesAndCells = async () => {
        setLoadingChurches(true);
        try {
            // Carregar igrejas da hierarquia
            const allChurches = await getAllHierarchyChurches(parentChurchId!);
            setChurches([...allChurches]);

            // Carregar células de todas as igrejas
            const allIds = allChurches.map(c => c.id);
            // @ts-ignore
            const { data: cellsData } = await supabase
                .from('cells')
                .select('*')
                .in('church_id', allIds)
                .eq('is_active', true);

            setCells(cellsData || []);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoadingChurches(false);
        }
    };

    const getAllHierarchyChurches = async (churchId: string): Promise<any[]> => {
        const { data: current } = await supabase
            .from('churches')
            .select('*')
            .eq('id', churchId)
            .single();

        if (!current) return [];

        const { data: children } = await supabase
            .from('churches')
            .select('*')
            .eq('parent_church_id', churchId)
            .eq('is_active', true);

        const allChurches = [current];

        if (children && children.length > 0) {
            for (const child of children) {
                const subChurches = await getAllHierarchyChurches(child.id);
                allChurches.push(...subChurches);
            }
        }

        return allChurches;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let userId = null;

            // Se marcou para criar login
            // Se marcou para criar login
            if (formData.criar_login && formData.email && formData.senha) {
                // Workaround: Usar cliente temporário para não deslogar o admin
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
                    email: formData.email,
                    password: formData.senha,
                    options: {
                        data: {
                            full_name: formData.full_name,
                        }
                    }
                });

                if (authError) throw authError;
                userId = authData.user?.id;
            }

            // Criar membro
            const { error: memberError } = await supabase.from('members').insert({
                id: userId,
                full_name: formData.full_name,
                email: formData.email,
                telefone: formData.telefone,
                data_nascimento: formData.data_nascimento || null,
                genero: formData.genero || null,
                estado_civil: formData.estado_civil || null,
                cargo_eclesiastico: formData.cargo_eclesiastico || null,
                church_id: formData.church_id,
                photo_url: photoUrl || null,
                is_active: true,
            });

            if (memberError) throw memberError;

            // Se criou login, criar role
            if (userId) {
                await supabase.from('user_roles').insert({
                    user_id: userId,
                    church_id: formData.church_id,
                    role: 'membro',
                });
            }

            toast({
                title: "✅ Membro cadastrado!",
                description: `${formData.full_name} foi cadastrado com sucesso`,
            });

            localStorage.removeItem('creating_for_church');
            navigate(`/igreja/${parentChurchId}/detalhes`);
        } catch (error: any) {
            toast({
                title: "Erro ao cadastrar",
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
                onClick={() => {
                    const churchId = localStorage.getItem('creating_for_church');
                    if (churchId) {
                        navigate(`/igreja/${churchId}/detalhes`);
                    } else {
                        navigate('/igrejas');
                    }
                }}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
            </Button>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary text-primary-foreground">
                            <User className="h-8 w-8" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Cadastrar Membro</CardTitle>
                            <CardDescription>
                                Cadastro manual de membro pelo administrador
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nome Completo */}
                        <div>
                            <Label htmlFor="full_name">Nome Completo *</Label>
                            <Input
                                id="full_name"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                placeholder="Nome completo do membro"
                                required
                            />
                        </div>

                        {/* Foto do Membro */}
                        <div>
                            <Label>Foto do Membro *</Label>
                            <PhotoUpload
                                onPhotoUploaded={setPhotoUrl}
                                currentPhotoUrl={photoUrl}
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                📸 Tire uma selfie ou faça upload de uma foto
                            </p>
                        </div>

                        {/* Email */}
                        <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="email@exemplo.com"
                                required
                            />
                        </div>

                        {/* Telefone */}
                        <div>
                            <Label htmlFor="telefone">Telefone *</Label>
                            <Input
                                id="telefone"
                                value={formData.telefone}
                                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                placeholder="(00) 00000-0000"
                                required
                            />
                        </div>

                        {/* Data Nascimento e Gênero */}
                        <div className="grid grid-cols-2 gap-4">
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
                                <Select
                                    value={formData.genero}
                                    onValueChange={(value) => setFormData({ ...formData, genero: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="masculino">Masculino</SelectItem>
                                        <SelectItem value="feminino">Feminino</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Estado Civil */}
                        <div>
                            <Label htmlFor="estado_civil">Estado Civil</Label>
                            <Select
                                value={formData.estado_civil}
                                onValueChange={(value) => setFormData({ ...formData, estado_civil: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                                    <SelectItem value="casado">Casado(a)</SelectItem>
                                    <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                                    <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Vínculos Eclesiásticos */}
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-semibold">⛪ Vínculos Eclesiásticos</h3>

                            {/* Igreja */}
                            <div>
                                <Label htmlFor="church_id">Igreja que faz parte *</Label>
                                <Select
                                    value={formData.church_id}
                                    onValueChange={(value) => setFormData({ ...formData, church_id: value, cell_id: '' })}
                                    disabled={loadingChurches}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={loadingChurches ? "Carregando..." : "Selecione a igreja"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {churches.map((church) => (
                                            <SelectItem key={church.id} value={church.id}>
                                                {church.nome_fantasia} ({church.nivel})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Matriz, Sede, Subsede ou Congregação
                                </p>
                            </div>

                            {/* Célula (Opcional) */}
                            <div>
                                <Label htmlFor="cell_id">Célula (Opcional)</Label>
                                <Select
                                    value={formData.cell_id}
                                    onValueChange={(value) => setFormData({ ...formData, cell_id: value })}
                                    disabled={loadingChurches || !formData.church_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={
                                            !formData.church_id
                                                ? "Selecione a igreja primeiro"
                                                : cells.filter(c => c.church_id === formData.church_id).length === 0
                                                    ? "Nenhuma célula nesta igreja"
                                                    : "Selecione a célula"
                                        } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cells
                                            .filter(cell => cell.church_id === formData.church_id)
                                            .map((cell) => (
                                                <SelectItem key={cell.id} value={cell.id}>
                                                    {cell.nome} ({cell.tipo_celula})
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Filtrado pela igreja selecionada acima
                                </p>
                            </div>

                            {/* Cargo Eclesiástico */}
                            <div>
                                <Label htmlFor="cargo_eclesiastico">Cargo / Função</Label>
                                <Select
                                    value={formData.cargo_eclesiastico}
                                    onValueChange={(value) => setFormData({ ...formData, cargo_eclesiastico: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o cargo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Membro">Membro</SelectItem>
                                        <SelectItem value="Líder de Célula">Líder de Célula</SelectItem>
                                        <SelectItem value="Diácono">Diácono</SelectItem>
                                        <SelectItem value="Diaconisa">Diaconisa</SelectItem>
                                        <SelectItem value="Presbítero">Presbítero</SelectItem>
                                        <SelectItem value="Pastor">Pastor</SelectItem>
                                        <SelectItem value="Pastora">Pastora</SelectItem>
                                        <SelectItem value="Pastor Presidente">Pastor Presidente</SelectItem>
                                        <SelectItem value="Pastora Presidente">Pastora Presidente</SelectItem>
                                        <SelectItem value="Pastor Vice Presidente">Pastor Vice Presidente</SelectItem>
                                        <SelectItem value="Pastora Vice Presidente">Pastora Vice Presidente</SelectItem>
                                        <SelectItem value="Evangelista">Evangelista</SelectItem>
                                        <SelectItem value="Missionário">Missionário</SelectItem>
                                        <SelectItem value="Missionária">Missionária</SelectItem>
                                        <SelectItem value="Professor EBD">Professor EBD</SelectItem>
                                        <SelectItem value="Músico">Músico</SelectItem>
                                        <SelectItem value="Diretor de Louvor">Diretor de Louvor</SelectItem>
                                        <SelectItem value="Secretário">Secretário</SelectItem>
                                        <SelectItem value="Secretária">Secretária</SelectItem>
                                        <SelectItem value="Tesoureiro">Tesoureiro</SelectItem>
                                        <SelectItem value="Tesoureira">Tesoureira</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Criar Login */}
                        <div className="pt-4 border-t">
                            <div className="flex items-center gap-2 mb-4">
                                <input
                                    type="checkbox"
                                    id="criar_login"
                                    checked={formData.criar_login}
                                    onChange={(e) => setFormData({ ...formData, criar_login: e.target.checked })}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="criar_login" className="cursor-pointer">
                                    🔐 Criar login para este membro
                                </Label>
                            </div>

                            {formData.criar_login && (
                                <div>
                                    <Label htmlFor="senha">Senha *</Label>
                                    <Input
                                        id="senha"
                                        type="password"
                                        value={formData.senha}
                                        onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                                        placeholder="Mínimo 6 caracteres"
                                        minLength={6}
                                        required={formData.criar_login}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        O membro poderá alterar a senha após o primeiro login
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Botões */}
                        <div className="flex gap-3 pt-4">
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
                            <Button type="submit" disabled={isLoading} className="flex-1">
                                {isLoading ? 'Cadastrando...' : 'Cadastrar Membro'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
