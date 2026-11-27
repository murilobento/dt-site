import type { CategoriaObra, Segmento, Servico } from "@/lib/content/types";

export type Disciplina =
  | "rodoviaria-pavimentacao"
  | "terraplanagem-drenagens"
  | "sau-pre"
  | "edificacao-reforma"
  | "consultoria";

export const DISCIPLINAS: Disciplina[] = [
  "rodoviaria-pavimentacao",
  "terraplanagem-drenagens",
  "sau-pre",
  "edificacao-reforma",
  "consultoria",
];

export function isDisciplina(v: unknown): v is Disciplina {
  return typeof v === "string" && (DISCIPLINAS as string[]).includes(v);
}

/** Disciplina inicial do formulário: `disciplina` da URL vence; `segmento` legado mapeia para a primeira disciplina dele. */
export function disciplinaInicial(disciplina?: string, segmento?: string): Disciplina | undefined {
  if (isDisciplina(disciplina)) return disciplina;
  return DISCIPLINAS.find((d) => segmento !== undefined && Object.hasOwn(DISCIPLINA_SEGMENTO, d) && DISCIPLINA_SEGMENTO[d] === segmento);
}

export const DISCIPLINA_LABEL: Record<Disciplina, string> = {
  "rodoviaria-pavimentacao": "Rodoviária e Pavimentação",
  "terraplanagem-drenagens": "Terraplanagem e Drenagens",
  "sau-pre": "SAU e PRE",
  "edificacao-reforma": "Edificação e Reforma",
  consultoria: "Consultoria",
};

/** Texto das opções do formulário de contato e do assunto do e-mail (redação do layout). */
export const DISCIPLINA_OPCAO: Record<Disciplina, string> = {
  "rodoviaria-pavimentacao": "Obra rodoviária / pavimentação",
  "terraplanagem-drenagens": "Terraplanagem e drenagens",
  "sau-pre": "SAU / PRE rodoviário",
  "edificacao-reforma": "Edificação / reforma predial",
  consultoria: "Consultoria / projeto / laudo",
};

export const DISCIPLINA_SEGMENTO: Record<Disciplina, Segmento> = {
  "rodoviaria-pavimentacao": "infraestrutura",
  "terraplanagem-drenagens": "infraestrutura",
  "sau-pre": "infraestrutura",
  "edificacao-reforma": "obras-civis",
  consultoria: "infraestrutura",
};

/** Disciplina de contato sugerida para um serviço (categoria, ícone e, por fim, o padrão rodoviário). */
export function disciplinaDoServico(servico: Pick<Servico, "categoria" | "icone">): Disciplina {
  if (servico.categoria === "consultoria") return "consultoria";
  if (servico.categoria === "edificacoes") return "edificacao-reforma";
  if (servico.icone === "base-operacional") return "sau-pre";
  if (servico.icone === "terraplanagem" || servico.icone === "drenagem") return "terraplanagem-drenagens";
  return "rodoviaria-pavimentacao";
}

/** Disciplina de contato sugerida para uma obra, pela categoria. */
export function disciplinaDaObra(categoria: CategoriaObra): Disciplina {
  if (categoria === "saupre") return "sau-pre";
  if (categoria === "edificacoes") return "edificacao-reforma";
  return "rodoviaria-pavimentacao";
}
