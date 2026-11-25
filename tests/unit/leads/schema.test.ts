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
  it("cargo é opcional", () => {
    const { cargo: _cargo, ...sem } = valido;
    void _cargo;
    expect(leadSchema.safeParse(sem).success).toBe(true);
  });
  it("telefone exige DDD (10+ dígitos)", () => {
    const r = leadSchema.safeParse({ ...valido, telefone: "9999-0000" });
    expect(r.error!.flatten().fieldErrors.telefone![0]).toBe("Informe um telefone com DDD.");
  });
  it("segmento desconhecido é rejeitado", () => {
    const r = leadSchema.safeParse({ ...valido, segmento: "outro" });
    expect(r.error!.flatten().fieldErrors.segmento![0]).toBe("Escolha o segmento.");
  });
  it("campos obrigatórios vazios têm mensagem própria", () => {
    const r = leadSchema.safeParse({ ...valido, nome: " ", tipoObra: "", local: "", mensagem: "" });
    const e = r.error!.flatten().fieldErrors;
    expect(e.nome![0]).toBe("Informe seu nome.");
    expect(e.tipoObra![0]).toBe("Informe o tipo de obra.");
    expect(e.local![0]).toBe("Informe o local da obra.");
    expect(e.mensagem![0]).toBe("Escreva uma mensagem.");
  });
});
