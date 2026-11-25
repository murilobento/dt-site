import type { Configuracoes, Segmento } from "@/lib/content/types";

/** Caixa de entrada que recebe o lead, definida por segmento nas configurações. */
export function resolveLeadRecipient(segmento: Segmento, cfg: Configuracoes): string {
  return cfg.emailsLead[segmento];
}
