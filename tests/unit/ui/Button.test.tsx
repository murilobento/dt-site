import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("com href renderiza link", () => {
    render(<Button href="/obras">Ver obras</Button>);
    expect(screen.getByRole("link", { name: "Ver obras" })).toHaveAttribute("href", "/obras");
  });

  it("sem href renderiza button com type button por padrão", () => {
    render(<Button>Enviar</Button>);
    expect(screen.getByRole("button", { name: "Enviar" })).toHaveAttribute("type", "button");
  });

  it("inverse troca para fundo branco e texto escuro", () => {
    render(<Button inverse>Solicitar proposta</Button>);
    const cls = screen.getByRole("button").className;
    expect(cls).toContain("bg-surface-default");
    expect(cls).not.toContain("bg-brand-primary");
  });
});
