import { afterEach, describe, expect, it, vi } from "vitest";
import { getSiteUrl } from "@/lib/site";

describe("getSiteUrl", () => {
  afterEach(() => vi.unstubAllEnvs());

  function env(vars: Record<string, string>) {
    for (const k of ["NEXT_PUBLIC_SITE_URL", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_ENV"]) vi.stubEnv(k, vars[k] ?? "");
  }

  it("prefere NEXT_PUBLIC_SITE_URL e remove a barra final", () => {
    env({ NEXT_PUBLIC_SITE_URL: "https://dt.example/", VERCEL_PROJECT_PRODUCTION_URL: "outro.vercel.app" });
    expect(getSiteUrl()).toBe("https://dt.example");
  });
  it("usa o domínio de produção da Vercel quando a variável pública falta", () => {
    env({ VERCEL_PROJECT_PRODUCTION_URL: "dt-site.vercel.app", VERCEL_ENV: "production" });
    expect(getSiteUrl()).toBe("https://dt-site.vercel.app");
  });
  it("cai para localhost fora da produção da Vercel", () => {
    env({});
    expect(getSiteUrl()).toBe("http://localhost:3000");
    env({ VERCEL_ENV: "preview" });
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
  it("em produção na Vercel sem nenhuma das duas, falha com erro claro", () => {
    env({ VERCEL_ENV: "production" });
    expect(() => getSiteUrl()).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });
});
