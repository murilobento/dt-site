import { describe, expect, it } from "vitest";
import { buildWhatsAppUrl, formatWhatsAppDisplay } from "@/lib/whatsapp";

const PHONE = "5565999990000";
const text = (u: string) => new URL(u).searchParams.get("text");

describe("buildWhatsAppUrl", () => {
  it("monta wa.me com mensagem da página de obra", () => {
    const u = new URL(buildWhatsAppUrl(PHONE, "/obras/pinhalzinho-sc", "Pinhalzinho (SC)"));
    expect(u.origin + u.pathname).toBe("https://wa.me/5565999990000");
    expect(u.searchParams.get("text")).toBe("Olá! Vi a obra Pinhalzinho (SC) no site da DT e quero falar com o comercial.");
  });

  it("mensagem padrão nas demais páginas", () =>
    expect(text(buildWhatsAppUrl(PHONE, "/empresa"))).toBe("Olá! Vim pelo site da DT e quero falar com o comercial."));

  it("serviço usa o nome do serviço", () =>
    expect(text(buildWhatsAppUrl(PHONE, "/servicos/restauracao", "Restauração"))).toBe(
      "Olá! Vi o serviço Restauração no site da DT e quero falar com o comercial.",
    ));

  it("sem título, obra e serviço usam a mensagem padrão", () => {
    const padrao = "Olá! Vim pelo site da DT e quero falar com o comercial.";
    expect(text(buildWhatsAppUrl(PHONE, "/obras/x"))).toBe(padrao);
    expect(text(buildWhatsAppUrl(PHONE, "/servicos/x", "  "))).toBe(padrao);
  });

  it("listagens /obras e /servicos usam a mensagem padrão", () => {
    const padrao = "Olá! Vim pelo site da DT e quero falar com o comercial.";
    expect(text(buildWhatsAppUrl(PHONE, "/obras", "Obras"))).toBe(padrao);
    expect(text(buildWhatsAppUrl(PHONE, "/servicos", "Serviços"))).toBe(padrao);
  });

  it("higieniza o telefone para só dígitos", () =>
    expect(new URL(buildWhatsAppUrl("+55 (65) 99999-0000", "/")).pathname).toBe("/5565999990000"));
});

describe("formatWhatsAppDisplay", () => {
  it("formata celular brasileiro", () => {
    expect(formatWhatsAppDisplay("5514981734581")).toBe("+55 (14) 98173-4581");
  });
  it("número fora do padrão volta só com dígitos", () => {
    expect(formatWhatsAppDisplay("+1 555 0100")).toBe("+15550100");
  });
});
