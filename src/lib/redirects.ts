export interface LegacyRedirect {
  source: string;
  destination: string;
  permanent: true;
}

/**
 * URLs do site antigo da DT. Vazio por enquanto: o cliente ainda não confirmou
 * se existe um site anterior. Preencha com `{ source, destination, permanent: true }`.
 */
export const LEGACY_REDIRECTS: LegacyRedirect[] = [];

/** Caminhos estáticos do site; destinos dinâmicos (/obras/x, /servicos/x) vêm do conteúdo. */
export const STATIC_PATHS = ["/", "/empresa", "/servicos", "/obras", "/contato", "/contato/comercial", "/privacidade", "/cookies"];

/** Devolve a lista de problemas (vazia = válida). Não lança. */
export function validateRedirects(list: readonly LegacyRedirect[], knownPaths: readonly string[]): string[] {
  const problems: string[] = [];
  const known = new Set(knownPaths);
  const seen = new Set<string>();
  for (const r of list) {
    if (!r.source.startsWith("/")) problems.push(`source sem "/" inicial: ${r.source}`);
    if (seen.has(r.source)) problems.push(`source repetido: ${r.source}`);
    seen.add(r.source);
    if (r.permanent !== true) problems.push(`redirect não permanente: ${r.source}`);
    if (r.source === r.destination) problems.push(`redirect para si mesmo: ${r.source}`);
    if (!known.has(r.destination)) problems.push(`destino inexistente: ${r.destination}`);
  }
  for (const r of list) {
    if (seen.has(r.destination) && r.destination !== r.source) problems.push(`cadeia de redirects: ${r.source} -> ${r.destination}`);
  }
  return problems;
}
