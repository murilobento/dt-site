import { expect, test } from "@playwright/test";

test("seções da página Empresa", async ({ page }) => {
  await page.goto("/empresa");
  await expect(page.getByRole("heading", { level: 1, name: "Sobre a DT" })).toBeVisible();
  for (const h of ["Nossa história", "Como trabalhamos", "Missão", "Visão", "Valores", "Princípios"]) {
    await expect(page.getByRole("heading", { level: 2, name: h, exact: true })).toBeVisible();
  }
});

test("timeline navegável por teclado", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/empresa");
  const tabs = page.getByRole("tablist", { name: "Linha do tempo" }).getByRole("tab");
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(tabs.nth(1)).toHaveAttribute("tabindex", "0");
  await expect(tabs.first()).toHaveAttribute("tabindex", "-1");
  await expect(page.getByRole("tabpanel")).toContainText("Primeira obra rodoviária");
  await page.keyboard.press("ArrowRight");
  await expect(tabs.first()).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(tabs.last()).toBeFocused();
  await page.keyboard.press("Home");
  await expect(tabs.first()).toBeFocused();
  await page.keyboard.press("End");
  await expect(tabs.last()).toBeFocused();
});

test("mobile: timeline vira lista vertical com todos os marcos visíveis", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/empresa");
  await expect(page.getByRole("tablist")).toHaveCount(0);
  const items = page.locator("ol[aria-label='Linha do tempo'] > li");
  const n = await items.count();
  expect(n).toBeGreaterThan(1);
  for (let i = 0; i < n; i++) await expect(items.nth(i)).toBeVisible();
});

test("princípios com ícone de check decorativo", async ({ page }) => {
  await page.goto("/empresa");
  const li = page.locator("section", { has: page.getByRole("heading", { name: "Princípios", exact: true }) }).locator("li").first();
  await expect(li.locator("svg[aria-hidden='true']")).toHaveCount(1);
});
