import { expect, test } from "@playwright/test";

test("sem rede externa: nenhum ícone em fonte nem requisição a Google Fonts", async ({ page }) => {
  const external: string[] = [];
  // Simula rede externa bloqueada: registra e aborta tudo que não for do próprio servidor.
  await page.route(
    (url) => url.hostname !== "localhost" && url.hostname !== "127.0.0.1",
    (route) => {
      external.push(route.request().url());
      return route.abort();
    },
  );
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  expect(external.filter((u) => /fonts\.(googleapis|gstatic)\.com/.test(u))).toEqual([]);
  await expect(page.locator('[class*="material-symbols"], [class*="material-icons"]')).toHaveCount(0);

  // Nenhum texto de ligadura de ícone ("arrow_forward", "menu" etc.) no corpo visível.
  const body = await page.locator("body").innerText();
  expect(body).not.toMatch(/\b(arrow_forward|arrow_back|mail|engineering|chevron_right|expand_more)\b/);

  // Fontes carregam do próprio domínio (next/font/local).
  const loaded = await page.evaluate(() => [...document.fonts].filter((f) => f.status === "loaded").length);
  expect(loaded).toBeGreaterThan(0);
});
