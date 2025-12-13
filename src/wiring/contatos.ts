import { Contato, ContatoItem } from "@/entities/Contato";

export async function loadContatos(order: string = '-updated_at') {
  return await Contato.list(order);
}

export async function saveContato(data: ContatoItem, editingId?: string) {
  if (editingId) return await Contato.update(editingId, data);
  return await Contato.create(data);
}

export async function deleteContato(id: string) {
  return await Contato.delete(id);
}

export async function searchContatos(term: string) {
  return await Contato.search(term);
}

