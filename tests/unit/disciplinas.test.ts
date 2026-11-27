import { describe, expect, it } from "vitest";
import servicos from "@/lib/content/fixtures/servicos.json";
import type { Servico } from "@/lib/content/types";
import {
  DISCIPLINA_LABEL,
  DISCIPLINA_SEGMENTO,
  DISCIPLINAS,
  disciplinaDaObra,
  disciplinaDoServico,
} from "@/lib/disciplinas";

const por = (slug: string) => (servicos as Servico[]).find((s) => s.slug === slug)!;

describe("disciplinas", () => {
  it("rótulos exatos e segmento de roteamento", () => {
    expect(DISCIPLINAS.map((d) => DISCIPLINA_LABEL[d])).toEqual([
      "Rodoviária e Pavimentação",
      "Terraplanagem e Drenagens",
      "SAU e PRE",
      "Edificação e Reforma",
      "Consultoria",
    ]);
    expect(DISCIPLINA_SEGMENTO["edificacao-reforma"]).toBe("obras-civis");
    expect(DISCIPLINA_SEGMENTO.consultoria).toBe("infraestrutura");
  });
  it("disciplinaDoServico por categoria e ícone", () => {
    expect(disciplinaDoServico(por("restauracao"))).toBe("rodoviaria-pavimentacao");
    expect(disciplinaDoServico(por("terraplanagem-drenagem"))).toBe("terraplanagem-drenagens");
    expect(disciplinaDoServico(por("saus-pres"))).toBe("sau-pre");
    expect(disciplinaDoServico(por("reformas"))).toBe("edificacao-reforma");
    expect(disciplinaDoServico(por("laudos-pareceres"))).toBe("consultoria");
  });
  it("disciplinaDaObra", () => {
    expect(disciplinaDaObra("saupre")).toBe("sau-pre");
    expect(disciplinaDaObra("edificacoes")).toBe("edificacao-reforma");
    expect(disciplinaDaObra("rodoviaria")).toBe("rodoviaria-pavimentacao");
  });
});
