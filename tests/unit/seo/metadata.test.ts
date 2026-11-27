import { afterEach, describe, expect, it, vi } from "vitest";
import { buildMetadata } from "@/lib/seo/metadata";

afterEach(() => vi.unstubAllEnvs());

describe("buildMetadata", () => {
  it("monta título com sufixo, canonical e Open Graph pt_BR", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://dtconstrutora.com.br/");
    const m = buildMetadata({ title: "Obras", description: "d", path: "/obras" });
    expect(m.title).toEqual({ absolute: "Obras | DT Construtora" });
    expect(m.description).toBe("d");
    expect(m.alternates?.canonical).toBe("https://dtconstrutora.com.br/obras");
    expect(m.openGraph).toMatchObject({
      locale: "pt_BR",
      siteName: "DT Construtora",
      title: "Obras | DT Construtora",
      url: "https://dtconstrutora.com.br/obras",
    });
    expect(m.openGraph).not.toHaveProperty("images");
  });

  it("inclui a imagem quando informada", () => {
    const image = { url: "/capa.webp", width: 10, height: 5, alt: "a" };
    expect(buildMetadata({ title: "t", description: "d", path: "/x", image }).openGraph).toMatchObject({ images: [image] });
  });

  it("absoluteTitle não duplica o sufixo", () => {
    const m = buildMetadata({ title: "DT Construtora e Consultoria | Obras", description: "d", path: "/", absoluteTitle: true });
    expect(m.title).toEqual({ absolute: "DT Construtora e Consultoria | Obras" });
  });
});
