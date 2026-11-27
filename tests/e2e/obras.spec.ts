import { expect, test } from "@playwright/test";

const total = async (page: import("@playwright/test").Page) =>
  Number(((await page.getByRole("status").textContent()) ?? "").match(/\d+/)?.[0]);

test("filtrar atualiza a URL sem recarregar", async ({ page }) => {
  await page.goto("/obras");
  await page.evaluate(() => ((window as unknown as { __marker: number }).__marker = 1));
  await page.getByRole("button", { name: "SAUs e PREs" }).click();
  await expect(page).toHaveURL(/categoria=saupre/);
  await expect(page.getByRole("button", { name: "SAUs e PREs" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Todas" })).toHaveAttribute("aria-pressed", "false");
  expect(await page.evaluate(() => (window as unknown as { __marker: number }).__marker)).toBe(1);
  await expect(page.getByRole("status")).toHaveText(/\d+ obras? exibidas?/);
  await expect(page.getByRole("button", { name: "Filtrar", exact: true })).toHaveCount(0);
});

test("busca com debounce atualiza URL e lista, ignorando acento", async ({ page }) => {
  await page.goto("/obras");
  await page.getByLabel("Buscar").fill("PINHALZINHO");
  await expect(page).toHaveURL(/q=PINHALZINHO/);
  await expect(page.getByRole("status")).toHaveText("1 obra exibida");
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
  await page.goto("/obras?uf=XX&status=foo&segmento=&categoria=xx&cliente=Inexistente");
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
  await expect(page.getByRole("heading", { level: 1, name: "Portfólio de obras executadas" })).toHaveCount(1);
  const levels = await page.locator("main h1, main h2, main h3").evaluateAll((els) => els.map((e) => Number(e.tagName[1])));
  for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
  expect(levels).toContain(3);
});

test("categoria na URL marca a chip e filtra; Enter na busca aplica na hora", async ({ page }) => {
  await page.goto("/obras?categoria=saupre");
  await expect(page.getByRole("button", { name: "SAUs e PREs" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("main article", { hasText: "Rodoviária e Drenagem" })).toHaveCount(0);
  await page.getByLabel("Buscar").fill("zzzz");
  await page.getByLabel("Buscar").press("Enter");
  await expect(page).toHaveURL(/categoria=saupre&q=zzzz/);
});

test("busca digitada logo após trocar filtro mantém o filtro (debounce lê o estado atual)", async ({ page }) => {
  await page.goto("/obras");
  await page.getByLabel("Buscar").fill("a");
  await page.getByLabel("Estado").selectOption("SC");
  await expect(page).toHaveURL(/uf=SC/);
  await expect(page).toHaveURL(/q=a/);
});

test("chip de categoria no mobile e filtros secundários recolhíveis", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/obras");
  const mais = page.getByRole("button", { name: "Mais filtros" });
  await expect(mais).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByLabel("Estado")).toBeHidden();
  await mais.click();
  await expect(mais).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByLabel("Estado")).toBeVisible();
});

test("banner de CAT no fim da listagem", async ({ page }) => {
  await page.goto("/obras");
  await expect(page.getByRole("heading", { level: 2, name: "Solicite nossas Certidões de Acervo Técnico (CATs)" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Solicitar acervo e proposta" })).toHaveAttribute("href", /disciplina=consultoria&origem=acervo-tecnico/);
});

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("chips são links que preservam os demais filtros; Limpar é link", async ({ page }) => {
    await page.goto("/obras?uf=SC");
    await page.getByRole("link", { name: "SAUs e PREs" }).click();
    await expect(page).toHaveURL(/categoria=saupre&uf=SC/);
    await page.goto("/obras?q=zzzz");
    await page.getByRole("link", { name: "Limpar filtros" }).click();
    await expect(page).toHaveURL(/\/obras$/);
  });
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

test.describe("sem JavaScript no mobile", () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  test("filtros secundários ficam visíveis e 'Mais filtros' some", async ({ page }) => {
    await page.goto("/obras");
    await expect(page.getByLabel("Estado")).toBeVisible();
    await expect(page.getByRole("button", { name: "Mais filtros" })).toBeHidden();
  });
});
