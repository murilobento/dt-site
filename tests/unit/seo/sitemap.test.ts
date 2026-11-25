import { beforeEach, describe, expect, it, vi } from "vitest";
import { fixturesSource } from "@/lib/content/fixtures-source";
import type { ContentSource } from "@/lib/content/source";
import sitemap from "@/app/sitemap";

const SITE = "https://dtconstrutora.com.br";
let source: ContentSource;
vi.mock("@/lib/content/source", () => ({ getContentSource: () => source }));

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", SITE);
  source = fixturesSource;
});

describe("sitemap", () => {
  it("lista páginas fixas, todos os serviços e todas as obras publicadas, sem /studio", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toEqual(
      expect.arrayContaining([
        `${SITE}/`, `${SITE}/empresa`, `${SITE}/servicos`, `${SITE}/obras`, `${SITE}/contato`,
        `${SITE}/contato/comercial`, `${SITE}/privacidade`, `${SITE}/cookies`,
        `${SITE}/obras/pinhalzinho-sc`, `${SITE}/servicos/restauracao`,
      ]),
    );
    expect(urls.some((u) => u.includes("/studio"))).toBe(false);
    expect(new Set(urls).size).toBe(urls.length);
    const obras = await fixturesSource.getObras();
    for (const o of obras) expect(urls).toContain(`${SITE}/obras/${o.slug}`);
  });

  it("obra despublicada (ausente da fonte) some do sitemap", async () => {
    const obras = (await fixturesSource.getObras()).filter((o) => o.slug !== "pinhalzinho-sc");
    source = { ...fixturesSource, getObras: async () => obras };
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).not.toContain(`${SITE}/obras/pinhalzinho-sc`);
    expect(urls).toContain(`${SITE}/obras/regente-feijo-sp`);
  });

  it("lastModified vem de atualizadoEm; sem ele, a chave é omitida", async () => {
    const [primeira, ...resto] = await fixturesSource.getObras();
    source = {
      ...fixturesSource,
      getObras: async () => [{ ...primeira, atualizadoEm: "2026-01-02T10:00:00Z" }, ...resto],
    };
    const entries = await sitemap();
    const com = entries.find((e) => e.url === `${SITE}/obras/${primeira.slug}`);
    expect(com?.lastModified).toBe("2026-01-02T10:00:00Z");
    const sem = entries.find((e) => e.url === `${SITE}/obras/${resto[0].slug}`);
    expect(sem).not.toHaveProperty("lastModified");
  });
});
