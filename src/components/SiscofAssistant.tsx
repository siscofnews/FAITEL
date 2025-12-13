import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    MessageCircle,
    Send,
    Mic,
    Volume2,
    X,
    Minimize2,
    Maximize2,
    Loader2,
    Bot
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export default function SiscofAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Olá! Sou o Assistente SISCOF 🎓\n\nPosso ajudar você com:\n- Informações sobre cursos\n- Datas de aulas e provas\n- Seu progresso e notas\n- Matrículas em turmas\n- Certificados\n\nComo posso ajudar?",
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const [pos, setPos] = useState<{ x: number; y: number }>(() => {
        if (typeof window === 'undefined') return { x: 24, y: 24 };
        try {
            const raw = localStorage.getItem('siscof_assistant_pos');
            if (raw) { const p = JSON.parse(raw); return { x: p.x || 24, y: p.y || window.innerHeight - 96 }; }
        } catch {}
        return { x: 24, y: window.innerHeight - 96 };
    });
    const draggingRef = useRef(false);
    const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Inicializar Web Speech API
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new (window as any).webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'pt-BR';

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInputMessage(transcript);
                setIsListening(false);
            };

            recognition.onerror = () => {
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage("");
        setIsLoading(true);

        try {
            // Aqui você pode integrar com uma API de IA real
            // Por enquanto, vou simular respostas baseadas em padrões
            const response = await generateResponse(inputMessage);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Erro ao gerar resposta:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Desculpe, ocorreu um erro. Tente novamente.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        }

        setIsLoading(false);
    };

    const generateResponse = async (question: string): Promise<string> => {
        const lowerQuestion = question.toLowerCase();

        // Buscar informações reais do banco de dados
        const { data: { user } } = await supabase.auth.getUser();

        // Respostas sobre cursos
        if (lowerQuestion.includes("curso") || lowerQuestion.includes("cursos")) {
            const { data: courses } = await supabase
                .from("courses")
                .select("name, category")
                .eq("is_published", true);

            if (courses && courses.length > 0) {
                return `📚 Temos ${courses.length} cursos disponíveis:\n\n${courses.map((c, i) => `${i + 1}. ${c.name} (${c.category})`).join('\n')}\n\nPosso dar mais detalhes sobre algum curso específico?`;
            }
            return "No momento não há cursos publicados. Volte em breve!";
        }

        // Respostas sobre matrículas
        if (lowerQuestion.includes("matrícula") || lowerQuestion.includes("matricula") || lowerQuestion.includes("matriculado")) {
            if (!user) {
                return "Você precisa estar logado para ver suas matrículas. 🔐";
            }

            const { data: enrollments } = await supabase
                .from("course_enrollments")
                .select("*, course_classes(name)")
                .eq("student_id", user.id);

            if (enrollments && enrollments.length > 0) {
                return `📋 Você está matriculado em ${enrollments.length} turma(s):\n\n${enrollments.map((e, i) => `${i + 1}. ${e.course_classes?.name} - Status: ${e.status === 'active' ? 'Ativa' : 'Pendente'}`).join('\n')}`;
            }
            return "Você ainda não está matriculado em nenhuma turma. Que tal se inscrever em um curso? 🎓";
        }

        // Respostas sobre progresso
        if (lowerQuestion.includes("progresso") || lowerQuestion.includes("nota") || lowerQuestion.includes("notas")) {
            if (!user) {
                return "Você precisa estar logado para ver seu progresso. 🔐";
            }

            const { data: enrollments } = await supabase
                .from("course_enrollments")
                .select("progress_percentage, course_classes(name)")
                .eq("student_id", user.id);

            if (enrollments && enrollments.length > 0) {
                return `📊 Seu progresso:\n\n${enrollments.map((e, i) => `${i + 1}. ${e.course_classes?.name}: ${e.progress_percentage}%`).join('\n')}`;
            }
            return "Você ainda não tem progresso registrado. Comece assistindo às aulas! 🚀";
        }

        // Respostas sobre certificados
        if (lowerQuestion.includes("certificado") || lowerQuestion.includes("certificados")) {
            if (!user) {
                return "Você precisa estar logado para ver seus certificados. 🔐";
            }

            const { data: certificates } = await supabase
                .from("student_certificates")
                .select("*, courses(name)")
                .eq("student_id", user.id);

            if (certificates && certificates.length > 0) {
                return `🏆 Você tem ${certificates.length} certificado(s) emitido(s):\n\n${certificates.map((c, i) => `${i + 1}. ${c.courses?.name || 'Curso'}`).join('\n')}`;
            }
            return "Você ainda não possui certificados emitidos. Complete um curso para receber o seu! 🎓";
        }

        // Respostas sobre aulas
        if (lowerQuestion.includes("aula") || lowerQuestion.includes("aulas") || lowerQuestion.includes("próxima") || lowerQuestion.includes("proxima")) {
            return "📅 Para ver as próximas aulas, acesse 'Minhas Turmas' no menu. Lá você encontrará o calendário completo de cada curso!";
        }

        // Respostas sobre avaliações/provas
        if (lowerQuestion.includes("prova") || lowerQuestion.includes("avaliação") || lowerQuestion.includes("avaliacao") || lowerQuestion.includes("teste")) {
            return "📝 As avaliações ficam disponíveis conforme você avança no curso. Verifique o módulo de cada aula para ver se há avaliações pendentes!";
        }

        // Resposta padrão
        return `Não entendi bem sua pergunta. 🤔\n\nPosso ajudar com:\n- Informações sobre cursos\n- Status de matrículas\n- Progresso e notas\n- Certificados\n- Datas de aulas\n\nTente reformular sua pergunta ou escolha um dos tópicos acima!`;
    };

    const handleSpeak = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pt-BR';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        }
    };

    const handleListen = () => {
        if (recognitionRef.current && !isListening) {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    const onPointerDown = (e: React.PointerEvent) => {
        draggingRef.current = true;
        dragOffsetRef.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
        const onMove = (ev: PointerEvent) => {
            if (!draggingRef.current) return;
            const nx = clamp(ev.clientX - dragOffsetRef.current.dx, 8, window.innerWidth - 72);
            const ny = clamp(ev.clientY - dragOffsetRef.current.dy, 8, window.innerHeight - 72);
            setPos({ x: nx, y: ny });
        };
        const onUp = () => {
            draggingRef.current = false;
            try { localStorage.setItem('siscof_assistant_pos', JSON.stringify(pos)); } catch {}
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    if (!isOpen) {
        return (
            <div style={{ position: 'fixed', top: pos.y, left: pos.x, zIndex: 60 }} onPointerDown={onPointerDown}>
                <Button
                    onClick={() => { if (!draggingRef.current) setIsOpen(true); }}
                    size="lg"
                    className="w-16 h-16 rounded-full shadow-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 hover:scale-110"
                >
                    <MessageCircle className="w-8 h-8" />
                </Button>
            </div>
        );
    }

    const PANEL_HEIGHT = isMinimized ? 64 : 420;
    const CARD_WIDTH = 320;
    const TOP_SAFE = 120; // evita ficar escondido sob os banners fixos
    const cardLeft = clamp(pos.x, 8, (typeof window !== 'undefined' ? window.innerWidth : 1200) - CARD_WIDTH - 8);
    const openBelow = pos.y < TOP_SAFE + PANEL_HEIGHT / 2;
    const proposedTop = openBelow ? (pos.y + 16) : (pos.y - PANEL_HEIGHT - 16);
    const cardTop = clamp(proposedTop, TOP_SAFE, (typeof window !== 'undefined' ? window.innerHeight : 800) - PANEL_HEIGHT - 8);
    return (
        <Card className={`shadow-2xl transition-all duration-300 rounded-xl`} style={{ position: 'fixed', left: cardLeft, top: cardTop, zIndex: 60, width: CARD_WIDTH, height: PANEL_HEIGHT }}>
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Bot className="w-6 h-6" />
                        <CardTitle className="text-lg">Assistente SISCOF</CardTitle>
                        <Badge variant="secondary" className="bg-white/20">Online</Badge>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="text-white hover:bg-white/20 w-8 h-8"
                        >
                            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:bg-white/20 h-8 px-3"
                        >
                            Fechar
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {!isMinimized && (
                <CardContent className="p-0 flex flex-col h-[calc(100%-4rem)]">
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl p-3 ${message.role === 'user'
                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                                                : 'bg-slate-100 text-slate-800'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        {message.role === 'assistant' && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleSpeak(message.content)}
                                                className="mt-2 h-6 text-xs"
                                                disabled={isSpeaking}
                                            >
                                                <Volume2 className="w-3 h-3 mr-1" />
                                                {isSpeaking ? 'Falando...' : 'Ouvir'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-100 rounded-2xl p-3">
                                        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t">
                        <div className="flex gap-2">
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={handleListen}
                                disabled={isListening}
                                className={isListening ? 'bg-red-100 border-red-300' : ''}
                            >
                                <Mic className={`w-4 h-4 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
                            </Button>
                            <Input
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Digite sua pergunta..."
                                disabled={isLoading}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className="bg-gradient-to-r from-indigo-500 to-purple-600"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
