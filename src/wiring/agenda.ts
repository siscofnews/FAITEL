import { AgendaAnual } from "@/entities/AgendaAnual";

export async function loadAgendaPublica() {
  return await AgendaAnual.filter({ publicado: true }, 'data_inicio');
}

export async function loadAgendaPublicaCemadeb() {
  return await AgendaAnual.filter({ publicado: true, is_cemadeb: true }, 'data_inicio');
}

