import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Upload, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentFormProps {
    onSuccess?: () => void;
    studentId?: string;
}

export default function StudentForm({ onSuccess, studentId }: StudentFormProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string>("");

    const [formData, setFormData] = useState({
        nome_completo: "",
        email: "",
        telefone: "",
        data_nascimento: undefined as Date | undefined,
        cpf: "",
        endereco: "",
        cidade: "",
        estado: "",
        cep: ""
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadPhoto = async (studentId: string): Promise<string | null> => {
        if (!photo) return null;

        try {
            const fileExt = photo.name.split('.').pop();
            const fileName = `${studentId}-${Date.now()}.${fileExt}`;
            const filePath = `students/${fileName}`;

            const { error: uploadError, data } = await supabase.storage
                .from('ead-student-photos')
                .upload(filePath, photo);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('ead-student-photos')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error: any) {
            console.error('Error uploading photo:', error);
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Criar usuário no auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: Math.random().toString(36).slice(-8), // senha temporária
                options: {
                    data: {
                        nome_completo: formData.nome_completo,
                        role: 'aluno'
                    }
                }
            });

            if (authError) throw authError;

            // 2. Upload da foto
            let fotoUrl = null;
            if (photo && authData.user) {
                fotoUrl = await uploadPhoto(authData.user.id);
            }

            // 3. Criar registro do aluno
            const { error: studentError } = await supabase
                .from('ead_students')
                .insert({
                    user_id: authData.user?.id,
                    nome_completo: formData.nome_completo,
                    email: formData.email,
                    telefone: formData.telefone,
                    data_nascimento: formData.data_nascimento,
                    cpf: formData.cpf,
                    endereco: formData.endereco,
                    cidade: formData.cidade,
                    estado: formData.estado,
                    cep: formData.cep,
                    foto_url: fotoUrl,
                    status: 'ativo'
                });

            if (studentError) throw studentError;

            // 4. Adicionar role de aluno
            if (authData.user) {
                await supabase
                    .from('ead_roles')
                    .insert({
                        user_id: authData.user.id,
                        role: 'aluno'
                    });
            }

            toast({
                title: "Aluno cadastrado com sucesso!",
                description: "Credenciais de acesso foram enviadas por email."
            });

            if (onSuccess) onSuccess();
        } catch (error: any) {
            toast({
                title: "Erro ao cadastrar aluno",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto do Aluno */}
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    {photoPreview ? (
                        <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                        />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-primary">
                            <User className="w-16 h-16 text-muted-foreground" />
                        </div>
                    )}
                    <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90">
                        <Upload className="w-4 h-4" />
                        <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                    </label>
                </div>
                <p className="text-sm text-muted-foreground">Clique no ícone para adicionar foto</p>
            </div>

            {/* Dados Pessoais */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                        id="nome"
                        required
                        value={formData.nome_completo}
                        onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                        placeholder="João da Silva"
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
                        placeholder="joao@email.com"
                    />
                </div>

                <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        placeholder="(11) 98888-8888"
                    />
                </div>

                <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                        id="cpf"
                        value={formData.cpf}
                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                        placeholder="000.000.000-00"
                    />
                </div>

                <div>
                    <Label>Data de Nascimento</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !formData.data_nascimento && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.data_nascimento ? format(formData.data_nascimento, "dd/MM/yyyy") : "Selecione"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={formData.data_nascimento}
                                onSelect={(date) => setFormData({ ...formData, data_nascimento: date })}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Endereço */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                        id="endereco"
                        value={formData.endereco}
                        onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                        placeholder="Rua, Número, Complemento"
                    />
                </div>

                <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                        id="cidade"
                        value={formData.cidade}
                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                        placeholder="São Paulo"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label htmlFor="estado">Estado</Label>
                        <Input
                            id="estado"
                            value={formData.estado}
                            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                            placeholder="SP"
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

            {/* Botões */}
            <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Cadastrando..." : "Cadastrar Aluno"}
                </Button>
            </div>
        </form>
    );
}
