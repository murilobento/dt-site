import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ServicosCatalogo } from "@/components/services/ServicosCatalogo";
import servicos from "@/lib/content/fixtures/servicos.json";
import type { Servico } from "@/lib/content/types";

const all = servicos as Servico[];

describe("ServicosCatalogo", () => {
  it("renderiza as 3 seções âncora, cada uma rotulada pelo seu H2", () => {
    const { container } = render(<ServicosCatalogo servicos={all} />);
    for (const [id, titulo] of [
      ["infraestrutura", "Infraestrutura rodoviária e viária"],
      ["edificacoes", "Edificações, reformas e obras civis"],
      ["consultoria", "Consultoria técnica de engenharia"],
    ]) {
      const sec = container.querySelector<HTMLElement>(`section#${id}`)!;
      expect(sec).not.toBeNull();
      expect(within(sec).getByRole("heading", { level: 2, name: titulo })).toBeInTheDocument();
      expect(screen.getByRole("region", { name: titulo })).toBe(sec);
    }
  });

  it("headings: h2 por seção e h3 por card, sem salto", () => {
    render(<ServicosCatalogo servicos={all} />);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(3);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(all.length);
  });

  it("CTA por categoria leva a /contato/comercial com disciplina e origem; há link Ver serviço", () => {
    const { container } = render(<ServicosCatalogo servicos={all} />);
    const infra = within(container.querySelector<HTMLElement>("#infraestrutura")!);
    const cta = infra.getAllByRole("link", { name: /Solicitar escopo/ });
    expect(cta[0].getAttribute("href")).toMatch(/disciplina=rodoviaria-pavimentacao&origem=conservacao$/);
    const saus = cta.find((a) => a.getAttribute("href")!.includes("origem=saus-pres"))!;
    expect(saus).toHaveAttribute("href", expect.stringContaining("disciplina=sau-pre"));
    expect(infra.getAllByRole("link", { name: /Ver serviço:/ })[0]).toHaveAttribute("href", "/servicos/conservacao");
    const cons = within(container.querySelector<HTMLElement>("#consultoria")!);
    expect(cons.getAllByRole("link", { name: /Agendar consultoria/ })[0].getAttribute("href")).toContain(
      "disciplina=consultoria",
    );
  });

  it("omite seções de categorias sem serviço", () => {
    const { container } = render(<ServicosCatalogo servicos={all.filter((s) => s.categoria === "consultoria")} />);
    expect(container.querySelectorAll("section")).toHaveLength(1);
    expect(container.querySelector("#infraestrutura")).toBeNull();
  });
});
