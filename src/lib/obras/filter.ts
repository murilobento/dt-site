import { SEGMENTO_LABEL } from "@/lib/segmentos";
import { normalizeForSearch } from "@/lib/text/normalize";
import type { Obra, Segmento, StatusObra, UF } from "@/lib/content/types";

export interface ObraFilters {
  segmento?: Segmento;
  uf?: UF;
  status?: StatusObra;
  cliente?: string;
  q?: string;
}

const SEGMENTOS = Object.keys(SEGMENTO_LABEL) as Segmento[];
const STATUS: StatusObra[] = ["em-andamento", "concluida"];
const UFS: UF[] = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

function oneOf<T extends string>(allowed: readonly T[], v: string | null): T | undefined {
  return allowed.find((a) => a === v);
}

/** Descarta valores vazios e fora dos enums; nunca lança. */
export function parseObraFilters(sp: URLSearchParams): ObraFilters {
  const f: ObraFilters = {};
  const segmento = oneOf(SEGMENTOS, sp.get("segmento"));
  const uf = oneOf(UFS, sp.get("uf"));
  const status = oneOf(STATUS, sp.get("status"));
  const cliente = sp.get("cliente")?.trim();
  const q = sp.get("q")?.trim();
  if (segmento) f.segmento = segmento;
  if (uf) f.uf = uf;
  if (status) f.status = status;
  if (cliente) f.cliente = cliente;
  if (q) f.q = q;
  return f;
}

/** Ordem estável: segmento, uf, status, cliente, q. Omite vazios. */
export function serializeObraFilters(f: ObraFilters): string {
  const sp = new URLSearchParams();
  for (const k of ["segmento", "uf", "status", "cliente", "q"] as const) {
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
