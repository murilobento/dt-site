import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ServicoSections } from "@/components/services/ServicoSections";
import type { Servico } from "@/lib/content/types";

const base: Servico = {
  slug: "x",
  titulo: "X",
  segmento: "infraestrutura",
  categoria: "infraestrutura",
  resumo: "r",
  escopo: ["Item de escopo"],
  etapas: [{ titulo: "Etapa 1", descricao: "desc" }],
  equipamentos: ["Retroescavadeira"],
  imagem: { url: "/i.jpg", alt: "a", width: 10, height: 10 },
};

const headings = () => screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);

describe("ServicoSections", () => {
  it("renderiza as seções com itens", () => {
    render(<ServicoSections servico={base} obras={[]} />);
    expect(headings()).toEqual(["Escopo", "Etapas", "Equipamentos"]);
  });

  it("omite seções vazias, sem rótulo órfão", () => {
    render(<ServicoSections servico={{ ...base, equipamentos: [], escopo: [], etapas: [] }} obras={[]} />);
    expect(screen.queryAllByRole("heading")).toHaveLength(0);
  });

  it("omite apenas Equipamentos e Obras relacionadas quando vazios", () => {
    render(<ServicoSections servico={{ ...base, equipamentos: [] }} obras={[]} />);
    expect(headings()).toEqual(["Escopo", "Etapas"]);
    expect(screen.queryByText("Equipamentos")).toBeNull();
    expect(screen.queryByText("Obras relacionadas")).toBeNull();
  });
});
