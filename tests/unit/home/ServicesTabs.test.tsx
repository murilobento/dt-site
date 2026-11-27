import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ServicesTabs } from "@/components/home/ServicesTabs";
import servicos from "@/lib/content/fixtures/servicos.json";
import { disciplinaDoServico } from "@/lib/disciplinas";
import type { Servico } from "@/lib/content/types";

const all = servicos as Servico[];

describe("ServicesTabs", () => {
  it("tem as 3 abas com os rótulos do layout e H2 exato", () => {
    render(<ServicesTabs servicos={all} />);
    expect(screen.getByRole("heading", { level: 2, name: "Serviços e consultoria especializada" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual([
      "Infraestrutura Rodoviária",
      "Edificações e Reformas",
      "Consultoria Técnica",
    ]);
    expect(screen.getByRole("link", { name: "Ver catálogo técnico" })).toHaveAttribute("href", "/servicos");
  });

  it("aba ativa mostra os serviços da categoria com CTA 'Solicitar escopo' para leadHref", () => {
    render(<ServicesTabs servicos={all} />);
    const painel = screen.getByRole("tabpanel", { name: "Infraestrutura Rodoviária" });
    const infra = all.filter((s) => s.categoria === "infraestrutura");
    expect(within(painel).getAllByRole("article")).toHaveLength(infra.length);
    const ctas = within(painel).getAllByRole("link", { name: /Solicitar escopo/ });
    expect(ctas).toHaveLength(infra.length);
    expect(ctas[0]).toHaveAttribute("href", `/contato/comercial?segmento=${infra[0].segmento}&disciplina=${disciplinaDoServico(infra[0])}&origem=${infra[0].slug}`);
  });

  it("consultoria usa 'Agendar consultoria' e a navegação por teclado troca de aba", async () => {
    const user = userEvent.setup();
    render(<ServicesTabs servicos={all} />);
    screen.getByRole("tab", { name: "Infraestrutura Rodoviária" }).focus();
    await user.keyboard("{End}");
    const painel = screen.getByRole("tabpanel", { name: "Consultoria Técnica" });
    expect(within(painel).getAllByRole("link", { name: /Agendar consultoria/ }).length).toBeGreaterThan(0);
    expect(within(painel).queryByRole("link", { name: /Solicitar escopo/ })).not.toBeInTheDocument();
  });

  it("omite abas de categorias sem serviço e a seção quando não há nenhum", () => {
    const { rerender } = render(<ServicesTabs servicos={all.filter((s) => s.categoria === "consultoria")} />);
    expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual(["Consultoria Técnica"]);
    rerender(<ServicesTabs servicos={[]} />);
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
  });

  it("serviço sem subtítulo e sem ícone renderiza sem rótulo órfão", () => {
    const { subtitulo: _s, icone: _i, ...bare } = all.find((s) => s.categoria === "consultoria")!;
    void _s;
    void _i;
    const { container } = render(<ServicesTabs servicos={[bare as Servico]} />);
    expect(container.querySelector("article header svg")).toBeNull();
    expect(container.querySelector("article header p")).toBeNull();
  });

  it("ícones são decorativos (aria-hidden)", () => {
    const { container } = render(<ServicesTabs servicos={all} />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
    svgs.forEach((s) => expect(s).toHaveAttribute("aria-hidden", "true"));
  });
});
