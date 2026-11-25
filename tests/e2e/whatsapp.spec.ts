import { expect, test } from "@playwright/test";

const link = (page: import("@playwright/test").Page) =>
  page.getByRole("link", { name: "Falar no WhatsApp (abre em nova aba)" });

test("botão do WhatsApp aponta para wa.me, abre em nova aba e mede 56px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");
  const a = link(page);
  await expect(a).toBeVisible();
  await expect(a).toHaveAttribute("href", /^https:\/\/wa\.me\/5514981734581\?text=/);
  await expect(a).toHaveAttribute("target", "_blank");
  await expect(a).toHaveAttribute("rel", "noopener noreferrer");
  const box = await a.boundingBox();
  expect(Math.round(box!.width)).toBe(56);
  expect(Math.round(box!.height)).toBe(56);
});

test("com o banner aberto, o botão não cobre 'Aceitar todos' em 360px e desce ao fechar", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");
  const aceitar = page.getByRole("button", { name: "Aceitar todos" });
  await expect(aceitar).toBeVisible();
  const a = link(page);
  const wa = (await a.boundingBox())!;
  const ac = (await aceitar.boundingBox())!;
  const intersect = wa.x < ac.x + ac.width && wa.x + wa.width > ac.x && wa.y < ac.y + ac.height && wa.y + wa.height > ac.y;
  expect(intersect).toBe(false);
  const bannerTop = (await page.locator("[data-cookie-banner]").boundingBox())!.y;
  expect(wa.y + wa.height).toBeLessThanOrEqual(bannerTop);

  await aceitar.click();
  await expect(page.locator("[data-cookie-banner]")).toBeHidden();
  await expect.poll(async () => (await a.boundingBox())!.y + 56).toBeCloseTo(740 - 16, 0);
});

test("clique registra whatsapp_click quando há consentimento, sem abrir wa.me", async ({ page }) => {
  await page.route(/googletagmanager\.com\//, (r) =>
    r.fulfill({ status: 200, contentType: "application/javascript", body: "" }),
  );
  await page.route(/wa\.me\//, (r) => r.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "Aceitar todos" }).click();
  await page.reload();
  await link(page).evaluate((el) => el.addEventListener("click", (e) => e.preventDefault()));
  await link(page).click();
  const events = await page.evaluate(() => (window.dataLayer as { event?: string; pagina?: string }[]).filter((d) => d.event === "whatsapp_click"));
  expect(events).toEqual([{ event: "whatsapp_click", pagina: "/" }]);
});

test("borda branca mantém o contorno visível sobre o rodapé escuro", async ({ page }) => {
  await page.goto("/");
  const a = link(page);
  await expect(a).toHaveCSS("border-top-color", "rgb(255, 255, 255)");
  await expect(a).toHaveCSS("border-top-width", "2px");
});
