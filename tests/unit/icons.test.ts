import { describe, expect, it } from "vitest";
import servicos from "@/lib/content/fixtures/servicos.json";
import diferenciais from "@/lib/content/fixtures/diferenciais.json";
import { DIFERENCIAL_ICONES, SERVICO_ICONES } from "@/lib/icons";

describe("mapa de ícones", () => {
  it("cobre todos os ícones usados nas fixtures", () => {
    for (const s of servicos) if (s.icone) expect(SERVICO_ICONES).toHaveProperty(s.icone);
    for (const d of diferenciais) expect(DIFERENCIAL_ICONES).toHaveProperty(d.icone);
  });
});
