import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Logo } from "@/components/ui/Logo";

describe("Logo", () => {
  it("expõe o nome acessível", () => {
    render(<Logo />);
    expect(screen.getByRole("img", { name: "DT Construtora e Consultoria" })).toBeInTheDocument();
  });

  it("completo inclui símbolo, DT e texto", () => {
    const { container } = render(<Logo variant="completo" />);
    for (const id of ["simbolo", "DT", "texto"]) {
      expect(container.querySelector(`path[data-part="${id}"]`)).not.toBeNull();
    }
  });

  it("compacto omite o texto", () => {
    const { container } = render(<Logo variant="compacto" />);
    expect(container.querySelector('path[data-part="simbolo"]')).not.toBeNull();
    expect(container.querySelector('path[data-part="DT"]')).not.toBeNull();
    expect(container.querySelector('path[data-part="texto"]')).toBeNull();
  });
});
