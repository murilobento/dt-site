import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectCard } from "@/components/projects/ProjectCard";
import obras from "@/lib/content/fixtures/obras.json";
import type { Obra } from "@/lib/content/types";

const all = obras as Obra[];
const rod = all.find((o) => o.slug === "pinhalzinho-sc")!;

describe("ProjectCard", () => {
  it("h3 com link para a obra, badge da categoria, métrica mono e cidade/UF", () => {
    render(<ProjectCard obra={rod} />);
    expect(screen.getByRole("heading", { level: 3 })).toContainElement(screen.getByRole("link", { name: rod.titulo }));
    expect(screen.getByRole("link", { name: rod.titulo })).toHaveAttribute("href", `/obras/${rod.slug}`);
    expect(screen.getByText("Rodoviária e Drenagem")).toBeInTheDocument();
    expect(screen.getByText("18,5 km")).toHaveClass("font-mono");
    expect(screen.getByText(`${rod.cidade}/${rod.uf}`)).toBeInTheDocument();
  });

  it("usa o rótulo de cada categoria e omite a métrica sem extensão", () => {
    const sau = all.find((o) => o.categoria === "saupre")!;
    render(<ProjectCard obra={sau} />);
    expect(screen.getByText("SAUs e PREs")).toBeInTheDocument();
    expect(sau.extensao).toBeUndefined();
    expect(screen.queryByText(/\d+ (km|m²)/)).not.toBeInTheDocument();
  });
});
