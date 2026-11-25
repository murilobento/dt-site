import { expect, test } from "@playwright/test";
import { serializeConsent } from "../../src/lib/consent/consent";

test("hero tem H1, 2 CTAs e imagem priorizada", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Fale com a equipe" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver obras" })).toHaveAttribute("href", "/obras");
  await expect(page.locator("img[fetchpriority='high']")).toHaveCount(1);
});

test("seções na ordem do PRD", async ({ page }) => {
  await page.goto("/");
  const headings = await page.locator("main h2").allTextContents();
  expect(headings).toEqual([
    "Nossa atuação em números",
    "Dois segmentos, uma só equipe",
    "Veja o que já executamos",
    "Quem confia na DT",
    "Tem uma obra para tirar do papel?",
  ]);
  const cards = await page.locator("main section", { hasText: "Veja o que já executamos" }).locator("article").count();
  expect(cards).toBeGreaterThanOrEqual(3);
  expect(cards).toBeLessThanOrEqual(6);
});

test("serviços e obras linkam para as páginas de detalhe", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main a[href^='/servicos/']").first()).toBeVisible();
  await expect(page.locator("main a[href^='/obras/']").first()).toBeVisible();
});

test("clique no CTA do hero gera cta_click (com consentimento)", async ({ page, context }) => {
  await page.route(/(^|\.|\/\/)googletagmanager\.com\//, (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await context.addCookies([
    {
      name: "dt_consent",
      value: encodeURIComponent(serializeConsent({ desempenho: true, marketing: false })),
      url: "http://localhost:3000",
    },
  ]);
  await page.goto("/");
  const cta = page.getByRole("main").getByRole("link", { name: "Fale com a equipe" });
  // Evita navegar: o evento já foi empilhado no dataLayer quando o clique chega ao handler.
  await cta.evaluate((el) => el.addEventListener("click", (e) => e.preventDefault()));
  await cta.click();
  const events = await page.evaluate(() => (window.dataLayer as { event?: string; local?: string }[]).filter((d) => d.event === "cta_click"));
  expect(events).toEqual([{ event: "cta_click", local: "hero" }]);
});
