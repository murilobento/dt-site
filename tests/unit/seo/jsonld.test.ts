import { describe, expect, it } from "vitest";
import type { Obra } from "@/lib/content/types";
import { breadcrumbJsonLd, obraJsonLd } from "@/lib/seo/jsonld";

const img = { url: "/capa.webp", alt: "a", width: 10, height: 10 };
const obra: Obra = {
  slug: "pinhalzinho-sc", titulo: "Restauração em Pinhalzinho", segmento: "infraestrutura", categoria: "rodoviaria", servicos: [],
  cidade: "Pinhalzinho", uf: "SC", inicio: "2024-06", termino: "2025-02", status: "concluida",
  descricao: "d", capa: img, galeria: [{ ...img, url: "/g1.webp" }], destaque: false,
  coordenadas: { lat: -26.8, lng: -52.9 },
};

describe("jsonld", () => {
  it("obraJsonLd tem tipo, lugar e imagem absoluta", () => {
    const j = obraJsonLd(obra, "https://dtconstrutora.com.br");
    expect(j).toMatchObject({
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: obra.titulo,
      dateCreated: "2025-02",
      image: ["https://dtconstrutora.com.br/capa.webp", "https://dtconstrutora.com.br/g1.webp"],
      locationCreated: { "@type": "Place", address: { addressLocality: "Pinhalzinho", addressRegion: "SC" } },
    });
  });

  it("obraJsonLd sem coordenadas, término e cliente não emite chaves vazias", () => {
    const { coordenadas: _c, termino: _t, ...resto } = obra;
    void _c; void _t;
    const j = obraJsonLd({ ...resto, galeria: [] }, "https://x.com") as Record<string, unknown>;
    expect(j.dateCreated).toBe("2024-06");
    expect(j.sponsor).toBeUndefined();
    expect((j.locationCreated as Record<string, unknown>).geo).toBeUndefined();
  });

  it("breadcrumbJsonLd numera posições", () => {
    const j = breadcrumbJsonLd([{ name: "Início", url: "https://x/" }, { name: "Obras", url: "https://x/obras" }]);
    expect(j).toMatchObject({
      "@type": "BreadcrumbList",
      itemListElement: [{ position: 1, name: "Início", item: "https://x/" }, { position: 2, name: "Obras" }],
    });
  });
});
