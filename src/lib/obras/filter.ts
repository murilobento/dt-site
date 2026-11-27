import { CATEGORIA_OBRA_LABEL } from "@/lib/obras/categorias";
import { SEGMENTO_LABEL } from "@/lib/segmentos";
import { normalizeForSearch } from "@/lib/text/normalize";
import type { CategoriaObra, Obra, Segmento, StatusObra, UF } from "@/lib/content/types";

export interface ObraFilters {
  categoria?: CategoriaObra;
  segmento?: Segmento;
  uf?: UF;
  status?: StatusObra;
  cliente?: string;
  q?: string;
}

const CATEGORIAS = Object.keys(CATEGORIA_OBRA_LABEL) as CategoriaObra[];
const SEGMENTOS = Object.keys(SEGMENTO_LABEL) as Segmento[];
const STATUS: StatusObra[] = ["em-andamento", "concluida"];
const UFS: UF[] = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

function oneOf<T extends string>(allowed: readonly T[], v: string | null): T | undefined {
  return allowed.find((a) => a === v);
}

/** Nomes de cliente distintos das obras, em ordem alfabética (opções do filtro e validação do parse). */
export function clientesDasObras(obras: Obra[]): string[] {
  return [...new Set(obras.flatMap((o) => (o.cliente ? [o.cliente.nome] : [])))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}

/**
 * Descarta valores vazios e fora dos enums; nunca lança. Com `clientes`, um cliente
 * que não consta da lista também é descartado (link antigo não vira lista vazia).
 */
export function parseObraFilters(sp: URLSearchParams, opts: { clientes?: readonly string[] } = {}): ObraFilters {
  const f: ObraFilters = {};
  const categoria = oneOf(CATEGORIAS, sp.get("categoria"));
  const segmento = oneOf(SEGMENTOS, sp.get("segmento"));
  const uf = oneOf(UFS, sp.get("uf"));
  const status = oneOf(STATUS, sp.get("status"));
  const cliente = sp.get("cliente")?.trim();
  const q = sp.get("q")?.trim();
  if (categoria) f.categoria = categoria;
  if (segmento) f.segmento = segmento;
  if (uf) f.uf = uf;
  if (status) f.status = status;
  if (cliente && (!opts.clientes || opts.clientes.includes(cliente))) f.cliente = cliente;
  if (q) f.q = q;
  return f;
}

/** Ordem estável: categoria, segmento, uf, status, cliente, q. Omite vazios. */
export function serializeObraFilters(f: ObraFilters): string {
  const sp = new URLSearchParams();
  for (const k of ["categoria", "segmento", "uf", "status", "cliente", "q"] as const) {
    const v = f[k]?.trim();
    if (v) sp.set(k, v);
  }
  return sp.toString();
}

/**
 * Filtros combinam com E. `q` casa título, cidade, UF, cliente e nomes de serviço
 * (`servicoNomes` mapeia slug → título).
 */
export function filterObras(
  obras: Obra[],
  f: ObraFilters,
  servicoNomes: Record<string, string> = {},
): Obra[] {
  const q = f.q ? normalizeForSearch(f.q) : "";
  return obras.filter((o) => {
    if (f.categoria && o.categoria !== f.categoria) return false;
    if (f.segmento && o.segmento !== f.segmento) return false;
    if (f.uf && o.uf !== f.uf) return false;
    if (f.status && o.status !== f.status) return false;
    if (f.cliente && o.cliente?.nome !== f.cliente) return false;
    if (!q) return true;
    const haystack = normalizeForSearch(
      [o.titulo, o.cidade, o.uf, o.cliente?.nome ?? "", ...o.servicos.map((s) => servicoNomes[s] ?? "")].join(" "),
    );
    return haystack.includes(q);
  });
}
