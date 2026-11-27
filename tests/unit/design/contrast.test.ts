import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/design/contrast";

function readTokens(): Record<string, string> {
  const css = readFileSync("src/styles/tokens.css", "utf8");
  const tokens: Record<string, string> = {};
  for (const m of css.matchAll(/--color-([a-z-]+):\s*(#[0-9A-Fa-f]{6})\s*;/g)) {
    tokens[m[1]] = m[2];
  }
  return tokens;
}

const t = readTokens();

describe("contraste dos tokens (Layout v2)", () => {
  it.each([
    ["on-surface", "surface"],
    ["on-surface", "surface-container-lowest"],
    ["on-surface-variant", "surface"],
    ["on-surface-variant", "surface-container-low"],
    ["on-surface-variant", "surface-container"],
    ["primary", "surface-container-lowest"],
    ["primary", "surface-container-low"],
    ["error", "surface-container-lowest"],
    ["secondary", "surface-container-lowest"],
    ["on-primary", "primary"],
    ["on-primary", "brand-navy"],
    ["on-primary-container", "brand-navy"],
    ["on-primary-container", "primary"],
    ["primary", "secondary-container"],
    ["on-secondary-container", "secondary-container"],
    ["white", "brand-navy"],
    ["white", "secondary"],
    ["inverse-on-surface", "inverse-surface"],
  ])("%s sobre %s ≥ 4.5:1", (fg, bg) => {
    expect(t[fg], `token ${fg}`).toBeDefined();
    expect(t[bg], `token ${bg}`).toBeDefined();
    expect(contrastRatio(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it("botão de destaque: primary sobre secondary-container passa com folga (≥ 8:1)", () =>
    expect(contrastRatio(t["primary"], t["secondary-container"])).toBeGreaterThanOrEqual(8));

  it("accent não passa como texto pequeno: claro (3,2:1) e confirma a regra de uso", () => {
    expect(contrastRatio(t["accent"], t["surface-container-lowest"])).toBeLessThan(4.5);
    expect(contrastRatio(t["white"], t["accent"])).toBeLessThan(4.5);
    // Sobre navy só em rótulos grandes/bold ou ícones: precisa de ≥ 3:1 (texto grande, WCAG 1.4.3/1.4.11)
    expect(contrastRatio(t["accent"], t["brand-navy"])).toBeGreaterThanOrEqual(3);
  });

  it("valores dos tokens do layout", () => {
    expect(t["accent"].toLowerCase()).toBe("#d97707");
    expect(t["brand-navy"].toLowerCase()).toBe("#0f2942");
    expect(t["secondary-container"].toLowerCase()).toBe("#fe932c");
    expect(t["white"].toLowerCase()).toBe("#ffffff");
  });

  it("contrastRatio de preto sobre branco é 21", () =>
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1));
});
