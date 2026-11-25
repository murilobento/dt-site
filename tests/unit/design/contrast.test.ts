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

describe("contraste dos tokens", () => {
  it.each([
    ["brand-primary", "surface-default"],
    ["text-primary", "surface-default"],
    ["text-secondary", "surface-default"],
    ["text-secondary", "surface-muted"],
    ["surface-default", "surface-inverse"],
    ["error", "surface-default"],
    ["text-on-inverse-secondary", "surface-inverse"],
  ])("%s sobre %s ≥ 4.5:1", (fg, bg) => {
    expect(t[fg], `token ${fg}`).toBeDefined();
    expect(t[bg], `token ${bg}`).toBeDefined();
    expect(contrastRatio(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it("contrastRatio de preto sobre branco é 21", () =>
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1));
});
