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

  it("primary é navy `primary` com texto branco", () => {
    render(<Button>Enviar</Button>);
    const cls = screen.getByRole("button").className.split(" ");
    expect(cls).toContain("bg-primary");
    expect(cls).toContain("text-on-primary");
  });

  it("accent é laranja secondary-container com texto primary (nunca branco)", () => {
    render(<Button variant="accent">Solicitar proposta técnica</Button>);
    const cls = screen.getByRole("button").className.split(" ");
    expect(cls).toContain("bg-secondary-container");
    expect(cls).toContain("text-primary");
    expect(cls).not.toContain("text-white");
    expect(cls).not.toContain("text-on-primary");
  });

  it("secondary é contorno", () => {
    render(<Button variant="secondary">Ver obras</Button>);
    const cls = screen.getByRole("button").className.split(" ");
    expect(cls).toContain("border-primary");
    expect(cls).not.toContain("bg-primary");
  });

  it("inverse troca o primário para fundo branco e texto primary", () => {
    render(<Button inverse>Solicitar proposta</Button>);
    const cls = screen.getByRole("button").className.split(" ");
    expect(cls).toContain("bg-white");
    expect(cls).not.toContain("bg-primary");
  });

  it("primário tem contorno de foco explícito e visível", () => {
    render(<Button>Enviar</Button>);
    expect(screen.getByRole("button").className).toContain("focus-visible:outline-primary");
  });

  it("primário inverse tem contorno de foco claro", () => {
    render(<Button inverse>Enviar</Button>);
    expect(screen.getByRole("button").className).toContain("focus-visible:outline-white");
  });

  it("className do chamador substitui utilitários conflitantes da base", () => {
    render(<Button className="hidden">Enviar</Button>);
    const cls = screen.getByRole("button").className.split(" ");
    expect(cls).toContain("hidden");
    expect(cls).not.toContain("inline-flex");
  });

  it("merge preserva cor e tamanho de texto da base", () => {
    render(<Button>Enviar</Button>);
    const cls = screen.getByRole("button").className.split(" ");
    expect(cls).toContain("text-label-lg");
    expect(cls).toContain("text-on-primary");
  });
});
