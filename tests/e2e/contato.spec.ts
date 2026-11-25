import { expect, test, type Page } from "@playwright/test";

async function preencher(page: Page) {
  await page.getByLabel("Nome", { exact: true }).fill("João Silva");
  await page.getByLabel("Empresa").fill("Prefeitura de Exemplo");
  await page.getByLabel("E-mail").fill("joao@empresa.com.br");
  await page.getByLabel("Telefone").fill("(18) 99999-0000");
  await page.getByLabel("Segmento").selectOption("obras-civis");
  await page.getByLabel("Tipo de obra").fill("Reforma de escola");
  await page.getByLabel("Local da obra").fill("Regente Feijó, SP");
  await page.getByLabel("Mensagem").fill("Precisamos de uma proposta.");
  await page.getByLabel(/Concordo com o uso/).check();
}

const SUCESSO = "Recebemos sua mensagem. Nossa equipe responde em até 2 dias úteis.";

test("segmento vem preenchido pela URL", async ({ page }) => {
  await page.goto("/contato/comercial?segmento=infraestrutura&origem=restauracao");
  await expect(page.getByLabel("Segmento")).toHaveValue("infraestrutura");
});

test("segmento inválido na URL é ignorado", async ({ page }) => {
  await page.goto("/contato/comercial?segmento=xyz");
  await expect(page.getByLabel("Segmento")).toHaveValue("");
});

test("erros aparecem ligados aos campos e o foco vai para o primeiro", async ({ page }) => {
  await page.goto("/contato/comercial");
  await page.getByRole("button", { name: "Solicitar proposta" }).click();
  await expect(page.getByLabel("Nome", { exact: true })).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Nome", { exact: true })).toBeFocused();
  await expect(page.getByLabel("Nome", { exact: true })).toHaveAccessibleDescription("Informe seu nome.");
});

test("e-mail inválido mostra a microcopy", async ({ page }) => {
  await page.goto("/contato/comercial");
  await preencher(page);
  await page.getByLabel("E-mail").fill("joao");
  await page.getByRole("button", { name: "Solicitar proposta" }).click();
  await expect(page.getByText("Confira o e-mail. Ele precisa ter @ e um domínio, como nome@empresa.com.br.")).toBeVisible();
  await expect(page.getByLabel("Nome", { exact: true })).toHaveValue("João Silva");
  await expect(page.getByLabel("E-mail")).toBeFocused();
  await expect(page.getByLabel("Segmento")).toHaveValue("obras-civis");
});

test("envio válido mostra a mensagem de sucesso", async ({ page }) => {
  await page.goto("/contato/comercial");
  await preencher(page);
  await page.getByRole("button", { name: "Solicitar proposta" }).click();
  await expect(page.getByText(SUCESSO)).toBeVisible();
});

test("botão desabilitado durante o envio", async ({ page }) => {
  await page.goto("/contato/comercial");
  await preencher(page);
  await page.route("**/contato/comercial", async (route) => {
    if (route.request().method() === "POST") await new Promise((r) => setTimeout(r, 1500));
    await route.continue();
  });
  const botao = page.getByRole("button", { name: /Solicitar proposta|Enviando/ });
  await botao.click();
  await expect(page.getByRole("button", { name: "Enviando…" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Enviando…" })).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByText(SUCESSO)).toBeVisible();
});

test("funciona sem JavaScript", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/contato/comercial");
  await page.getByLabel("E-mail").fill("joao");
  await page.getByRole("button", { name: "Solicitar proposta" }).click();
  await expect(page.getByText("Confira o e-mail.")).toBeVisible();
  await preencher(page);
  await page.getByRole("button", { name: "Solicitar proposta" }).click();
  await expect(page.getByText(SUCESSO)).toBeVisible();
  await ctx.close();
});

test("consentimento não vem marcado", async ({ page }) => {
  await page.goto("/contato/comercial");
  await expect(page.getByLabel(/Concordo com o uso/)).not.toBeChecked();
  await expect(page.getByRole("link", { name: "Política de Privacidade" })).toHaveAttribute("href", "/privacidade");
});

test("/contato tem sede e cartões por intenção", async ({ page }) => {
  await page.goto("/contato");
  await expect(page.getByRole("heading", { level: 1, name: "Contato" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Sede" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Fale com a área certa" })).toBeVisible();
  for (const c of ["Comercial", "Carreiras", "Fornecedores", "Denúncias", "Imprensa"]) {
    await expect(page.getByRole("heading", { level: 3, name: c, exact: true })).toBeVisible();
  }
  await expect(page.getByText("Fale sem medo. O canal é externo, funciona 24 horas e aceita denúncias anônimas.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Abrir no mapa/ })).toHaveAttribute("href", /google\.com\/maps\/search\/\?api=1&query=/);
});
