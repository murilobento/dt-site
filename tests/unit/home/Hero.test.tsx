import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "@/components/home/Hero";

const img = { url: "/fixtures/x.webp", alt: "Obra", width: 1200, height: 800 };

describe("Hero", () => {
  it("H1 único com a copy do layout e CTAs para /servicos e /obras", () => {
    render(<Hero imagem={img} />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Infraestrutura viária e edificações com rigor técnico");
    expect(screen.getByRole("link", { name: "Explorar serviços" })).toHaveAttribute("href", "/servicos");
    expect(screen.getByRole("link", { name: "Ver obras executadas" })).toHaveAttribute("href", "/obras");
  });

  it("imagem de fundo é a única com fetchpriority=high; sem imagem não renderiza <img>", () => {
    const { container, rerender } = render(<Hero imagem={img} />);
    expect(container.querySelectorAll("img[fetchpriority='high']")).toHaveLength(1);
    rerender(<Hero />);
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });
});
