import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Construction, ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function EmConstrucao() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNotify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simular envio (você pode integrar com Supabase depois)
        setTimeout(() => {
            toast.success("Email cadastrado! Você será notificado quando esta seção estiver disponível.");
            setEmail("");
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full shadow-2xl">
                <CardContent className="p-8 md:p-12 text-center">
                    <div className="mb-6">
                        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Construction className="h-12 w-12 text-yellow-600" />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Página em Construção
                    </h1>

                    <p className="text-lg text-gray-600 mb-8">
                        Estamos trabalhando para trazer novos conteúdos e recursos incríveis para você!
                        <br />
                        Esta seção estará disponível em breve.
                    </p>

                    {/* Formulário de Notificação */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
                            <Mail className="h-5 w-5 text-blue-600" />
                            Quer ser notificado quando estiver pronto?
                        </h3>

                        <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                                <Label htmlFor="email" className="sr-only">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Seu melhor email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Enviando..." : "Notificar-me"}
                            </Button>
                        </form>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => navigate(-1)}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar
                        </Button>
                        <Button
                            onClick={() => navigate("/")}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Ir para Home
                        </Button>
                    </div>

                    {/* Informações Adicionais */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                            Tem alguma dúvida ou sugestão?{" "}
                            <a href="mailto:contato@faitel.edu.br" className="text-blue-600 hover:text-blue-700 font-semibold">
                                Entre em contato conosco
                            </a>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
