import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Reveal } from "@/components/ui/Reveal";

let instances: { cb: IntersectionObserverCallback; disconnect: ReturnType<typeof vi.fn> }[] = [];

function stubEnv(reduce: boolean) {
  instances = [];
  vi.stubGlobal("matchMedia", (q: string) => ({ matches: reduce && q === "(prefers-reduced-motion: reduce)" }));
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      disconnect = vi.fn();
      observe = vi.fn();
      constructor(cb: IntersectionObserverCallback) {
        instances.push({ cb, disconnect: this.disconnect });
      }
    },
  );
}

const fire = (isIntersecting: boolean) =>
  act(() => instances[0].cb([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver));

afterEach(() => vi.unstubAllGlobals());

describe("Reveal", () => {
  it("sem reduced motion: pending após montar, visible uma vez na interseção e desconecta", () => {
    stubEnv(false);
    render(<Reveal className="x"><p>Conteúdo</p></Reveal>);
    const section = screen.getByText("Conteúdo").parentElement!;
    expect(section).toHaveAttribute("data-reveal", "pending");
    fire(false);
    expect(section).toHaveAttribute("data-reveal", "pending");
    expect(instances[0].disconnect).not.toHaveBeenCalled();
    fire(true);
    expect(section).toHaveAttribute("data-reveal", "visible");
    expect(instances[0].disconnect).toHaveBeenCalled();
  });

  it("com reduced motion: nunca esconde o conteúdo e não cria observer", () => {
    stubEnv(true);
    render(<Reveal><p>Conteúdo</p></Reveal>);
    expect(screen.getByText("Conteúdo").parentElement).not.toHaveAttribute("data-reveal");
    expect(instances).toHaveLength(0);
  });
});
