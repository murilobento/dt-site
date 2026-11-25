import type { Segmento } from "@/lib/content/types";

/** Link para o formulário comercial, já com segmento e (opcional) origem do clique. */
export function leadHref(segmento: Segmento, origem?: string): string {
  const params = new URLSearchParams({ segmento });
  if (origem) params.set("origem", origem);
  return `/contato/comercial?${params.toString()}`;
}
