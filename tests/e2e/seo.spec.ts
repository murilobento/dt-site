import { expect, test } from "@playwright/test";

const URLS = ["/", "/empresa", "/servicos", "/servicos/restauracao", "/obras", "/obras/pinhalzinho-sc", "/contato", "/contato/comercial"];

test("títulos e descriptions únicos nas páginas da Fase 1", async ({ page }) => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const url of URLS) {
    await page.goto(url);
    titles.add(await page.title());
    descriptions.add((await page.locator('meta[name="description"]').getAttribute("content")) ?? "");
  }
  expect(titles.size).toBe(URLS.length);
  expect(descriptions.size).toBe(URLS.length);
  expect(descriptions.has("")).toBe(false);
});

test("canonical e Open Graph pt_BR na home e em uma obra", async ({ page }) => {
  await page.goto("/obras/pinhalzinho-sc");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/obras\/pinhalzinho-sc$/);
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "pt_BR");
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  await page.goto("/");
  await expect(page).toHaveTitle("DT Construtora e Consultoria | Obras civis e infraestrutura");
});

test("robots.txt bloqueia /studio e /api e aponta o sitemap", async ({ request }) => {
  const body = await (await request.get("/robots.txt")).text();
  expect(body).toContain("Disallow: /studio");
  expect(body).toContain("Disallow: /api");
  expect(body).toMatch(/Sitemap: https?:\/\/[^\s]+\/sitemap\.xml/);
});

test("sitemap.xml lista obras e serviços e não lista /studio", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.ok()).toBe(true);
  const xml = await res.text();
  expect(xml).toContain("/obras/pinhalzinho-sc");
  expect(xml).toContain("/servicos/restauracao");
  expect(xml).not.toContain("/studio");
});

test("headers de segurança", async ({ request }) => {
  const h = (await request.get("/")).headers();
  expect(h["strict-transport-security"]).toContain("max-age=63072000");
  expect(h["content-security-policy"]).toContain("default-src 'self'");
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(h["permissions-policy"]).toBe("camera=(), microphone=(), geolocation=()");
});

test("/studio recebe a CSP própria, sem herdar a global", async ({ request }) => {
  const h = (await request.get("/studio")).headers();
  expect(h["content-security-policy"]).toContain("wss://*.sanity.io");
  expect(h["content-security-policy"]).not.toContain("googletagmanager");
  expect(h["x-frame-options"]).toBe("SAMEORIGIN");
  expect(h["strict-transport-security"]).toContain("max-age=");
});

test("JSON-LD: Organization no layout, LocalBusiness em /contato, breadcrumb em serviço", async ({ page }) => {
  const types = async () =>
    (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t)["@type"]);
  await page.goto("/contato");
  expect(await types()).toEqual(expect.arrayContaining(["Organization", "GeneralContractor"]));
  await page.goto("/servicos/restauracao");
  expect(await types()).toEqual(expect.arrayContaining(["Organization", "BreadcrumbList"]));
});
