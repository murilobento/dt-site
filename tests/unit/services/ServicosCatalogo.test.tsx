import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ServicosCatalogo } from "@/components/services/ServicosCatalogo";
import servicos from "@/lib/content/fixtures/servicos.json";
import type { Servico } from "@/lib/content/types";

const all = servicos as Servico[];

describe("ServicosCatalogo", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/servicos");
    Element.prototype.scrollIntoView = vi.fn();
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("sem hash, a primeira aba está ativa e os painéis têm id de âncora", () => {
    const { container } = render(<ServicosCatalogo servicos={all} />);
    expect(screen.getByRole("tab", { name: "Infraestrutura Rodoviária" })).toHaveAttribute("aria-selected", "true");
    for (const id of ["infraestrutura", "edificacoes", "consultoria"]) {
      expect(container.querySelector(`[role=tabpanel]#${id}`)).not.toBeNull();
    }
  });

  it("#consultoria ativa a aba Consultoria e rola até o painel", () => {
    window.history.replaceState(null, "", "/servicos#consultoria");
    render(<ServicosCatalogo servicos={all} />);
    expect(screen.getByRole("tab", { name: "Consultoria Técnica" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Consultoria Técnica" })).toBeVisible();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("reage a hashchange", () => {
    render(<ServicosCatalogo servicos={all} />);
    act(() => {
      window.history.replaceState(null, "", "/servicos#edificacoes");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(screen.getByRole("tab", { name: "Edificações e Reformas" })).toHaveAttribute("aria-selected", "true");
  });

  it("hash desconhecido é ignorado", () => {
    window.history.replaceState(null, "", "/servicos#xyz");
    render(<ServicosCatalogo servicos={all} />);
    expect(screen.getByRole("tab", { name: "Infraestrutura Rodoviária" })).toHaveAttribute("aria-selected", "true");
  });

  it("CTA leva a /contato/comercial com disciplina e origem; há link Ver serviço", () => {
    render(<ServicosCatalogo servicos={all} />);
    const painel = screen.getByRole("tabpanel", { name: "Infraestrutura Rodoviária" });
    const cta = within(painel).getAllByRole("link", { name: /Solicitar escopo/ });
    expect(cta[0].getAttribute("href")).toMatch(/disciplina=rodoviaria-pavimentacao&origem=conservacao$/);
    const saus = cta.find((a) => a.getAttribute("href")!.includes("origem=saus-pres"))!;
    expect(saus).toHaveAttribute("href", expect.stringContaining("disciplina=sau-pre"));
    expect(within(painel).getAllByRole("link", { name: /Ver serviço:/ })[0]).toHaveAttribute("href", "/servicos/conservacao");
  });

  it("clicar numa aba atualiza o hash", () => {
    render(<ServicosCatalogo servicos={all} />);
    act(() => screen.getByRole("tab", { name: "Consultoria Técnica" }).click());
    expect(window.location.hash).toBe("#consultoria");
  });
});
