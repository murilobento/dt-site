import { expect, test, type Page } from "@playwright/test";

const SUCESSO = "Recebemos sua candidatura. Se houver uma vaga compatível, entraremos em contato.";

async function preencher(page: Page) {
  await page.getByLabel("Nome completo").fill("Maria Souza");
  await page.getByLabel("E-mail").fill("maria@exemplo.com.br");
  await page.getByLabel("Telefone / WhatsApp").fill("(18) 98888-0000");
  await page.getByLabel("Área de interesse").selectOption("Segurança do Trabalho");
  await page.getByLabel("Resumo de experiência / Link para currículo").fill("Técnica em segurança. https://exemplo.com/cv");
  await page.getByLabel(/Concordo com o uso/).check();
}

test("seções da página Compliance e Carreiras", async ({ page }) => {
  await page.goto("/compliance");
  await expect(page).toHaveTitle("Compliance e Carreiras | DT Construtora");
  await expect(page.getByRole("heading", { level: 1, name: "Compliance, segurança e carreiras" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Programa de integridade e SSMA" })).toBeVisible();
  await expect(page.locator("#compliance h3")).toHaveCount(3);
  await expect(page.locator("#trabalhe-conosco").getByRole("heading", { level: 2, name: "Trabalhe conosco" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Banco de talentos e candidaturas" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Selecionar esta vaga no formulário/ })).toHaveCount(3);
  const canal = page.getByRole("link", { name: /Acessar o canal de denúncias/ });
  await expect(canal).toHaveAttribute("target", "_blank");
  await expect(canal).toContainText("(abre em nova aba)");
});

test("Selecionar esta vaga preenche a Área e leva o foco ao campo", async ({ page }) => {
  await page.goto("/compliance");
  await page.getByRole("button", { name: /Selecionar esta vaga no formulário/ }).nth(1).click();
  const area = page.getByLabel("Área de interesse");
  await expect(area).toBeFocused();
  await expect(area).toHaveValue("Técnico em segurança do trabalho [exemplo]");
});

test("erros aparecem ligados aos campos e o foco vai para o primeiro", async ({ page }) => {
  await page.goto("/compliance");
  await page.getByRole("button", { name: "Enviar candidatura" }).click();
  const nome = page.getByLabel("Nome completo");
  await expect(nome).toHaveAttribute("aria-invalid", "true");
  await expect(nome).toBeFocused();
  await expect(nome).toHaveAccessibleDescription("Informe seu nome.");
  await expect(page.getByText("É preciso aceitar para analisarmos sua candidatura.")).toBeVisible();
});

test("erro de validação preserva os valores e a área escolhida", async ({ page }) => {
  await page.goto("/compliance");
  await preencher(page);
  await page.getByLabel("E-mail").fill("maria");
  await page.getByRole("button", { name: "Enviar candidatura" }).click();
  await expect(page.getByLabel("E-mail")).toBeFocused();
  await expect(page.getByLabel("Nome completo")).toHaveValue("Maria Souza");
  await expect(page.getByLabel("Área de interesse")).toHaveValue("Segurança do Trabalho");
  await expect(page.getByLabel(/Concordo com o uso/)).not.toBeChecked();
});

test("envio válido mostra a mensagem de sucesso", async ({ page }) => {
  await page.goto("/compliance");
  await preencher(page);
  await page.getByRole("button", { name: "Enviar candidatura" }).click();
  await expect(page.getByText(SUCESSO)).toBeVisible();
});

test("funciona sem JavaScript", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/compliance");
  await page.getByLabel("E-mail").fill("maria");
  await page.getByRole("button", { name: "Enviar candidatura" }).click();
  await expect(page.getByText("Confira o e-mail.")).toBeVisible();
  await preencher(page);
  await page.getByRole("button", { name: "Enviar candidatura" }).click();
  await expect(page.getByText(SUCESSO)).toBeVisible();
  await ctx.close();
});

test("consentimento não vem marcado e aponta para a Política de Privacidade", async ({ page }) => {
  await page.goto("/compliance");
  await expect(page.getByLabel(/Concordo com o uso/)).not.toBeChecked();
  await expect(page.getByRole("link", { name: "Política de Privacidade" })).toHaveAttribute("href", "/privacidade");
});
