import { describe, expect, it } from "vitest";
import { leadHref } from "@/lib/links";

describe("leadHref", () => {
  it("inclui segmento, disciplina e origem", () =>
    expect(leadHref({ segmento: "infraestrutura", disciplina: "sau-pre", origem: "saus-pres" })).toBe(
      "/contato/comercial?segmento=infraestrutura&disciplina=sau-pre&origem=saus-pres",
    ));
  it("omite o que está ausente", () => {
    expect(leadHref({ segmento: "obras-civis" })).toBe("/contato/comercial?segmento=obras-civis");
    expect(leadHref({ disciplina: "consultoria" })).toBe("/contato/comercial?disciplina=consultoria");
    expect(leadHref({})).toBe("/contato/comercial");
  });
});
