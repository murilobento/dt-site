import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import GlobalError from "@/app/global-error";

vi.mock("@/lib/fonts", () => ({ FONT_VARIABLES: "" }));

describe("global-error.tsx", () => {
  it("renderiza copy em pt-BR sem detalhes do erro e chama retry", async () => {
    const retry = vi.fn();
    // O React avisa que <html> não pode ficar dentro do container do teste; é esperado aqui.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<GlobalError error={new Error("segredo interno")} retry={retry} />);
    spy.mockRestore();
    expect(screen.getByRole("heading", { level: 1, name: "Algo deu errado" })).toBeInTheDocument();
    expect(screen.queryByText(/segredo interno/)).toBeNull();
    expect(screen.getByRole("link", { name: "Ir para o início" })).toHaveAttribute("href", "/");
    await userEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
