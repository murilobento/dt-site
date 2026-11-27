import { describe, expect, it } from "vitest";
import { leadSchema } from "@/lib/leads/schema";
import { valido } from "./fixtures";

describe("leadSchema", () => {
  it("aceita um lead válido", () => expect(leadSchema.safeParse(valido).success).toBe(true));
  it("e-mail inválido usa a microcopy do PRD", () => {
    const r = leadSchema.safeParse({ ...valido, email: "joao" });
    expect(r.error!.flatten().fieldErrors.email![0]).toBe(
      "Confira o e-mail. Ele precisa ter @ e um domínio, como nome@empresa.com.br.",
    );
  });
  it("consentimento é obrigatório", () =>
    expect(leadSchema.safeParse({ ...valido, consentimento: false }).success).toBe(false));
  it("cidade/UF é opcional", () => {
    const { cidadeUf: _c, ...sem } = valido;
    void _c;
    expect(leadSchema.safeParse(sem).success).toBe(true);
  });
  it("telefone exige DDD (10+ dígitos)", () => {
    const r = leadSchema.safeParse({ ...valido, telefone: "9999-0000" });
    expect(r.error!.flatten().fieldErrors.telefone![0]).toBe("Informe um telefone com DDD.");
  });
  it("disciplina desconhecida ou vazia é rejeitada", () => {
    for (const disciplina of ["outro", "", "constructor"]) {
      const r = leadSchema.safeParse({ ...valido, disciplina });
      expect(r.error!.flatten().fieldErrors.disciplina![0]).toBe("Escolha a disciplina principal.");
    }
  });
  it("campos obrigatórios vazios têm mensagem própria", () => {
    const r = leadSchema.safeParse({ ...valido, nome: " ", escopo: "" });
    const e = r.error!.flatten().fieldErrors;
    expect(e.nome![0]).toBe("Informe seu nome.");
    expect(e.escopo![0]).toBe("Descreva o escopo, o prazo ou o número do edital.");
  });
});
