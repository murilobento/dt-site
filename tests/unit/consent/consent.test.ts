import { describe, expect, it } from "vitest";
import { CONSENT_COOKIE, parseConsent, serializeConsent } from "@/lib/consent/consent";

describe("consent", () => {
  it("usa o cookie dt_consent", () => {
    expect(CONSENT_COOKIE).toBe("dt_consent");
  });

  it("parseConsent rejeita JSON inválido e versão desconhecida", () => {
    expect(parseConsent("{")).toBeNull();
    expect(parseConsent(undefined)).toBeNull();
    expect(parseConsent(JSON.stringify({ version: 0 }))).toBeNull();
    expect(parseConsent(JSON.stringify({ version: 2, desempenho: true, marketing: true }))).toBeNull();
  });

  it("parseConsent rejeita campos com tipo errado", () => {
    expect(parseConsent(JSON.stringify({ version: 1, decidedAt: "x", desempenho: "sim", marketing: false }))).toBeNull();
  });

  it("serializeConsent e parseConsent fazem ida e volta", () => {
    const now = new Date("2026-11-25T10:00:00Z");
    const raw = serializeConsent({ desempenho: true, marketing: false }, now);
    expect(parseConsent(raw)).toEqual({
      version: 1,
      decidedAt: "2026-11-25T10:00:00.000Z",
      desempenho: true,
      marketing: false,
    });
  });
});
