import { expect, test } from "@playwright/test";

const total = async (page: import("@playwright/test").Page) =>
  Number(((await page.getByRole("status").textContent()) ?? "").match(/\d+/)?.[0]);

test("filtrar atualiza a URL sem recarregar", async ({ page }) => {
  await page.goto("/obras");
  await page.evaluate(() => ((window as unknown as { __marker: number }).__marker = 1));
  await page.getByLabel("Segmento").selectOption("infraestrutura");
  await expect(page).toHaveURL(/segmento=infraestrutura/);
  expect(await page.evaluate(() => (window as unknown as { __marker: number }).__marker)).toBe(1);
  await expect(page.getByRole("status")).toHaveText(/\d+ obras?/);
  await expect(page.getByRole("button", { name: "Filtrar", exact: true })).toHaveCount(0);
});

test("busca com debounce atualiza URL e lista, ignorando acento", async ({ page }) => {
  await page.goto("/obras");
  await page.getByLabel("Buscar").fill("PINHALZINHO");
  await expect(page).toHaveURL(/q=PINHALZINHO/);
  await expect(page.getByRole("status")).toHaveText("1 obra");
  await page.getByLabel("Buscar").fill("conservacao");
  await expect(page).toHaveURL(/q=conservacao/);
  expect(await total(page)).toBeGreaterThan(1);
});

test("URL com filtros restaura o estado", async ({ page }) => {
  await page.goto("/obras?uf=SC");
  await expect(page.getByLabel("Estado")).toHaveValue("SC");
  const n = await total(page);
  await expect(page.locator("main article")).toHaveCount(n);
  await expect(page.locator("main article", { hasText: "/SP" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Limpar filtros" })).toBeVisible();
});

test("URL inválida mostra todas as obras", async ({ page }) => {
  await page.goto("/obras");
  const all = await total(page);
  await page.goto("/obras?uf=XX&status=foo&segmento=");
  expect(await total(page)).toBe(all);
  await expect(page.getByLabel("Estado")).toHaveValue("");
});

test("sem resultado mostra a mensagem do PRD", async ({ page }) => {
  await page.goto("/obras?q=zzzz");
  await expect(page.getByText("Nenhuma obra com esses filtros. Limpe um filtro para ver mais.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Limpar filtros" })).toBeVisible();
  await page.getByRole("button", { name: "Limpar filtros" }).click();
  await expect(page).toHaveURL(/\/obras$/);
  expect(await total(page)).toBeGreaterThan(1);
});

test("heading order h1 → h2 → h3", async ({ page }) => {
  await page.goto("/obras");
  await expect(page.getByRole("heading", { level: 1, name: "Obras" })).toHaveCount(1);
  const levels = await page.locator("main h1, main h2, main h3").evaluateAll((els) => els.map((e) => Number(e.tagName[1])));
  for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
  expect(levels).toContain(3);
});

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("formulário GET filtra no servidor", async ({ page }) => {
    await page.goto("/obras");
    await page.getByLabel("Estado").selectOption("SC");
    await page.getByRole("button", { name: "Filtrar", exact: true }).click();
    await expect(page).toHaveURL(/uf=SC/);
    await expect(page.getByLabel("Estado")).toHaveValue("SC");
    await expect(page.locator("main article", { hasText: "/SP" })).toHaveCount(0);
  });
});

test("navegar para /obras pelo menu limpa os filtros", async ({ page }) => {
  await page.goto("/obras?uf=SC");
  await expect(page.getByLabel("Estado")).toHaveValue("SC");
  await page.getByRole("banner").getByRole("link", { name: "Obras", exact: true }).first().click();
  await expect(page.getByLabel("Estado")).toHaveValue("");
});
