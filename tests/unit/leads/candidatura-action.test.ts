import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { candidaturaValida, cfg } from "./fixtures";

vi.mock("@/lib/leads/send", () => ({ sendCandidaturaEmail: vi.fn() }));
vi.mock("@/lib/leads/turnstile", () => ({ verifyTurnstile: vi.fn() }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": "9.9.9.9, 1.1.1.1" }) }));
vi.mock("@/lib/content/source", () => ({
  getContentSource: () => ({
    getConfiguracoes: async () => cfg,
    getPaginaCompliance: async () => ({ vagas: [{ titulo: "Engenheiro(a) de campo" }] }),
  }),
}));

import { submitCandidatura, type CandidaturaFormState } from "@/app/(site)/compliance/actions";
import { sendCandidaturaEmail } from "@/lib/leads/send";
import { verifyTurnstile } from "@/lib/leads/turnstile";

const idle: CandidaturaFormState = { status: "idle" };
function fd(o: Record<string, unknown>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) {
    if (v === true) f.set(k, "on");
    else if (v !== false && v !== undefined) f.set(k, String(v));
  }
  return f;
}

beforeEach(() => {
  vi.mocked(sendCandidaturaEmail).mockReset().mockResolvedValue(undefined);
  vi.mocked(verifyTurnstile).mockReset().mockResolvedValue(true);
});
afterEach(() => vi.unstubAllEnvs());

describe("submitCandidatura", () => {
  it("honeypot preenchido → sucesso aparente, nenhum e-mail", async () => {
    expect((await submitCandidatura(idle, fd({ ...candidaturaValida, website: "spam" }))).status).toBe("success");
    expect(sendCandidaturaEmail).not.toHaveBeenCalled();
  });
  it("área fora da lista (adulterada) → erro de campo, sem e-mail", async () => {
    const s = await submitCandidatura(idle, fd({ ...candidaturaValida, area: "Qualquer coisa" }));
    expect(s).toMatchObject({ status: "error", fieldErrors: { area: "Escolha a área de interesse." } });
    expect(sendCandidaturaEmail).not.toHaveBeenCalled();
  });
  it("área de uma vaga aberta do CMS é aceita", async () => {
    expect((await submitCandidatura(idle, fd({ ...candidaturaValida, area: "Engenheiro(a) de campo" }))).status).toBe("success");
  });
  it("Turnstile inválido → erro genérico, sem e-mail", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(false);
    const s = await submitCandidatura(idle, fd({ ...candidaturaValida, "cf-turnstile-response": "ruim" }));
    expect(s).toMatchObject({
      status: "error",
      values: { nome: candidaturaValida.nome },
      message: "Não foi possível validar o envio. Recarregue a página e tente de novo.",
    });
    expect(verifyTurnstile).toHaveBeenCalledWith("ruim", "9.9.9.9");
    expect(sendCandidaturaEmail).not.toHaveBeenCalled();
  });
  it("com secret e sem token (sem JS) envia com marca de não verificado", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret");
    expect((await submitCandidatura(idle, fd(candidaturaValida))).status).toBe("success");
    expect(verifyTurnstile).not.toHaveBeenCalled();
    expect(sendCandidaturaEmail).toHaveBeenCalledWith(expect.anything(), "carreiras@example.com", { unverified: true });
  });
  it("com token verificado envia sem marca", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret");
    await submitCandidatura(idle, fd({ ...candidaturaValida, "cf-turnstile-response": "ok" }));
    expect(sendCandidaturaEmail).toHaveBeenCalledWith(expect.anything(), "carreiras@example.com", { unverified: false });
  });
  it("envia para emailCarreiras com reply-to e área", async () => {
    expect(await submitCandidatura(idle, fd(candidaturaValida))).toEqual({ status: "success" });
    const [payload, to] = vi.mocked(sendCandidaturaEmail).mock.calls[0];
    expect(to).toBe(cfg.emailCarreiras);
    expect(payload).toMatchObject({ area: "Segurança do Trabalho", email: candidaturaValida.email });
  });
  it("campos inválidos → erros por campo e valores preservados, sem consentimento, sem e-mail", async () => {
    const s = await submitCandidatura(idle, fd({ ...candidaturaValida, email: "maria", consentimento: false }));
    if (s.status !== "error") throw new Error("esperava erro");
    expect(s.values).toMatchObject({ nome: candidaturaValida.nome, email: "maria", area: candidaturaValida.area });
    expect(s.fieldErrors.email).toContain("Confira o e-mail");
    expect(s.fieldErrors.consentimento).toBe("É preciso aceitar para analisarmos sua candidatura.");
    expect(sendCandidaturaEmail).not.toHaveBeenCalled();
  });
  it("falha de envio → mensagem amigável, valores preservados e log sem dados pessoais", async () => {
    vi.mocked(sendCandidaturaEmail).mockRejectedValue(new Error("Resend: rate_limit"));
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const s = await submitCandidatura(idle, fd(candidaturaValida));
    expect(s).toMatchObject({
      status: "error",
      values: { nome: candidaturaValida.nome, resumo: candidaturaValida.resumo },
      message: "Não conseguimos enviar agora. Tente de novo em alguns minutos.",
    });
    const log = err.mock.calls.flat().join(" ");
    for (const pii of [candidaturaValida.nome, candidaturaValida.email, candidaturaValida.telefone, candidaturaValida.resumo]) {
      expect(log).not.toContain(pii);
    }
    err.mockRestore();
  });
});
