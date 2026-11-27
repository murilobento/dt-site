import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/contato/actions", () => ({
  submitLead: vi.fn(async () => ({ status: "success", segmento: "infraestrutura", disciplina: "sau-pre" })),
}));
vi.mock("@/lib/analytics/track", () => ({ track: vi.fn() }));

import { LeadForm } from "@/components/forms/LeadForm";
import { track } from "@/lib/analytics/track";

beforeEach(() => vi.mocked(track).mockClear());

describe("LeadForm", () => {
  it("no sucesso dispara lead_submit com segmento e disciplina", async () => {
    render(<LeadForm disciplinaInicial="sau-pre" whatsappHref="https://wa.me/1" />);
    await userEvent.click(screen.getByRole("button", { name: "Enviar solicitação técnica" }));
    expect(await screen.findByText(/Recebemos sua mensagem/)).toBeInTheDocument();
    expect(track).toHaveBeenCalledWith("lead_submit", { segmento: "infraestrutura", disciplina: "sau-pre" });
  });
});
