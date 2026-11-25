import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ErrorPage from "@/app/error";

describe("error.tsx", () => {
  it("mostra mensagem amigável sem detalhes do erro e chama retry", async () => {
    const retry = vi.fn();
    render(<ErrorPage error={new Error("segredo interno")} retry={retry} />);
    expect(screen.getByRole("heading", { level: 1, name: "Algo deu errado" })).toBeInTheDocument();
    expect(screen.getByText("Tente de novo em alguns instantes.")).toBeInTheDocument();
    expect(screen.queryByText(/segredo interno/)).toBeNull();
    expect(screen.getByRole("link", { name: "Ir para o início" })).toHaveAttribute("href", "/");
    await userEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
