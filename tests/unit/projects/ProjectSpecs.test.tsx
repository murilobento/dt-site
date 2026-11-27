import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectSpecs } from "@/components/projects/ProjectSpecs";
import type { Obra } from "@/lib/content/types";

const img = { url: "/i.jpg", alt: "a", width: 10, height: 10 };
const completa: Obra = {
  slug: "p", titulo: "P", segmento: "infraestrutura", categoria: "rodoviaria", servicos: ["restauracao", "inexistente"],
  cliente: { nome: "Cliente B", tipo: "concessionaria" }, cidade: "Pinhalzinho", uf: "SC",
  inicio: "2024-06", termino: "2025-02", status: "concluida", extensao: { valor: 18.5, unidade: "km" },
  descricao: "d", capa: img, galeria: [], destaque: false,
};
const minima: Obra = {
  slug: "m", titulo: "M", segmento: "obras-civis", categoria: "edificacoes", servicos: [], cidade: "Álvares Machado", uf: "SP",
  inicio: "2024-05", status: "em-andamento", descricao: "d", capa: img, galeria: [], destaque: false,
};

describe("ProjectSpecs", () => {
  it("omite linhas sem dado", () => {
    const { container } = render(<ProjectSpecs obra={minima} />);
    expect(screen.queryByText(/Extensão|Área/)).toBeNull();
    expect(screen.queryByText("Cliente")).toBeNull();
    expect(screen.queryByText("Serviços")).toBeNull();
    expect(container.textContent).not.toMatch(/undefined|null/);
    expect(screen.getByText("desde mai/2024")).toBeInTheDocument();
    expect(screen.getByText("Em andamento")).toBeInTheDocument();
  });

  it("mostra todas as linhas, com serviços linkados e número formatado", () => {
    render(<ProjectSpecs obra={completa} servicos={[{ slug: "restauracao", titulo: "Restauração" }]} />);
    expect(screen.getByText("Pinhalzinho/SC")).toBeInTheDocument();
    expect(screen.getByText("Cliente B")).toBeInTheDocument();
    expect(screen.getByText("fev/2025", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("19 km")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Restauração" })).toHaveAttribute("href", "/servicos/restauracao");
    expect(screen.getByText("Concluída")).toBeInTheDocument();
  });

  it("usa 'Área' para m²", () => {
    render(<ProjectSpecs obra={{ ...minima, extensao: { valor: 142000, unidade: "m²" } }} />);
    expect(screen.getByText("Área")).toBeInTheDocument();
    expect(screen.getByText("142.000 m²")).toBeInTheDocument();
  });

  it("compact mostra só cliente e serviços; vazio não renderiza nada", () => {
    render(<ProjectSpecs obra={completa} servicos={[{ slug: "restauracao", titulo: "Restauração" }]} compact />);
    expect(screen.getByText("Cliente B")).toBeInTheDocument();
    expect(screen.queryByText("Local")).toBeNull();
    expect(screen.queryByText("Status")).toBeNull();
    const { container } = render(<ProjectSpecs obra={minima} compact />);
    expect(container).toBeEmptyDOMElement();
  });
});
