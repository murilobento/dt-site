import { expect, test } from "@playwright/test";

test("rota inexistente → 404 com H1, links e noindex", async ({ page }) => {
  const res = await page.goto("/qualquer-coisa");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "Página não encontrada" })).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "Ir para o início" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("main").getByRole("link", { name: "Ver obras" })).toHaveAttribute("href", "/obras");
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
});

test("obra e serviço com slug desconhecido usam a mesma página 404", async ({ page }) => {
  for (const url of ["/obras/nao-existe", "/servicos/nao-existe"]) {
    const res = await page.goto(url);
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "Página não encontrada" })).toBeVisible();
  }
});
