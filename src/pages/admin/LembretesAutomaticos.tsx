import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, Copy, MessageCircle, RefreshCw, Users, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { loadAssistenteConfig } from "@/wiring/assistente";
import { calcularPendenciasHoje, registrarEnvioWhats } from "@/wiring/lembretes";

export default function LembretesAutomaticos() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [lembretesPendentes, setLembretesPendentes] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [currentLembrete, setCurrentLembrete] = useState<any>(null);
  const [whatsAppMessageContent, setWhatsAppMessageContent] = useState("");
  const [whatsAppNumber, setWhatsAppNumber] = useState("");

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchMessages, setBatchMessages] = useState<any[]>([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);

  const calcular = useCallback(async (configAssistente: any) => {
    setIsLoading(true);
    try {
      const lembretes = await calcularPendenciasHoje(!!configAssistente?.recorrenciaLembretes);
      setLembretesPendentes(lembretes);
    } catch (error: any) {
      toast({ title: "Erro ao calcular lembretes", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const configData = await loadAssistenteConfig();
      if (configData) {
        setConfig(configData);
        await calcular(configData);
      } else {
        toast({ title: "Configuração do assistente não encontrada", variant: "destructive" });
        setConfig(null);
        setLembretesPendentes([]);
      }
    } catch (error: any) {
      toast({ title: "Erro ao carregar dados", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [calcular]);

  useEffect(() => { loadData(); }, [loadData]);

  const gerarMensagemWhatsApp = (lembrete: any) => {
    const dataFormatada = format(lembrete.dataEvento, "dd 'de' MMMM", { locale: ptBR });
    const tipoEvento = lembrete.tipo === 'escala' ? 'sua escala' : 'o evento';
    const nomeEvento = lembrete.tipo === 'escala' ? (lembrete.evento.nome_escala || lembrete.evento.evento) : (lembrete.evento.nome_evento || lembrete.evento.titulo);
    return `Olá ${lembrete.contato.nome}! Este é um lembrete para ${tipoEvento} "${nomeEvento}" que acontecerá em ${dataFormatada}.`;
  };

  const abrirModalWhatsAppIndividual = (lembrete: any) => {
    const mensagem = gerarMensagemWhatsApp(lembrete);
    setWhatsAppMessageContent(mensagem);
    setWhatsAppNumber(lembrete.contato.whatsapp);
    setCurrentLembrete(lembrete);
    setIsWhatsAppModalOpen(true);
  };

  const handleWhatsAppSent = async (lembrete: any) => {
    try {
      await registrarEnvioWhats({ evento: lembrete.evento, contato: lembrete.contato, tipo: lembrete.tipo, mensagem: whatsAppMessageContent });
      toast({ title: "Lembrete registrado como enviado" });
      setIsWhatsAppModalOpen(false);
      await loadData();
    } catch (error: any) {
      toast({ title: "Erro ao registrar envio", description: error.message, variant: "destructive" });
    }
  };

  const iniciarEnvioEmLote = () => {
    const messages = lembretesPendentes.filter(l => l.contato?.whatsapp && l.status !== 'enviado_hoje').map((lembrete: any) => ({
      id: lembrete.id,
      nome: lembrete.contato.nome,
      numero: lembrete.contato.whatsapp,
      mensagem: gerarMensagemWhatsApp(lembrete),
      lembrete,
    }));
    setBatchMessages(messages);
    setCurrentBatchIndex(0);
    setIsBatchModalOpen(true);
  };

  const proximoLembreteEmLote = async () => {
    const current = batchMessages[currentBatchIndex];
    if (current) {
      try {
        await registrarEnvioWhats({ evento: current.lembrete.evento, contato: current.lembrete.contato, tipo: current.lembrete.tipo, mensagem: current.mensagem });
        toast({ title: `Lembrete para ${current.nome} registrado` });
      } catch (error: any) {
        toast({ title: `Erro ao registrar envio para ${current.nome}`, description: error.message, variant: "destructive" });
      }
    }
    setCurrentBatchIndex((i) => i + 1);
  };

  const finalizarEnvioEmLote = async () => {
    setIsBatchModalOpen(false);
    await loadData();
  };

  const getLembretesPorStatus = (status: string) => lembretesPendentes.filter((l) => l.status === status);
  const todosPendentes = lembretesPendentes.filter((l) => l.status !== 'enviado_hoje');
  const lembretesComWhatsApp = todosPendentes.filter((l) => l.contato?.whatsapp && l.contato.whatsapp.trim() !== "");

  const BadgeStatus = ({ status }: { status: string }) => {
    if (status === 'pendente') return <Badge variant="secondary">Pendente</Badge>;
    if (status === 'atrasado') return <Badge className="bg-destructive/20 text-destructive">Atrasado</Badge>;
    if (status === 'recorrente_pendente') return <Badge className="bg-blue-100 text-blue-800">Recorrente</Badge>;
    if (status === 'enviado_hoje') return <Badge className="bg-green-100 text-green-800">Enviado Hoje</Badge>;
    return null;
  };

  const CardLembrete = ({ lembrete }: { lembrete: any }) => {
    const dataLembreteFormatada = format(lembrete.dataLembrete, "dd/MM/yyyy");
    const dataEventoFormatada = format(lembrete.dataEvento, "dd/MM/yyyy");
    const nomeEvento = lembrete.tipo === 'escala' ? (lembrete.evento.nome_escala || lembrete.evento.evento) : (lembrete.evento.nome_evento || lembrete.evento.titulo);
    return (
      <Card className="flex items-center p-4">
        <div className="flex-grow">
          <h4 className="text-lg font-semibold">{lembrete.contato.nome}</h4>
          <p className="text-sm text-gray-600">{lembrete.tipo === 'escala' ? 'Escala:' : 'Evento:'} {nomeEvento} em {dataEventoFormatada}</p>
          <p className="text-xs text-gray-500">Lembrete para {dataLembreteFormatada}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <BadgeStatus status={lembrete.status} />
          {lembrete.contato.whatsapp && lembrete.contato.whatsapp.trim() !== "" && lembrete.status !== 'enviado_hoje' && (
            <Button size="sm" onClick={() => abrirModalWhatsAppIndividual(lembrete)} className="bg-green-500 hover:bg-green-600 text-white">
              <MessageCircle className="w-4 h-4 mr-1" /> Enviar
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <Card className="shadow-xl bg-white/90 backdrop-blur-sm border border-orange-200">
        <CardHeader className="border-b border-orange-200 pb-4">
          <CardTitle className="text-2xl font-bold text-orange-700">Lembretes Automáticos</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Button onClick={loadData} variant="outline" disabled={isLoading}>
              <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar Lista
            </Button>
            {lembretesComWhatsApp.length > 0 && (
              <Button onClick={iniciarEnvioEmLote} className="bg-green-500 hover:bg-green-600 text-white">
                <MessageCircle className="w-5 h-5 mr-2" />
                Enviar {lembretesComWhatsApp.length} via WhatsApp
              </Button>
            )}
            {config && (
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${config.recorrenciaLembretes ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Recorrência {config.recorrenciaLembretes ? 'ativa' : 'inativa'}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todosPendentes.filter(l => l.status === 'pendente').length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
                <AlertCircle className="w-4 h-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getLembretesPorStatus('atrasado').length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enviados Hoje</CardTitle>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lembretesPendentes.filter(l => l.status === 'enviado_hoje').length}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pendentes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pendentes">Pendentes ({todosPendentes.filter(l => l.status === 'pendente').length})</TabsTrigger>
              <TabsTrigger value="atrasados">Atrasados ({getLembretesPorStatus('atrasado').length})</TabsTrigger>
              <TabsTrigger value="enviados">Enviados Hoje ({lembretesPendentes.filter(l => l.status === 'enviado_hoje').length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pendentes" className="mt-4 space-y-4">
              {todosPendentes.filter(l => l.status === 'pendente').length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum lembrete pendente!</h3>
                  <p className="text-slate-600">Todos os lembretes para hoje foram enviados ou não há nenhum programado.</p>
                </div>
              ) : (
                todosPendentes.filter(l => l.status === 'pendente').map((lembrete) => <CardLembrete key={lembrete.id} lembrete={lembrete} />)
              )}
            </TabsContent>

            <TabsContent value="atrasados" className="mt-4 space-y-4">
              {getLembretesPorStatus('atrasado').length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum lembrete atrasado!</h3>
                </div>
              ) : (
                getLembretesPorStatus('atrasado').map((lembrete) => <CardLembrete key={lembrete.id} lembrete={lembrete} />)
              )}
            </TabsContent>

            <TabsContent value="enviados" className="mt-4 space-y-4">
              {lembretesPendentes.filter(l => l.status === 'enviado_hoje').length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📭</div>
                  <h3 className="text-lg font-semibold mb-2">Nenhum lembrete enviado hoje.</h3>
                </div>
              ) : (
                lembretesPendentes.filter(l => l.status === 'enviado_hoje').map((lembrete) => <CardLembrete key={lembrete.id} lembrete={lembrete} />)
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {isWhatsAppModalOpen && (
        <Dialog open={isWhatsAppModalOpen} onOpenChange={setIsWhatsAppModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Lembrete via WhatsApp</DialogTitle>
            </DialogHeader>
            <Textarea value={whatsAppMessageContent} readOnly rows={10} />
            <DialogFooter className="gap-2 sm:justify-start">
              <Button onClick={() => { navigator.clipboard.writeText(whatsAppMessageContent); toast({ title: "Mensagem copiada" }); }}>
                <Copy className="w-4 h-4 mr-2" /> Copiar Mensagem
              </Button>
              <Button asChild>
                <a href={`https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(whatsAppMessageContent)}`} target="_blank" rel="noopener noreferrer" onClick={() => handleWhatsAppSent(currentLembrete)}>
                  <MessageCircle className="w-4 h-4 mr-2" /> Abrir no WhatsApp
                </a>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {isBatchModalOpen && (
        <Dialog open={isBatchModalOpen} onOpenChange={setIsBatchModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Envio de Lembretes em Lote</DialogTitle>
            </DialogHeader>
            {currentBatchIndex < batchMessages.length ? (
              <div className="space-y-4">
                <p>Enviando lembrete {currentBatchIndex + 1} de {batchMessages.length}</p>
                <Progress value={(currentBatchIndex / batchMessages.length) * 100} />
                <Card>
                  <CardHeader>
                    <CardTitle>Próximo Lembrete:</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Para:</strong> {batchMessages[currentBatchIndex].nome}</p>
                    <p><strong>Número:</strong> {batchMessages[currentBatchIndex].numero}</p>
                    <Textarea value={batchMessages[currentBatchIndex].mensagem} readOnly rows={8} />
                  </CardContent>
                </Card>
                <DialogFooter>
                  <Button asChild>
                    <a href={`https://wa.me/${batchMessages[currentBatchIndex].numero}?text=${encodeURIComponent(batchMessages[currentBatchIndex].mensagem)}`} target="_blank" rel="noopener noreferrer" onClick={proximoLembreteEmLote}>
                      <MessageCircle className="w-4 h-4 mr-2" /> Enviar e Próximo
                    </a>
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Envio em lote concluído!</h3>
                <p>{batchMessages.length} lembretes processados.</p>
                <DialogFooter className="mt-4">
                  <Button onClick={finalizarEnvioEmLote}>Fechar</Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

