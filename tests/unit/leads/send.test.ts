import { afterEach, describe, expect, it, vi } from "vitest";
import { buildSubject, sendCandidaturaEmail, sendLeadEmail } from "@/lib/leads/send";
import type { Lead } from "@/lib/leads/schema";
import { candidaturaValida, valido } from "./fixtures";

const lead = valido as unknown as Lead;

describe("send", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("assunto segue o padrão e não aceita quebra de linha", () => {
    expect(buildSubject(lead)).toBe("[Site] Lead Obra rodoviária / pavimentação — Prefeitura de Exemplo");
    expect(buildSubject({ ...lead, empresa: "A\r\nBcc: x@y.com\u0085\u2028\u2029B" })).not.toMatch(/[\r\n\u0085\u2028\u2029]/);
    expect(buildSubject(lead, true)).toBe("[não verificado] [Site] Lead Obra rodoviária / pavimentação — Prefeitura de Exemplo");
  });
  it("sem RESEND_API_KEY usa transporte log, sem dados pessoais", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await sendLeadEmail(lead, "infra@example.com");
    const line = info.mock.calls.flat().join(" ");
    expect(line).toContain("rodoviaria-pavimentacao");
    expect(line).not.toContain("Prefeitura de Exemplo");
    expect(line).not.toContain(lead.email);
    expect(line).not.toContain(lead.nome);
    expect(line).not.toContain(lead.telefone);
    info.mockRestore();
  });
  it("em produção sem chave e sem LEAD_TRANSPORT=log lança, para a action mostrar a falha", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("LEAD_TRANSPORT", "");
    vi.stubEnv("NODE_ENV", "production");
    await expect(sendLeadEmail(lead, "infra@example.com")).rejects.toThrow(/RESEND_API_KEY/);
  });
  it("em produção sem chave mas com LEAD_TRANSPORT=log apenas registra", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("LEAD_TRANSPORT", "log");
    vi.stubEnv("NODE_ENV", "production");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await expect(sendLeadEmail(lead, "infra@example.com")).resolves.toBeUndefined();
    expect(info).toHaveBeenCalledOnce();
    info.mockRestore();
  });
  it("candidatura: transporte log não registra dados pessoais", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await sendCandidaturaEmail(candidaturaValida, "carreiras@example.com");
    const line = info.mock.calls.flat().join(" ");
    expect(line).toContain("candidatura");
    for (const pii of [candidaturaValida.nome, candidaturaValida.email, candidaturaValida.telefone, candidaturaValida.resumo]) {
      expect(line).not.toContain(pii);
    }
    info.mockRestore();
  });
  it("candidatura: em produção sem chave e sem LEAD_TRANSPORT=log lança; com log apenas registra", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("LEAD_TRANSPORT", "");
    vi.stubEnv("NODE_ENV", "production");
    await expect(sendCandidaturaEmail(candidaturaValida, "carreiras@example.com")).rejects.toThrow(/RESEND_API_KEY/);
    vi.stubEnv("LEAD_TRANSPORT", "log");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await expect(sendCandidaturaEmail(candidaturaValida, "carreiras@example.com")).resolves.toBeUndefined();
    info.mockRestore();
  });
});
