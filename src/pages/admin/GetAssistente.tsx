import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { loadAssistenteConfig, saveAssistenteConfig } from "@/wiring/assistente";

export default function GetAssistente() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    id: undefined as string | undefined,
    horarioPadraoEnvio: "09:00",
    diasAntecedenciaPadrao: 3,
    mensagemPersonalizadaWhatsApp: "",
    lembretesAutomaticosAtivos: true,
    notificarAdminSobreEnvios: false,
    emailAdminNotificacao: "",
    recorrenciaLembretes: true,
  });

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const data = await loadAssistenteConfig();
        if (data) setConfig({ ...config, ...data });
      } catch (e: any) {
        toast({ title: "Erro ao carregar configuração", description: e.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await saveAssistenteConfig(config as any);
      setConfig({ ...config, ...saved });
      toast({ title: "Configuração salva" });
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <CardTitle className="text-2xl">Assistente de Lembretes</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Horário Padrão</Label>
                <Input type="time" value={config.horarioPadraoEnvio} onChange={(e) => setConfig({ ...config, horarioPadraoEnvio: e.target.value })} />
              </div>
              <div>
                <Label>Dias de Antecedência</Label>
                <Input type="number" min={1} max={30} value={config.diasAntecedenciaPadrao} onChange={(e) => setConfig({ ...config, diasAntecedenciaPadrao: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
            <div>
              <Label>Mensagem WhatsApp</Label>
              <Textarea rows={6} value={config.mensagemPersonalizadaWhatsApp || ""} onChange={(e) => setConfig({ ...config, mensagemPersonalizadaWhatsApp: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                <div className="text-sm">Lembretes Automáticos</div>
                <Switch checked={config.lembretesAutomaticosAtivos} onCheckedChange={(v) => setConfig({ ...config, lembretesAutomaticosAtivos: v })} />
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="text-sm">Recorrência de Lembretes</div>
                <Switch checked={config.recorrenciaLembretes} onCheckedChange={(v) => setConfig({ ...config, recorrenciaLembretes: v })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Email do Admin</Label>
                <Input type="email" value={config.emailAdminNotificacao || ""} onChange={(e) => setConfig({ ...config, emailAdminNotificacao: e.target.value })} />
              </div>
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                <div className="text-sm">Notificar Admin</div>
                <Switch checked={config.notificarAdminSobreEnvios} onCheckedChange={(v) => setConfig({ ...config, notificarAdminSobreEnvios: v })} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar Configurações"}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

