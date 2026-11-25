import { beforeEach, describe, expect, it, vi } from "vitest";
import { cfg, valido } from "./fixtures";

vi.mock("@/lib/leads/send", () => ({ sendLeadEmail: vi.fn() }));
vi.mock("@/lib/leads/turnstile", () => ({ verifyTurnstile: vi.fn() }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": "9.9.9.9, 1.1.1.1" }) }));
vi.mock("@/lib/content/source", () => ({ getContentSource: () => ({ getConfiguracoes: async () => cfg }) }));

import { submitLead, type LeadFormState } from "@/app/contato/comercial/actions";
import { sendLeadEmail } from "@/lib/leads/send";
import { verifyTurnstile } from "@/lib/leads/turnstile";

const idle: LeadFormState = { status: "idle" };
function fd(o: Record<string, unknown>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) {
    if (v === true) f.set(k, "on");
    else if (v !== false && v !== undefined) f.set(k, String(v));
  }
  return f;
}

beforeEach(() => {
  vi.mocked(sendLeadEmail).mockReset().mockResolvedValue(undefined);
  vi.mocked(verifyTurnstile).mockReset().mockResolvedValue(true);
});

describe("submitLead", () => {
  it("honeypot preenchido → sucesso aparente, nenhum e-mail", async () => {
    expect((await submitLead(idle, fd({ ...valido, website: "spam" }))).status).toBe("success");
    expect(sendLeadEmail).not.toHaveBeenCalled();
  });
  it("Turnstile inválido → erro genérico, sem e-mail", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(false);
    const s = await submitLead(idle, fd(valido));
    expect(s).toMatchObject({
      status: "error",
      message: "Não foi possível validar o envio. Recarregue a página e tente de novo.",
    });
    expect(sendLeadEmail).not.toHaveBeenCalled();
  });
  it("repassa token e IP ao Turnstile", async () => {
    await submitLead(idle, fd({ ...valido, "cf-turnstile-response": "tok" }));
    expect(verifyTurnstile).toHaveBeenCalledWith("tok", "9.9.9.9");
  });
  it("campos inválidos → erros por campo e valores preservados, sem e-mail", async () => {
    const s = await submitLead(idle, fd({ ...valido, email: "joao", consentimento: false }));
    expect(s).toMatchObject({ status: "error", values: { nome: valido.nome, email: "joao" } });
    if (s.status !== "error") throw new Error("esperava erro");
    expect(s.fieldErrors.email).toContain("Confira o e-mail");
    expect(s.fieldErrors.consentimento).toBe("É preciso aceitar para enviarmos sua mensagem.");
    expect(s.values.consentimento).toBeUndefined();
    expect(sendLeadEmail).not.toHaveBeenCalled();
  });
  it("falha do Resend → erro amigável e valores preservados", async () => {
    vi.mocked(sendLeadEmail).mockRejectedValue(new Error("500"));
    const s = await submitLead(idle, fd(valido));
    expect(s).toMatchObject({
      status: "error",
      values: { nome: valido.nome },
      message: "Não conseguimos enviar agora. Tente de novo em alguns minutos ou fale pelo WhatsApp.",
    });
  });
  it("lead válido envia para o destinatário do segmento", async () => {
    const s = await submitLead(idle, fd(valido));
    expect(s.status).toBe("success");
    expect(sendLeadEmail).toHaveBeenCalledWith(
      expect.objectContaining({ segmento: "infraestrutura", origem: "restauracao" }),
      cfg.emailsLead.infraestrutura,
    );
  });
});
