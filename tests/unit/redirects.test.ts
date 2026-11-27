import { describe, expect, it } from "vitest";
import { LEGACY_REDIRECTS, STATIC_PATHS, validateRedirects, type LegacyRedirect } from "@/lib/redirects";

const known = [...STATIC_PATHS, "/obras/pinhalzinho-sc", "/servicos/restauracao"];
const r = (source: string, destination: string): LegacyRedirect => ({ source, destination, permanent: true });

describe("redirects", () => {
  it("LEGACY_REDIRECTS atual é válido (todo destino existe, nenhum source repete)", () => {
    expect(validateRedirects(LEGACY_REDIRECTS, known)).toEqual([]);
  });

  it("aceita lista válida", () => {
    expect(validateRedirects([r("/quem-somos", "/sobre"), r("/portfolio", "/obras")], known)).toEqual([]);
  });

  it("aponta source repetido", () => {
    const p = validateRedirects([r("/a", "/sobre"), r("/a", "/obras")], known);
    expect(p).toEqual(["source repetido: /a"]);
  });

  it("aponta destino inexistente", () => {
    expect(validateRedirects([r("/a", "/nao-existe")], known)).toEqual(["destino inexistente: /nao-existe"]);
  });

  it("aponta loop e source sem barra", () => {
    const p = validateRedirects([r("/obras", "/obras"), r("sem-barra", "/sobre")], known);
    expect(p).toContain("redirect para si mesmo: /obras");
    expect(p).toContain('source sem "/" inicial: sem-barra');
  });
});

describe("redirects do Layout v2", () => {
  it("/contato/comercial e /empresa são 301 para as páginas atuais", () => {
    expect(LEGACY_REDIRECTS).toEqual(
      expect.arrayContaining([
        { source: "/empresa", destination: "/sobre", permanent: true },
        { source: "/contato/comercial", destination: "/contato", permanent: true },
      ]),
    );
  });
});
