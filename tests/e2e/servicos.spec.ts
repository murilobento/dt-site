import { expect, test } from "@playwright/test";

test("página de serviço tem escopo, etapas, equipamentos, obras relacionadas e CTA com segmento", async ({ page }) => {
  await page.goto("/servicos/restauracao");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  for (const h of ["Escopo", "Etapas", "Equipamentos", "Obras relacionadas"]) {
    await expect(page.getByRole("heading", { level: 2, name: h })).toBeVisible();
  }
  await expect(page.locator("main ol > li").first()).toBeVisible();
  await expect(page.locator("img[fetchpriority='high']")).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Solicitar proposta" }).last()).toHaveAttribute(
    "href",
    /segmento=infraestrutura/,
  );
});

test("obras relacionadas: h3 abaixo do h2, sem salto de nível", async ({ page }) => {
  await page.goto("/servicos/restauracao");
  const levels = await page.locator("main h1, main h2, main h3").evaluateAll((els) =>
    els.map((e) => Number(e.tagName[1])),
  );
  for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
});

test("serviço inexistente → 404", async ({ page }) => {
  expect((await page.goto("/servicos/nao-existe"))?.status()).toBe(404);
});

test("CTA da página de serviço leva disciplina e segmento", async ({ page }) => {
  await page.goto("/servicos/restauracao");
  await expect(page.getByRole("link", { name: "Solicitar proposta" }).last()).toHaveAttribute(
    "href",
    /disciplina=rodoviaria-pavimentacao/,
  );
});

test("índice: abas por categoria e ordem de headings", async ({ page }) => {
  await page.goto("/servicos");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("tab")).toHaveText([
    "Infraestrutura Rodoviária",
    "Edificações e Reformas",
    "Consultoria Técnica",
  ]);
  const levels = await page.locator("main h1, main h2, main h3").evaluateAll((els) =>
    els.map((e) => Number(e.tagName[1])),
  );
  for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
  await page.getByRole("link", { name: /Ver serviço:/ }).first().click();
  await expect(page).toHaveURL(/\/servicos\/.+/);
});

test("/servicos#consultoria abre a aba Consultoria", async ({ page }) => {
  await page.goto("/servicos#consultoria");
  await expect(page.getByRole("tab", { name: "Consultoria Técnica" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#consultoria")).toBeVisible();
  await expect(page.getByRole("link", { name: /Agendar consultoria/ }).first()).toHaveAttribute(
    "href",
    /disciplina=consultoria/,
  );
});
