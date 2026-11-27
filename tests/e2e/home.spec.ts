import { expect, test } from "@playwright/test";
import { serializeConsent } from "../../src/lib/consent/consent";

test("hero tem H1 exato, 2 CTAs e uma única imagem priorizada", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Infraestrutura viária e edificações com rigor técnico");
  await expect(page.getByRole("main").getByRole("link", { name: "Explorar serviços" })).toHaveAttribute("href", "/servicos");
  await expect(page.getByRole("link", { name: "Ver obras executadas" })).toHaveAttribute("href", "/obras");
  await expect(page.locator("img[fetchpriority='high']")).toHaveCount(1);
});

test("seções na ordem do layout", async ({ page }) => {
  await page.goto("/");
  const headings = await page.locator("main h2").allTextContents();
  expect(headings).toEqual([
    "Serviços e consultoria especializada",
    "Obras em destaque",
    "Rigor de engenharia do projeto à entrega",
    "Precisa de orçamento ou consultoria técnica para sua obra?",
  ]);
  await expect(page.locator("main section", { hasText: "Obras em destaque" }).locator("article")).toHaveCount(3);
  await expect(page.getByRole("link", { name: "Ver todas as obras" })).toHaveAttribute("href", "/obras");
  await expect(page.getByRole("region", { name: "Números da DT" }).locator("li")).toHaveCount(4);
});

test("abas de serviços: rótulos e navegação por teclado", async ({ page }) => {
  await page.goto("/");
  const tabs = page.getByRole("tab");
  await expect(tabs).toHaveText(["Infraestrutura Rodoviária", "Edificações e Reformas", "Consultoria Técnica"]);
  await expect(page.getByRole("tabpanel").getByRole("link", { name: /Solicitar escopo/ }).first()).toBeVisible();
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel").getByRole("link", { name: /Agendar consultoria/ }).first()).toBeVisible();
  await page.keyboard.press("Home");
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
});

test("serviços e obras linkam para as páginas de detalhe", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main a[href^='/servicos/']").first()).toBeVisible();
  await expect(page.locator("main a[href^='/obras/']").first()).toBeVisible();
});

test("reduced motion: conteúdo visível e números já no valor final", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-reveal='pending']")).toHaveCount(0);
  const stat = page.getByRole("region", { name: "Números da DT" }).locator("li").first().locator("p span").first();
  await expect(stat).not.toHaveText("0");
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
  const cta = page.getByRole("main").getByRole("link", { name: "Explorar serviços" });
  // Evita navegar: o evento já foi empilhado no dataLayer quando o clique chega ao handler.
  await cta.evaluate((el) => el.addEventListener("click", (e) => e.preventDefault()));
  await cta.click();
  const events = await page.evaluate(() => (window.dataLayer as { event?: string; local?: string }[]).filter((d) => d.event === "cta_click"));
  expect(events).toEqual([{ event: "cta_click", local: "hero" }]);
});

test("clique no CTA final gera cta_click com local cta-final", async ({ page, context }) => {
  await page.route(/(^|\.|\/\/)googletagmanager\.com\//, (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await context.addCookies([
    {
      name: "dt_consent",
      value: encodeURIComponent(serializeConsent({ desempenho: true, marketing: false })),
      url: "http://localhost:3000",
    },
  ]);
  await page.goto("/");
  const cta = page.getByRole("main").getByRole("link", { name: "Solicitar proposta técnica" });
  await expect(cta).toHaveAttribute("href", "/contato");
  await cta.evaluate((el) => el.addEventListener("click", (e) => e.preventDefault()));
  await cta.click();
  const events = await page.evaluate(() => (window.dataLayer as { event?: string; local?: string }[]).filter((d) => d.event === "cta_click"));
  expect(events).toEqual([{ event: "cta_click", local: "cta-final" }]);
});
