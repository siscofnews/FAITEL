import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Heart, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface RadioMessage {
    id: string;
    created_at: string;
    sender_name: string;
    content: string;
    message_type: 'chat' | 'pedido_oracao' | 'pedido_musica';
    phone?: string;
    likes_count: number;
    is_visible?: boolean;
}

export function RadioChat() {
    const [messages, setMessages] = useState<RadioMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [senderName, setSenderName] = useState("");
    const [messageType, setMessageType] = useState<'chat' | 'pedido_oracao' | 'pedido_musica'>('chat');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Load initial messages
    useEffect(() => {
        loadMessages();

        const channel = supabase
            .channel('radio-chat-updates')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'radio_messages' },
                (payload) => {
                    const newMsg = payload.new as RadioMessage;
                    if (newMsg.is_visible !== false) { // Handle undefined as true
                        setMessages(prev => [newMsg, ...prev]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const loadMessages = async () => {
        const { data, error } = await supabase
            .from('radio_messages' as any)
            .select('*')
            .eq('is_visible', true)
            .order('created_at', { ascending: false })
            .limit(50);

        if (data) setMessages(data as any as RadioMessage[]);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !senderName.trim()) return;

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('radio_messages' as any)
                .insert({
                    sender_name: senderName,
                    content: newMessage,
                    message_type: messageType
                });

            if (error) throw error;

            setNewMessage("");
            toast({ title: "Mensagem enviada!" });
        } catch (error) {
            console.error(error);
            toast({ title: "Erro ao enviar", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'pedido_oracao': return <Heart className="h-3 w-3 text-red-500" />;
            case 'pedido_musica': return <Music className="h-3 w-3 text-blue-500" />;
            default: return null;
        }
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full w-10 h-10 relative">
                    <MessageSquare className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col w-full sm:w-[400px] p-0 gap-0 border-l border-border bg-background">
                <SheetHeader className="px-4 py-3 border-b bg-muted/30">
                    <SheetTitle className="flex items-center gap-2 text-base">
                        <MessageSquare className="h-4 w-4" /> Bate-papo da Rádio
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {messages.map(msg => (
                                <div key={msg.id} className="flex flex-col gap-1 anime-fade-in">
                                    <div className="flex items-baseline justify-between">
                                        <span className="font-semibold text-sm text-primary flex items-center gap-1">
                                            {msg.sender_name}
                                            {getIcon(msg.message_type)}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {format(new Date(msg.created_at), "HH:mm")}
                                        </span>
                                    </div>
                                    <p className="text-sm bg-muted/40 p-2 rounded-lg text-foreground/90 leading-relaxed">
                                        {msg.content}
                                    </p>
                                </div>
                            ))}
                            {messages.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground text-sm">
                                    Seja o primeiro a enviar uma mensagem!
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-4 bg-background border-t">
                        <form onSubmit={handleSend} className="space-y-3">
                            {!senderName && (
                                <Input
                                    placeholder="Seu nome..."
                                    value={senderName}
                                    onChange={e => setSenderName(e.target.value)}
                                    className="h-8 text-sm"
                                />
                            )}

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <div className="flex gap-1 mb-2">
                                        <Button
                                            type="button"
                                            variant={messageType === 'chat' ? 'default' : 'outline'}
                                            size="sm"
                                            className="h-6 text-[10px] px-2"
                                            onClick={() => setMessageType('chat')}
                                        >
                                            Chat
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={messageType === 'pedido_oracao' ? 'default' : 'outline'}
                                            size="sm"
                                            className="h-6 text-[10px] px-2"
                                            onClick={() => setMessageType('pedido_oracao')}
                                        >
                                            Oração
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={messageType === 'pedido_musica' ? 'default' : 'outline'}
                                            size="sm"
                                            className="h-6 text-[10px] px-2"
                                            onClick={() => setMessageType('pedido_musica')}
                                        >
                                            Música
                                        </Button>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder={messageType === 'chat' ? "Digite sua mensagem..." : messageType === 'pedido_oracao' ? "Qual seu pedido de oração?" : "Qual música deseja ouvir?"}
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            disabled={isLoading}
                                        />
                                        <Button type="submit" size="icon" disabled={isLoading || !newMessage.trim() || !senderName.trim()}>
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
