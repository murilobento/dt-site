import { afterEach, describe, expect, it, vi } from "vitest";
import { buildSubject, sendLeadEmail } from "@/lib/leads/send";
import type { Lead } from "@/lib/leads/schema";
import { valido } from "./fixtures";

const lead = valido as unknown as Lead;

describe("send", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("assunto segue o padrão e não aceita quebra de linha", () => {
    expect(buildSubject(lead)).toBe("[Site] Lead infraestrutura — Prefeitura de Exemplo");
    expect(buildSubject({ ...lead, empresa: "A\r\nBcc: x@y.com" })).not.toMatch(/[\r\n]/);
  });
  it("sem RESEND_API_KEY usa transporte log, sem dados pessoais", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await sendLeadEmail(lead, "infra@example.com");
    const line = info.mock.calls.flat().join(" ");
    expect(line).toContain("infraestrutura");
    expect(line).toContain("Prefeitura de Exemplo");
    expect(line).not.toContain(lead.email);
    expect(line).not.toContain(lead.nome);
    expect(line).not.toContain(lead.telefone);
    info.mockRestore();
  });
});
