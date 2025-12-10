import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Save, User, Building2, Bell, Shield, Globe, Palette, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const tabs = [
  { key: "perfil", label: "Perfil", icon: User },
  { key: "organizacao", label: "Organização", icon: Building2 },
  { key: "notificacoes", label: "Notificações", icon: Bell },
  { key: "seguranca", label: "Segurança", icon: Shield },
  { key: "idioma", label: "Idioma", icon: Globe },
  { key: "aparencia", label: "Aparência", icon: Palette },
];

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState("perfil");

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">Personalize sua experiência no sistema</p>
        </div>
        <Button variant="gold">
          <Save className="h-5 w-5 mr-2" />
          Salvar Alterações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  activeTab === tab.key
                    ? "gradient-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === "perfil" && (
            <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in">
              <h2 className="text-lg font-display font-bold text-foreground mb-6">Informações do Perfil</h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full gradient-gold flex items-center justify-center">
                  <span className="text-2xl font-bold text-navy">MA</span>
                </div>
                <div>
                  <Button variant="outline" size="sm">Alterar Foto</Button>
                  <p className="text-xs text-muted-foreground mt-2">JPG, PNG ou GIF. Máximo 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nome Completo</label>
                  <input
                    type="text"
                    defaultValue="Administrador Matriz"
                    className="w-full h-12 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">E-mail</label>
                  <input
                    type="email"
                    defaultValue="admin@igrejamatriz.com"
                    className="w-full h-12 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Telefone</label>
                  <input
                    type="tel"
                    defaultValue="(11) 99999-0000"
                    className="w-full h-12 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Função</label>
                  <input
                    type="text"
                    defaultValue="Administrador"
                    disabled
                    className="w-full h-12 px-4 rounded-xl border border-input bg-muted text-sm text-muted-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "organizacao" && (
            <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in">
              <h2 className="text-lg font-display font-bold text-foreground mb-6">Dados da Organização</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Nome da Igreja</label>
                  <input
                    type="text"
                    defaultValue="Igreja Matriz Central"
                    className="w-full h-12 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Sigla</label>
                  <input
                    type="text"
                    defaultValue="IMC"
                    className="w-full h-12 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">CNPJ</label>
                  <input
                    type="text"
                    defaultValue="00.000.000/0001-00"
                    className="w-full h-12 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">CEP</label>
                  <input
                    type="text"
                    defaultValue="01310-100"
                    className="w-full h-12 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Cidade</label>
                  <input
                    type="text"
                    defaultValue="São Paulo"
                    className="w-full h-12 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Endereço</label>
                  <input
                    type="text"
                    defaultValue="Av. Paulista, 1000 - Bela Vista"
                    className="w-full h-12 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "notificacoes" && (
            <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in">
              <h2 className="text-lg font-display font-bold text-foreground mb-6">Preferências de Notificações</h2>
              
              <div className="space-y-4">
                {[
                  { title: "Novos membros cadastrados", description: "Receber notificação quando um novo membro for cadastrado" },
                  { title: "Escalas publicadas", description: "Ser notificado quando uma nova escala for publicada" },
                  { title: "Mensagens no chat", description: "Receber notificações de novas mensagens" },
                  { title: "Avisos importantes", description: "Notificações de avisos com alta prioridade" },
                  { title: "Relatórios semanais", description: "Receber resumo semanal por e-mail" },
                  { title: "Vencimento de pagamentos", description: "Alertas sobre mensalidades próximas do vencimento" },
                ].map((item, index) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={index < 4} className="sr-only peer" />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "seguranca" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-lg font-display font-bold text-foreground mb-6">Alterar Senha</h2>
                
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Senha Atual</label>
                    <input
                      type="password"
                      className="w-full h-12 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Nova Senha</label>
                    <input
                      type="password"
                      className="w-full h-12 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Confirmar Nova Senha</label>
                    <input
                      type="password"
                      className="w-full h-12 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <Button variant="default">Alterar Senha</Button>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-display font-bold text-foreground">Autenticação em Duas Etapas</h2>
                    <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                    <Shield className="h-4 w-4" />
                    Ativado
                  </div>
                </div>
                <Button variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Gerenciar 2FA
                </Button>
              </div>
            </div>
          )}

          {activeTab === "idioma" && (
            <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in">
              <h2 className="text-lg font-display font-bold text-foreground mb-6">Configurações de Idioma</h2>
              
              <div className="space-y-4">
                {[
                  { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷" },
                  { code: "en-US", name: "English (US)", flag: "🇺🇸" },
                  { code: "es-ES", name: "Español", flag: "🇪🇸" },
                  { code: "fr-FR", name: "Français", flag: "🇫🇷" },
                ].map((lang, index) => (
                  <label
                    key={lang.code}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors",
                      index === 0 ? "bg-primary/10 border-2 border-primary" : "bg-secondary/50 hover:bg-secondary"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="text-sm font-medium text-foreground">{lang.name}</span>
                    </div>
                    <input
                      type="radio"
                      name="language"
                      defaultChecked={index === 0}
                      className="h-4 w-4 text-primary"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === "aparencia" && (
            <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in">
              <h2 className="text-lg font-display font-bold text-foreground mb-6">Tema do Sistema</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: "light", name: "Claro", preview: "bg-white border-2" },
                  { key: "dark", name: "Escuro", preview: "bg-gray-900 border-2" },
                  { key: "system", name: "Sistema", preview: "bg-gradient-to-r from-white to-gray-900 border-2" },
                ].map((theme, index) => (
                  <label
                    key={theme.key}
                    className={cn(
                      "flex flex-col items-center p-4 rounded-xl cursor-pointer transition-colors",
                      index === 0 ? "bg-primary/10 border-2 border-primary" : "bg-secondary/50 hover:bg-secondary border-2 border-transparent"
                    )}
                  >
                    <div className={cn("w-full h-20 rounded-lg mb-3", theme.preview)} />
                    <span className="text-sm font-medium text-foreground">{theme.name}</span>
                    <input
                      type="radio"
                      name="theme"
                      defaultChecked={index === 0}
                      className="sr-only"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
