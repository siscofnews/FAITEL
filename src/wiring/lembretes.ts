import { Escala, EscalaItem } from "@/entities/Escala";
import { Contato, ContatoItem } from "@/entities/Contato";
import { AgendaAnual, AgendaAnualItem } from "@/entities/AgendaAnual";
import { HistoricoLembrete } from "@/entities/HistoricoLembrete";

export async function calcularPendenciasHoje(recorrenciaLembretes: boolean) {
  const hoje = new Date();
  const yyyy = hoje.getFullYear();
  const mm = String(hoje.getMonth() + 1).padStart(2, '0');
  const dd = String(hoje.getDate()).padStart(2, '0');
  const hojeStr = `${yyyy}-${mm}-${dd}`;

  const [escalasData, contatosData, eventosData, historicoHoje] = await Promise.all([
    Escala.filter({/* publicada: true */}, 'data'),
    Contato.filter({ ativo: true }),
    AgendaAnual.filter({ publicado: true }, 'data_inicio'),
    HistoricoLembrete.filter({ dataEnvio: hojeStr }),
  ]);

  const lembretes: any[] = [];

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const isBefore = (a: Date, b: Date) => a.getTime() < b.getTime();
  const isAfter = (a: Date, b: Date) => a.getTime() > b.getTime();

  function processaItem(item: any, tipo: 'escala' | 'evento') {
    const dataEvento = startOfDay(tipo === 'escala' ? new Date(item.data + 'T00:00:00') : new Date(item.data_inicio));
    if (isBefore(dataEvento, startOfDay(hoje))) return;

    (item.escalados || []).forEach((nomeEscalado: string) => {
      const contato = contatosData.find((c: ContatoItem) => c.nome.toLowerCase() === (nomeEscalado || '').toLowerCase());
      if (!contato) return;

      const dataLembrete = new Date(dataEvento);
      dataLembrete.setDate(dataEvento.getDate() - (contato.dias_antecedencia || 1));

      const jaEnviadoHoje = historicoHoje.some((h: any) => h.refId === item.id && h.contatoId === contato.id);
      if (jaEnviadoHoje) {
        lembretes.push({ id: `${tipo}-${item.id}-${contato.id}`, tipo, contato, evento: item, dataEvento, dataLembrete, status: 'enviado_hoje' });
        return;
      }

      if (recorrenciaLembretes) {
        let status: 'pendente' | 'atrasado' = 'pendente';
        if (isBefore(dataLembrete, startOfDay(hoje))) status = 'atrasado';
        lembretes.push({ id: `${tipo}-${item.id}-${contato.id}`, tipo, contato, evento: item, dataEvento, dataLembrete, status });
      } else {
        // Sem recorrência: envia só uma vez se nunca foi enviado
        const jaEnviadoAlgumaVez = false; // otimização: não buscar todo histórico
        if (!jaEnviadoAlgumaVez) {
          let status: 'pendente' | 'atrasado' = 'pendente';
          if (isBefore(dataLembrete, startOfDay(hoje))) status = 'atrasado';
          lembretes.push({ id: `${tipo}-${item.id}-${contato.id}`, tipo, contato, evento: item, dataEvento, dataLembrete, status });
        }
      }
    });
  }

  (escalasData as EscalaItem[]).forEach(escala => processaItem(escala, 'escala'));
  (eventosData as AgendaAnualItem[]).forEach(evento => processaItem(evento, 'evento'));

  return lembretes;
}

export async function registrarEnvioWhats(lembrete: { evento: any; contato: any; tipo: string; mensagem: string; }) {
  const h = new HistoricoLembrete({
    refId: lembrete.evento.id,
    contatoId: lembrete.contato.id,
    mensagem: lembrete.mensagem,
    status: 'enviado',
  });
  return await h.save();
}

