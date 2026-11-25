import { expect, test, type Page } from "@playwright/test";

/** Intercepta o GTM (nunca toca a rede real) e registra as tentativas. */
async function trackGtm(page: Page): Promise<string[]> {
  const hits: string[] = [];
  await page.route(/(^|\.|\/\/)googletagmanager\.com\//, (route) => {
    hits.push(route.request().url());
    return route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
  });
  return hits;
}

const banner = (page: Page) => page.getByRole("region", { name: "Cookies" });

test("nenhuma requisição ao GTM antes do aceite", async ({ page }) => {
  const hits = await trackGtm(page);
  await page.goto("/");
  await expect(banner(page)).toBeVisible();
  expect(hits).toHaveLength(0);
  await page.getByRole("button", { name: "Recusar opcionais" }).click();
  await expect(banner(page)).toBeHidden();
  await page.reload();
  await page.waitForTimeout(500);
  await expect(banner(page)).toBeHidden();
  expect(hits).toHaveLength(0);
});

test("aceitar desempenho carrega o GTM e o banner some", async ({ page }) => {
  const hits = await trackGtm(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Aceitar todos" }).click();
  await expect.poll(() => hits.length).toBeGreaterThan(0);
  await expect(banner(page)).toBeHidden();
  hits.length = 0;
  await page.reload();
  await expect(banner(page)).toBeHidden();
  await expect.poll(() => hits.length).toBeGreaterThan(0);
});

test("banner expõe data-cookie-banner e --cookie-banner-h enquanto visível", async ({ page }) => {
  await trackGtm(page);
  await page.goto("/");
  await expect(page.locator("[data-cookie-banner]")).toBeVisible();
  const h = await page.evaluate(() => document.documentElement.style.getPropertyValue("--cookie-banner-h"));
  expect(parseInt(h, 10)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Recusar opcionais" }).click();
  const after = await page.evaluate(() => document.documentElement.style.getPropertyValue("--cookie-banner-h"));
  expect(after).toBe("");
});

test("preferências: categorias desmarcadas por padrão, essenciais travadas", async ({ page }) => {
  await trackGtm(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Preferências", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Preferências de cookies" });
  await expect(dialog.getByRole("checkbox", { name: /Essenciais/ })).toBeChecked();
  await expect(dialog.getByRole("checkbox", { name: /Essenciais/ })).toBeDisabled();
  await expect(dialog.getByRole("checkbox", { name: /Desempenho/ })).not.toBeChecked();
  await expect(dialog.getByRole("checkbox", { name: /Marketing/ })).not.toBeChecked();
});

test("salvar só desempenho persiste a escolha", async ({ page }) => {
  const hits = await trackGtm(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Preferências", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Preferências de cookies" });
  await dialog.getByRole("checkbox", { name: /Desempenho/ }).check();
  await dialog.getByRole("button", { name: "Salvar preferências" }).click();
  await expect(banner(page)).toBeHidden();
  await expect.poll(() => hits.length).toBeGreaterThan(0);
  const cookie = (await page.context().cookies()).find((c) => c.name === "dt_consent");
  expect(cookie?.sameSite).toBe("Lax");
  const value = JSON.parse(decodeURIComponent(cookie!.value));
  expect(value).toMatchObject({ version: 1, desempenho: true, marketing: false });
});

test("rodapé reabre preferências", async ({ page }) => {
  await trackGtm(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Recusar opcionais" }).click();
  await page.getByRole("contentinfo").getByRole("button", { name: "Preferências de cookies" }).click();
  await expect(page.getByRole("dialog", { name: "Preferências de cookies" })).toBeVisible();
});

test("páginas legais mostram versão e vigência no topo", async ({ page }) => {
  await trackGtm(page);
  await page.goto("/privacidade");
  await expect(page).toHaveTitle(/Política de Privacidade/);
  await expect(page.getByText(/Versão .* — vigente desde \d{2}\/\d{2}\/\d{4}/)).toBeVisible();
  await page.goto("/cookies");
  await expect(page).toHaveTitle(/Política de Cookies/);
  await expect(page.getByText(/vigente desde 01\/01\/2025/)).toBeVisible();
});
