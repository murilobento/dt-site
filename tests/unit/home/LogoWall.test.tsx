import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LogoWall } from "@/components/home/LogoWall";
import type { Cliente } from "@/lib/content/types";
import clientes from "@/lib/content/fixtures/clientes.json";

describe("LogoWall", () => {
  it("agrupa por tipo e usa o nome como alt", () => {
    render(<LogoWall clientes={clientes as Cliente[]} />);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Concessionárias",
      "Órgãos públicos",
      "Clientes privados",
    ]);
    expect(screen.getByAltText("Nome do Cliente A")).toBeInTheDocument();
  });

  it("omite grupos sem clientes", () => {
    render(<LogoWall clientes={(clientes as Cliente[]).filter((c) => c.tipo === "publico")} />);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["Órgãos públicos"]);
  });
});
