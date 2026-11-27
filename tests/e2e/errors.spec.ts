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

test("URL desconhecida usa o 404 do site, com cabeçalho e rodapé", async ({ page }) => {
  await page.goto("/nada/aqui");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
});

test("/studio usa layout próprio: sem cabeçalho, rodapé, banner de cookies, GTM nem JSON-LD", async ({ request }) => {
  const res = await request.get("/studio");
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html).toMatch(/<html lang="pt-BR"/);
  expect(html).toMatch(/<meta name="robots" content="noindex, nofollow"/);
  expect(html).not.toMatch(/<header|<footer|data-cookie-banner|googletagmanager|application\/ld\+json/);
  expect(html.match(/<main/g)?.length ?? 0).toBeLessThanOrEqual(1);
});
