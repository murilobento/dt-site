import { expect, test } from "@playwright/test";

test("1280 px: itens e CTA visíveis sem drawer", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  for (const l of ["Serviços", "Obras", "Consultoria", "Sobre Nós", "Compliance", "Contato"]) {
    await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: l })).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "Abrir menu" })).toBeHidden();
  await expect(page.getByRole("banner").getByRole("link", { name: "Solicitar proposta" })).toHaveAttribute("href", "/contato");
});

test("item ativo do menu tem aria-current e sublinhado laranja", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/obras");
  const ativo = page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Obras" });
  await expect(ativo).toHaveAttribute("aria-current", "page");
  await expect(ativo).toHaveCSS("border-bottom-color", "rgb(217, 119, 7)");
  await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Serviços" })).not.toHaveAttribute("aria-current");
});

test("360 px: drawer abre por teclado, prende o foco, fecha com Esc e devolve o foco", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");
  const btn = page.getByRole("button", { name: "Abrir menu" });
  await btn.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
  for (let i = 0; i < 10; i++) await page.keyboard.press("Tab");
  await expect(page.getByRole("dialog").locator(":focus")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(btn).toBeFocused();
});

test("360 px: CTA do header some, mas continua no drawer", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");
  await expect(page.getByRole("banner").getByRole("link", { name: "Solicitar proposta" })).toBeHidden();
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await expect(page.getByRole("dialog").getByRole("link", { name: "Solicitar proposta" })).toBeVisible();
});

test("drawer fecha ao ampliar a janela para 1024 px ou mais", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("360 px: clicar em um link fecha o drawer", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page.getByRole("dialog").getByRole("link", { name: "Obras" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("skip link leva ao conteúdo", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Pular para o conteúdo" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#conteudo$/);
  await expect(page.locator("main#conteudo")).toHaveCount(1);
});

test("rodapé mostra razão social, CNPJ, canal de denúncias e links legais", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByText("DT CONSTRUTORA E CONSULTORIA LTDA")).toBeVisible();
  await expect(footer.getByText("53.675.601/0001-60")).toBeVisible();
  await expect(footer.getByRole("link", { name: "Privacidade" })).toHaveAttribute("href", "/privacidade");
  await expect(footer.getByRole("link", { name: "Cookies" })).toHaveAttribute("href", "/cookies");
  const canal = footer.getByRole("link", { name: "Canal de denúncias (abre em nova aba)" });
  await expect(canal).toHaveAttribute("href", "https://example.com/canal-de-denuncias");
  await expect(canal).toHaveAttribute("target", "_blank");
  await expect(canal).toHaveAttribute("rel", "noopener noreferrer");
});

test("rodapé: grupos do layout, endereço real e WhatsApp da configuração", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("heading", { name: "Atuação & Institucional" })).toBeVisible();
  await expect(footer.getByRole("heading", { name: "Contato Institucional" })).toBeVisible();
  await expect(footer.getByRole("link", { name: "Compliance e Carreiras" })).toHaveAttribute("href", "/compliance");
  await expect(footer.getByRole("link", { name: "Sobre Nós" })).toHaveAttribute("href", "/sobre");
  await expect(footer.getByRole("link", { name: /\+55 \(14\) 98173-4581/ })).toHaveAttribute("href", /^https:\/\/wa\.me\/5514981734581/);
  await expect(footer.getByRole("button", { name: "Preferências de cookies" })).toBeVisible();
  await expect(footer).not.toContainText(/Curitiba|\(41\)|CREA-PR/);
});
