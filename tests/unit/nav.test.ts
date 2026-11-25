import { describe, expect, it } from "vitest";
import { CTA, NAV_ITEMS } from "@/lib/nav";

describe("NAV_ITEMS", () => {
  it('menu tem no máximo 6 itens e nenhum "Mais"', () => {
    expect(NAV_ITEMS.length).toBeLessThanOrEqual(6);
    expect(NAV_ITEMS.map((i) => i.label)).not.toContain("Mais");
  });

  it("traz Empresa, Serviços, Obras e Contato; CTA vai para o comercial", () => {
    expect(NAV_ITEMS.map((i) => i.href)).toEqual(["/empresa", "/servicos", "/obras", "/contato"]);
    expect(CTA).toEqual({ label: "Fale com a equipe", href: "/contato/comercial" });
  });
});
