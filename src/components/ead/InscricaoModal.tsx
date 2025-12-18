import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Mail, Phone, User, GraduationCap, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InscricaoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function InscricaoModal({ open, onOpenChange }: InscricaoModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        telefone: "",
        curso: "",
        mensagem: "",
    });

    const cursos = [
        "Bacharelado em Teologia",
        "Pós-Graduação em Capelania Hospitalar",
        "Pós-Graduação em Missiologia",
        "Pós-Graduação em Docência em Teologia",
        "Curso Livre - Líderes de Células",
        "Psicanálise Clínica",
        "Juiz de Paz",
        "Outro",
    ];

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simular envio (integrar com Supabase ou serviço de email depois)
        setTimeout(() => {
            toast.success("Inscrição enviada com sucesso!", {
                description: "Nossa equipe entrará em contato em breve.",
            });

            // Limpar formulário
            setFormData({
                nome: "",
                email: "",
                telefone: "",
                curso: "",
                mensagem: "",
            });

            setIsSubmitting(false);
            onOpenChange(false);
        }, 1500);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-blue-600" />
                        Inscreva-se na FAITEL
                    </DialogTitle>
                    <DialogDescription>
                        Preencha o formulário abaixo e nossa equipe entrará em contato para fornecer todas as informações sobre o curso.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {/* Nome Completo */}
                    <div>
                        <Label htmlFor="nome" className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-gray-500" />
                            Nome Completo *
                        </Label>
                        <Input
                            id="nome"
                            placeholder="Seu nome completo"
                            value={formData.nome}
                            onChange={(e) => handleChange("nome", e.target.value)}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            Email *
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            required
                        />
                    </div>

                    {/* Telefone */}
                    <div>
                        <Label htmlFor="telefone" className="flex items-center gap-2 mb-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            Telefone/WhatsApp *
                        </Label>
                        <Input
                            id="telefone"
                            type="tel"
                            placeholder="(11) 99999-9999"
                            value={formData.telefone}
                            onChange={(e) => handleChange("telefone", e.target.value)}
                            required
                        />
                    </div>

                    {/* Curso de Interesse */}
                    <div>
                        <Label htmlFor="curso" className="flex items-center gap-2 mb-2">
                            <GraduationCap className="h-4 w-4 text-gray-500" />
                            Curso de Interesse *
                        </Label>
                        <Select value={formData.curso} onValueChange={(value) => handleChange("curso", value)} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um curso" />
                            </SelectTrigger>
                            <SelectContent>
                                {cursos.map((curso) => (
                                    <SelectItem key={curso} value={curso}>
                                        {curso}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Mensagem */}
                    <div>
                        <Label htmlFor="mensagem" className="mb-2 block">
                            Mensagem (opcional)
                        </Label>
                        <Textarea
                            id="mensagem"
                            placeholder="Conte-nos um pouco sobre suas expectativas ou dúvidas..."
                            value={formData.mensagem}
                            onChange={(e) => handleChange("mensagem", e.target.value)}
                            rows={4}
                        />
                    </div>

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700">
                            📞 <strong>Atendimento rápido:</strong> Nossa equipe responde em até 24 horas úteis.
                        </p>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Enviar Inscrição
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
