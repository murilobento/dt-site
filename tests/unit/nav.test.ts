import { describe, expect, it } from "vitest";
import { CTA, NAV_ITEMS } from "@/lib/nav";

describe("NAV_ITEMS", () => {
  it("tem exatamente os 6 itens do layout, na ordem, sem \"Mais\"", () => {
    expect(NAV_ITEMS).toEqual([
      { label: "Serviços", href: "/servicos" },
      { label: "Obras", href: "/obras" },
      { label: "Consultoria", href: "/servicos#consultoria" },
      { label: "Sobre Nós", href: "/sobre" },
      { label: "Compliance", href: "/compliance" },
      { label: "Contato", href: "/contato" },
    ]);
  });

  it("CTA \"Solicitar proposta\" vai para /contato", () => {
    expect(CTA).toEqual({ label: "Solicitar proposta", href: "/contato" });
  });
});
