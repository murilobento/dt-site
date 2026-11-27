import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const PATHS = [
  "/",
  "/sobre",
  "/compliance",
  "/servicos",
  "/servicos/restauracao",
  "/obras",
  "/obras/pinhalzinho-sc",
  "/contato",
  "/privacidade",
];

/** Percorre a página para disparar os `.reveal` (IntersectionObserver) e espera as transições de 300 ms. */
async function revealAll(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= height; y += 400) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(50);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator('[data-reveal="pending"]')).toHaveCount(0);
  await page.waitForTimeout(500);
}

// @axe-core/playwright traz um playwright-core mais novo que o do @playwright/test; os tipos de Page divergem.
type AxePage = ConstructorParameters<typeof AxeBuilder>[0]["page"];

async function seriousViolations(page: Page) {
  const r = await new AxeBuilder({ page: page as unknown as AxePage })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  return r.violations
    .filter((v) => ["critical", "serious"].includes(v.impact!))
    .map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.target.join(" ")) }));
}

for (const path of PATHS) {
  test(`axe sem violações graves em ${path} (banner aberto)`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("region", { name: "Cookies" })).toBeVisible();
    await revealAll(page);
    expect(await seriousViolations(page)).toEqual([]);
  });

  test(`axe sem violações graves em ${path} (banner dispensado)`, async ({ page }) => {
    await page.goto(path);
    await page.getByRole("button", { name: "Recusar opcionais" }).click();
    await expect(page.getByRole("region", { name: "Cookies" })).toBeHidden();
    await revealAll(page);
    expect(await seriousViolations(page)).toEqual([]);
  });
}

test("nenhuma violação de CSP no console após aceitar desempenho", async ({ page }) => {
  const csp: string[] = [];
  page.on("console", (m) => {
    if (/content security policy/i.test(m.text())) csp.push(m.text());
  });
  await page.route(/googletagmanager\.com\//, (r) =>
    r.fulfill({ status: 200, contentType: "application/javascript", body: "" }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: /Aceitar/ }).first().click();
  await page.waitForTimeout(1000);
  expect(csp).toEqual([]);
});
