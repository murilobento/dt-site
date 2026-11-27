import { describe, expect, it } from "vitest";
import { candidaturaSchema } from "@/lib/leads/candidatura";
import { EMAIL_ERROR } from "@/lib/leads/schema";
import { buildCandidaturaSubject } from "@/lib/leads/send";
import { candidaturaValida } from "./fixtures";

function erros(input: Record<string, unknown>) {
  const r = candidaturaSchema.safeParse(input);
  return r.success ? {} : r.error.flatten().fieldErrors;
}

describe("candidaturaSchema", () => {
  it("aceita candidatura válida", () => {
    expect(candidaturaSchema.safeParse(candidaturaValida).success).toBe(true);
  });
  it("mensagens curtas em pt-BR por campo", () => {
    const e = erros({ nome: " ", email: "x", telefone: "123", area: "", resumo: "", consentimento: false });
    expect(e.nome).toEqual(["Informe seu nome."]);
    expect(e.email?.[0]).toBe(EMAIL_ERROR);
    expect(e.telefone).toEqual(["Informe um telefone com DDD."]);
    expect(e.area).toEqual(["Escolha a área de interesse."]);
    expect(e.resumo).toEqual(["Conte um pouco da sua experiência ou cole o link do currículo."]);
    expect(e.consentimento).toEqual(["É preciso aceitar para analisarmos sua candidatura."]);
  });
});

describe("assunto da candidatura", () => {
  it("segue o padrão, uma linha só, e marca não verificado", () => {
    expect(buildCandidaturaSubject(candidaturaValida)).toBe("[Site] Candidatura — Segurança do Trabalho");
    expect(buildCandidaturaSubject({ ...candidaturaValida, area: "A\r\nBcc: x@y.com" })).not.toMatch(/[\r\n]/);
    expect(buildCandidaturaSubject(candidaturaValida, true)).toBe("[não verificado] [Site] Candidatura — Segurança do Trabalho");
  });
});

describe("areasPermitidas", () => {
  it("junta vagas do CMS e áreas genéricas sem repetir", async () => {
    const { areasPermitidas, AREAS_GENERICAS } = await import("@/lib/leads/candidatura");
    const areas = areasPermitidas([{ titulo: "Vaga X" }, { titulo: "Administrativo" }]);
    expect(areas).toContain("Vaga X");
    expect(areas.filter((a) => a === "Administrativo")).toHaveLength(1);
    expect(areas).toHaveLength(AREAS_GENERICAS.length + 1);
  });
});
