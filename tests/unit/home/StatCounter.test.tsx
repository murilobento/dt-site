import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StatCounter } from "@/components/home/StatCounter";
import type { Numero } from "@/lib/content/types";

const n: Numero = { rotulo: "km executados", valor: 1420, fonte: "x", dataReferencia: "2026-06" };

let observers: { cb: IntersectionObserverCallback }[] = [];

function stubEnv(reduce: boolean) {
  observers = [];
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduce && query === "(prefers-reduced-motion: reduce)",
  }));
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: IntersectionObserverCallback) {
        observers.push({ cb });
      }
      observe() {}
      disconnect() {}
    },
  );
}

const visual = () => screen.getByText("1.420", { selector: "span:not(.sr-only)" });

beforeEach(() => vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] }));
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("StatCounter", () => {
  it("com reduced motion mostra o valor final na hora e nunca cria observer", () => {
    stubEnv(true);
    render(<StatCounter numeros={[n]} />);
    expect(visual()).toHaveTextContent("1.420");
    expect(observers).toHaveLength(0);
    act(() => vi.advanceTimersByTime(2000));
    expect(visual()).toHaveTextContent("1.420");
  });

  it("sem reduced motion: começa em 0 e termina em 1.420 após 1,2 s da interseção", () => {
    stubEnv(false);
    render(<StatCounter numeros={[n]} />);
    const el = screen.getByText("0", { selector: "span:not(.sr-only)" });
    expect(el).toBeInTheDocument();
    act(() => observers[0].cb([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    act(() => vi.advanceTimersByTime(600));
    const mid = Number(el.textContent!.replace(/\./g, ""));
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1420);
    act(() => vi.advanceTimersByTime(700));
    expect(el).toHaveTextContent("1.420");
  });

  it("expõe o valor final a leitores de tela durante a animação", () => {
    stubEnv(false);
    render(<StatCounter numeros={[n]} />);
    expect(screen.getByText("1.420 km executados", { selector: ".sr-only" })).toBeInTheDocument();
  });

  it("junta unidade ao texto de leitores de tela", () => {
    stubEnv(true);
    render(<StatCounter numeros={[{ ...n, unidade: "km", rotulo: "de rodovia" }]} />);
    expect(screen.getByText("1.420 km de rodovia", { selector: ".sr-only" })).toBeInTheDocument();
  });
});
