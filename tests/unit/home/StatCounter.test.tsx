import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StatCounter } from "@/components/home/StatCounter";
import type { Numero } from "@/lib/content/types";

const n: Numero = { rotulo: "km executados", valor: 1420, fonte: "x", dataReferencia: "2026-06" };

function mockMatchMedia(matches: Record<string, boolean>) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: matches[query] ?? false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

afterEach(() => vi.unstubAllGlobals());

describe("StatCounter", () => {
  it("com reduced motion mostra o valor final na hora", () => {
    mockMatchMedia({ "(prefers-reduced-motion: reduce)": true });
    render(<StatCounter numeros={[n]} />);
    expect(screen.getByText("1.420")).toBeInTheDocument();
  });

  it("expõe o valor final a leitores de tela durante a animação", () => {
    mockMatchMedia({});
    render(<StatCounter numeros={[n]} />);
    expect(screen.getByText("1.420 km executados", { selector: ".sr-only" })).toBeInTheDocument();
  });

  it("junta unidade ao texto de leitores de tela", () => {
    mockMatchMedia({ "(prefers-reduced-motion: reduce)": true });
    render(<StatCounter numeros={[{ ...n, unidade: "km", rotulo: "de rodovia" }]} />);
    expect(screen.getByText("1.420 km de rodovia", { selector: ".sr-only" })).toBeInTheDocument();
  });
});
