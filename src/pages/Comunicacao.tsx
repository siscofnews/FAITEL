import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Send, Bell, Mail, MessageSquare, Users, Plus, Search, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Conversa {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  type: "individual" | "grupo";
}

interface Aviso {
  id: string;
  title: string;
  message: string;
  author: string;
  date: string;
  unit: string;
  priority: "alta" | "media" | "baixa";
}

const mockConversas: Conversa[] = [
  { id: "1", name: "Ministério de Louvor", avatar: "ML", lastMessage: "Pessoal, ensaio confirmado para sábado!", time: "10:30", unread: 3, type: "grupo" },
  { id: "2", name: "Pr. João Silva", avatar: "JS", lastMessage: "Obrigado pela mensagem, vou verificar.", time: "09:15", unread: 0, type: "individual" },
  { id: "3", name: "Equipe de Mídia", avatar: "EM", lastMessage: "Slides prontos para o culto de domingo", time: "Ontem", unread: 1, type: "grupo" },
  { id: "4", name: "Maria Costa", avatar: "MC", lastMessage: "Posso ajudar com a escala?", time: "Ontem", unread: 0, type: "individual" },
  { id: "5", name: "Diaconato", avatar: "DI", lastMessage: "Reunião adiada para terça-feira", time: "Seg", unread: 5, type: "grupo" },
];

const mockAvisos: Aviso[] = [
  { id: "1", title: "Culto Especial de Natal", message: "Convidamos todos para o culto especial de Natal no dia 25 às 10h. Teremos apresentação do coral.", author: "Pr. João Silva", date: "05/12/2024", unit: "Igreja Matriz", priority: "alta" },
  { id: "2", title: "Ensaio Geral - Coral", message: "Ensaio geral do coral será no sábado às 15h. Presença obrigatória.", author: "Min. Maria Costa", date: "04/12/2024", unit: "Sede Norte", priority: "media" },
  { id: "3", title: "Manutenção do Templo", message: "Haverá manutenção no sistema de som na segunda-feira. O templo estará fechado.", author: "Carlos Lima", date: "03/12/2024", unit: "Igreja Matriz", priority: "baixa" },
];

const priorityColors = {
  alta: "bg-destructive/10 text-destructive border-destructive/20",
  media: "bg-accent/20 text-accent-foreground border-accent/20",
  baixa: "bg-secondary text-secondary-foreground border-secondary",
};

export default function Comunicacao() {
  const [activeTab, setActiveTab] = useState<"chat" | "avisos">("chat");
  const [selectedConversation, setSelectedConversation] = useState<Conversa | null>(mockConversas[0]);

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Comunicação</h1>
          <p className="text-muted-foreground mt-1">Chat interno e avisos para as igrejas</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Bell className="h-5 w-5 mr-2" />
            Notificações
          </Button>
          <Button variant="gold">
            <Plus className="h-5 w-5 mr-2" />
            Novo Aviso
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "chat", label: "Chat", icon: MessageSquare },
          { key: "avisos", label: "Avisos", icon: Bell },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "chat" | "avisos")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === tab.key
                ? "gradient-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "chat" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
          {/* Conversations List */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar conversas..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="overflow-y-auto h-[calc(100%-72px)]">
              {mockConversas.map((conversa) => (
                <button
                  key={conversa.id}
                  onClick={() => setSelectedConversation(conversa)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 transition-colors text-left",
                    selectedConversation?.id === conversa.id
                      ? "bg-primary/10"
                      : "hover:bg-secondary"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold",
                    conversa.type === "grupo" ? "gradient-primary text-primary-foreground" : "gradient-gold text-navy"
                  )}>
                    {conversa.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground truncate">{conversa.name}</h3>
                      <span className="text-xs text-muted-foreground">{conversa.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-muted-foreground truncate">{conversa.lastMessage}</p>
                      {conversa.unread > 0 && (
                        <span className="ml-2 w-5 h-5 rounded-full gradient-gold text-navy text-xs font-bold flex items-center justify-center">
                          {conversa.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                      selectedConversation.type === "grupo" ? "gradient-primary text-primary-foreground" : "gradient-gold text-navy"
                    )}>
                      {selectedConversation.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{selectedConversation.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedConversation.type === "grupo" ? "12 membros" : "Online"}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full gradient-gold text-navy flex items-center justify-center text-xs font-bold">MC</div>
                    <div className="max-w-[70%]">
                      <div className="bg-secondary rounded-2xl rounded-tl-none p-3">
                        <p className="text-sm text-foreground">Bom dia! Alguém pode confirmar a escala de domingo?</p>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 block">Maria Costa • 09:30</span>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="max-w-[70%]">
                      <div className="gradient-primary rounded-2xl rounded-tr-none p-3">
                        <p className="text-sm text-primary-foreground">Já confirmei! Estou na escala de louvor.</p>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 block text-right">Você • 09:32</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-xs font-bold">PL</div>
                    <div className="max-w-[70%]">
                      <div className="bg-secondary rounded-2xl rounded-tl-none p-3">
                        <p className="text-sm text-foreground">Ótimo! Vou enviar os slides até sexta.</p>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 block">Paulo Lima • 10:15</span>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Digite sua mensagem..."
                      className="flex-1 h-12 px-4 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <Button variant="gold" size="icon" className="h-12 w-12">
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Selecione uma conversa para começar
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {mockAvisos.map((aviso, index) => (
            <div
              key={aviso.id}
              className="bg-card rounded-2xl border border-border p-6 card-hover animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl gradient-primary">
                    <Bell className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{aviso.title}</h3>
                    <p className="text-sm text-muted-foreground">{aviso.unit}</p>
                  </div>
                </div>
                <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", priorityColors[aviso.priority])}>
                  {aviso.priority === "alta" ? "Alta Prioridade" : aviso.priority === "media" ? "Média Prioridade" : "Baixa Prioridade"}
                </span>
              </div>
              <p className="text-foreground mb-4">{aviso.message}</p>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Por: {aviso.author}</span>
                <span>{aviso.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
