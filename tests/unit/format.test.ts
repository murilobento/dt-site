import { describe, expect, it } from "vitest";
import { formatNumber, formatPeriodo } from "@/lib/format";

describe("format", () => {
  it("formatNumber usa ponto como separador de milhar", () => {
    expect(formatNumber(142000)).toBe("142.000");
    expect(formatNumber(1420)).toBe("1.420");
    expect(formatNumber(40)).toBe("40");
  });

  it("formatPeriodo com e sem término", () => {
    expect(formatPeriodo("2024-05", "2029-05")).toBe("mai/2024 a mai/2029");
    expect(formatPeriodo("2024-05")).toBe("desde mai/2024");
  });

  it("formatPeriodo cobre todos os meses", () => {
    expect(formatPeriodo("2025-01", "2025-12")).toBe("jan/2025 a dez/2025");
  });
});
