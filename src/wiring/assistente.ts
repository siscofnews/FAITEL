import { ConfiguracaoAssistente, ConfiguracaoAssistenteItem } from "@/entities/ConfiguracaoAssistente";

export async function loadAssistenteConfig() {
  return await ConfiguracaoAssistente.find();
}

export async function saveAssistenteConfig(cfg: ConfiguracaoAssistenteItem) {
  if (cfg.id) return await ConfiguracaoAssistente.update(cfg.id, cfg);
  return await ConfiguracaoAssistente.create(cfg);
}

