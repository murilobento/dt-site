import { expect, test } from "@playwright/test";

test("home responde e declara pt-BR", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
});
