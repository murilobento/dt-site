import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { verifyTurnstile } from "@/lib/leads/turnstile";

describe("verifyTurnstile", () => {
  beforeEach(() => vi.stubEnv("TURNSTILE_SECRET_KEY", "secret"));
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("token válido → true, enviando secret, response e ip", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    vi.stubGlobal("fetch", fetchMock);
    expect(await verifyTurnstile("tok", "1.2.3.4")).toBe(true);
    const body = fetchMock.mock.calls[0][1].body as URLSearchParams;
    expect(body.get("secret")).toBe("secret");
    expect(body.get("response")).toBe("tok");
    expect(body.get("remoteip")).toBe("1.2.3.4");
  });
  it("token inválido → false", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: false }) }));
    expect(await verifyTurnstile("tok")).toBe(false);
  });
  it("erro de rede → false", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("rede")));
    expect(await verifyTurnstile("tok")).toBe(false);
  });
  it("sem token com secret configurado → false, sem chamar a Cloudflare", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await verifyTurnstile("")).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("sem secret → pula a verificação e avisa uma única vez", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await verifyTurnstile("")).toBe(true);
    expect(await verifyTurnstile("")).toBe(true);
    expect(warn.mock.calls.length).toBeLessThanOrEqual(1);
    warn.mockRestore();
  });
});
