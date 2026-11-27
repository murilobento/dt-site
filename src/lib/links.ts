import type { Segmento } from "@/lib/content/types";
import type { Disciplina } from "@/lib/disciplinas";

type LeadOpts = { segmento?: Segmento; disciplina?: Disciplina; origem?: string };

/** Link para o formulário comercial, com segmento, disciplina e/ou origem do clique. */
export function leadHref({ segmento, disciplina, origem }: LeadOpts = {}): string {
  const params = new URLSearchParams();
  if (segmento) params.set("segmento", segmento);
  if (disciplina) params.set("disciplina", disciplina);
  if (origem) params.set("origem", origem);
  const qs = params.toString();
  return qs ? `/contato?${qs}` : "/contato";
}
