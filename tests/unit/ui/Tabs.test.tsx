import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tabs } from "@/components/ui/Tabs";

const tabs = [
  { id: "a", label: "Aba A", content: <p>Conteúdo A</p> },
  { id: "b", label: "Aba B", content: <p>Conteúdo B</p> },
  { id: "c", label: "Aba C", content: <p>Conteúdo C</p> },
];

describe("Tabs", () => {
  it("expõe tablist, abas e painel ativo; só a aba ativa entra na ordem de tabulação", () => {
    render(<Tabs label="Teste" tabs={tabs} />);
    expect(screen.getByRole("tablist", { name: "Teste" })).toBeInTheDocument();
    const [a, b] = screen.getAllByRole("tab");
    expect(a).toHaveAttribute("aria-selected", "true");
    expect(a).toHaveAttribute("tabindex", "0");
    expect(b).toHaveAttribute("aria-selected", "false");
    expect(b).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("tabpanel", { name: "Aba A" })).toHaveTextContent("Conteúdo A");
    expect(screen.queryByRole("tabpanel", { name: "Aba B" })).not.toBeInTheDocument();
  });

  it("aria-controls aponta para o painel da aba", () => {
    render(<Tabs label="Teste" tabs={tabs} />);
    const a = screen.getByRole("tab", { name: "Aba A" });
    expect(document.getElementById(a.getAttribute("aria-controls")!)).toHaveTextContent("Conteúdo A");
  });

  it("setas, Home e End movem foco e ativam automaticamente, com volta circular", async () => {
    const user = userEvent.setup();
    render(<Tabs label="Teste" tabs={tabs} />);
    screen.getByRole("tab", { name: "Aba A" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Aba B" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Aba B" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Aba B" })).toHaveTextContent("Conteúdo B");
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Aba C" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Aba A" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Aba C" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Aba A" })).toHaveAttribute("aria-selected", "true");
  });

  it("clique ativa a aba; todos os painéis ficam no DOM (inativos hidden)", async () => {
    const user = userEvent.setup();
    const { container } = render(<Tabs label="Teste" tabs={tabs} />);
    expect(container.querySelectorAll("[role=tabpanel]")).toHaveLength(3);
    await user.click(screen.getByRole("tab", { name: "Aba C" }));
    expect(screen.getByRole("tabpanel", { name: "Aba C" })).toBeVisible();
  });
});
