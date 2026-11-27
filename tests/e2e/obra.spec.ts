import { expect, test } from "@playwright/test";

test("lightbox: abre por teclado, setas navegam, Esc fecha e devolve o foco", async ({ page }) => {
  await page.goto("/obras/pinhalzinho-sc");
  const thumb = page.getByRole("button", { name: /Ampliar foto 1/ });
  await thumb.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Galeria de fotos" });
  await expect(dialog).toContainText("1 de 4");
  await page.keyboard.press("ArrowRight");
  await expect(dialog).toContainText("2 de 4");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(dialog).toContainText("4 de 4");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(thumb).toBeFocused();
});

test("lightbox: botões Anterior, Próxima e Fechar", async ({ page }) => {
  await page.goto("/obras/pinhalzinho-sc");
  await page.getByRole("button", { name: /Ampliar foto 2/ }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Próxima" }).click();
  await expect(dialog).toContainText("3 de 4");
  await dialog.getByRole("button", { name: "Anterior" }).click();
  await expect(dialog).toContainText("2 de 4");
  await dialog.getByRole("button", { name: "Fechar" }).click();
  await expect(dialog).toHaveCount(0);
});

test("obra completa tem todas as seções e uma única imagem prioritária", async ({ page }) => {
  await page.goto("/obras/pinhalzinho-sc");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  for (const h of ["Desafio", "Solução", "Quantitativos executados", "Etapas da execução", "Ficha técnica", "Diferencial técnico", "Galeria", "Antes e depois"]) {
    await expect(page.getByRole("heading", { level: 2, name: h })).toBeVisible();
  }
  await expect(page.locator("img[fetchpriority='high']")).toHaveCount(1);
  await expect(page.getByRole("list").filter({ has: page.getByRole("heading", { level: 3 }) }).locator("li")).toHaveCount(3);
  await expect(page.getByRole("link", { name: "Restauração", exact: false }).first()).toHaveAttribute(
    "href",
    /\/servicos\/restauracao/,
  );
});

test("obra sem galeria nem antes/depois não mostra essas seções", async ({ page }) => {
  await page.goto("/obras/obra-minima-exemplo");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  for (const h of ["Galeria", "Antes e depois", "Diferencial técnico", "Desafio", "Solução", "Quantitativos executados", "Etapas da execução"]) {
    await expect(page.getByRole("heading", { name: h })).toHaveCount(0);
  }
  await expect(page.getByText(/undefined|null/)).toHaveCount(0);
  for (const l of ["Extensão", "Contrato", "Normativa"]) await expect(page.getByText(l, { exact: true })).toHaveCount(0);
  await expect(page.getByText("Cliente", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Em andamento • desde ago/2025")).toBeVisible();
});

test("CTA final usa a microcopy e o segmento da obra", async ({ page }) => {
  await page.goto("/obras/pinhalzinho-sc");
  await expect(page.getByText("Tem uma obra parecida? Fale com nosso time de Infraestrutura.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Solicitar proposta" }).last()).toHaveAttribute(
    "href",
    /segmento=infraestrutura&disciplina=rodoviaria-pavimentacao&origem=pinhalzinho-sc/,
  );
});

test("JSON-LD válido na página", async ({ page }) => {
  await page.goto("/obras/pinhalzinho-sc");
  const blocos = await page.locator('script[type="application/ld+json"]').allTextContents();
  const dados = blocos.map((b) => JSON.parse(b));
  const obra = dados.find((d) => d["@type"] === "CreativeWork");
  expect(obra.locationCreated.address.addressLocality).toBe("Pinhalzinho");
  const crumbs = dados.find((d) => d["@type"] === "BreadcrumbList");
  expect(crumbs.itemListElement.map((i: { name: string }) => i.name)).toEqual([
    "Início",
    "Obras",
    "Restauração rodoviária em Pinhalzinho [exemplo]",
  ]);
});

test("obra inexistente → 404", async ({ page }) => {
  expect((await page.goto("/obras/nao-existe"))?.status()).toBe(404);
});
