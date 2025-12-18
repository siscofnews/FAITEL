import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, X, Heart } from 'lucide-react';
import { getPalavraDevocionalDoDia, verificarMensagemLida, marcarMensagemComoLida } from '@/utils/palavraDevocional';

export function PalavraDevocionalModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [mensagem, setMensagem] = useState(getPalavraDevocionalDoDia());

    useEffect(() => {
        // Verifica se a mensagem de hoje já foi mostrada
        const jaLeu = verificarMensagemLida();
        if (!jaLeu) {
            // Aguarda 2 segundos após carregar a página para mostrar
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        marcarMensagemComoLida();
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 shadow-2xl relative animate-in fade-in zoom-in duration-500">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>

                <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full">
                            <BookOpen className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold text-blue-900">
                        Palavra do Dia
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                        {new Date().toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </CardHeader>

                <CardContent className="space-y-6 px-8 pb-8">
                    {/* Título da Mensagem */}
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-purple-700 mb-4">
                            {mensagem.titulo}
                        </h3>
                    </div>

                    {/* Mensagem Principal */}
                    <div className="bg-white p-6 rounded-lg shadow-inner border-l-4 border-blue-600">
                        <p className="text-gray-700 leading-relaxed text-justify">
                            {mensagem.mensagem}
                        </p>
                    </div>

                    {/* Versículo/Reflexão */}
                    <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-5 rounded-lg border border-purple-200">
                        <p className="text-purple-900 italic text-center font-medium">
                            "{mensagem.versiculo}"
                        </p>
                    </div>

                    {/* Assinatura */}
                    <div className="text-right">
                        <p className="text-gray-600 font-semibold flex items-center justify-end gap-2">
                            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                            {mensagem.autor}
                        </p>
                        <p className="text-sm text-gray-500">FAITEL - Formando Líderes</p>
                    </div>

                    {/* Botão de Fechar */}
                    <div className="text-center pt-4">
                        <Button
                            onClick={handleClose}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2"
                        >
                            Amém! Obrigado pela Palavra
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Componente compacto para exibir no dashboard
export function PalavraDevocionalCard() {
    const [mostrarCompleto, setMostrarCompleto] = useState(false);
    const mensagem = getPalavraDevocionalDoDia();

    if (mostrarCompleto) {
        return (
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                        <BookOpen className="h-5 w-5" />
                        Palavra do Dia
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <h4 className="font-bold text-purple-700">{mensagem.titulo}</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{mensagem.mensagem}</p>
                    <p className="text-sm italic text-purple-900 border-l-4 border-purple-500 pl-3">
                        "{mensagem.versiculo}"
                    </p>
                    <div className="text-right text-sm text-gray-600">
                        — {mensagem.autor}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMostrarCompleto(false)}
                        className="w-full"
                    >
                        Recolher
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setMostrarCompleto(true)}
        >
            <CardContent className="p-4 flex items-center gap-3">
                <BookOpen className="h-8 w-8 flex-shrink-0" />
                <div className="flex-1">
                    <p className="font-bold text-sm">Palavra do Dia</p>
                    <p className="text-xs opacity-90">{mensagem.titulo}</p>
                </div>
                <ChevronRight className="h-5 w-5" />
            </CardContent>
        </Card>
    );
}

function ChevronRight(props: any) {
    return (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
        </svg>
    );
}
