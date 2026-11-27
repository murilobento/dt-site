import { expect, test, type Page } from "@playwright/test";

async function preencher(page: Page) {
  await page.getByLabel("Nome completo").fill("João Silva");
  await page.getByLabel("Empresa / Órgão").fill("Prefeitura de Exemplo");
  await page.getByLabel("E-mail corporativo").fill("joao@empresa.com.br");
  await page.getByLabel("Telefone / WhatsApp").fill("(18) 99999-0000");
  await page.getByLabel("Disciplina principal").selectOption("edificacao-reforma");
  await page.getByLabel("Cidade / UF da obra").fill("Regente Feijó - SP");
  await page.getByLabel("Escopo resumido, prazo ou número do edital").fill("Reforma de escola, prazo de 6 meses.");
  await page.getByLabel(/Concordo com o uso/).check();
}

const SUCESSO = "Recebemos sua mensagem. Nossa equipe responde em até 2 dias úteis.";

test("disciplina vem preenchida pela URL e vence o segmento legado", async ({ page }) => {
  await page.goto("/contato?segmento=infraestrutura&disciplina=sau-pre");
  await expect(page.getByLabel("Disciplina principal")).toHaveValue("sau-pre");
});

test("disciplina inválida na URL é ignorada", async ({ page }) => {
  await page.goto("/contato?disciplina=xyz&segmento=xyz");
  await expect(page.getByLabel("Disciplina principal")).toHaveValue("");
});

test("/contato/comercial redireciona em definitivo para /contato preservando a query e a disciplina", async ({ page, request }) => {
  const r = await request.get("/contato/comercial?segmento=infraestrutura&origem=x", { maxRedirects: 0 });
  expect(r.status()).toBe(308);
  expect(r.headers().location).toBe("/contato?segmento=infraestrutura&origem=x");
  await page.goto("/contato/comercial?segmento=infraestrutura&origem=x");
  await expect(page).toHaveURL(/\/contato\?segmento=infraestrutura&origem=x$/);
  await expect(page.getByLabel("Disciplina principal")).toHaveValue("rodoviaria-pavimentacao");
  await page.goto("/contato/comercial?segmento=obras-civis");
  await expect(page.getByLabel("Disciplina principal")).toHaveValue("edificacao-reforma");
});

test("erros aparecem ligados aos campos e o foco vai para o primeiro", async ({ page }) => {
  await page.goto("/contato");
  await page.getByRole("button", { name: "Enviar solicitação técnica" }).click();
  await expect(page.getByLabel("Nome completo")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Nome completo")).toBeFocused();
  await expect(page.getByLabel("Nome completo")).toHaveAccessibleDescription("Informe seu nome.");
});

test("e-mail inválido mostra a microcopy", async ({ page }) => {
  await page.goto("/contato");
  await preencher(page);
  await page.getByLabel("E-mail corporativo").fill("joao");
  await page.getByRole("button", { name: "Enviar solicitação técnica" }).click();
  await expect(page.getByText("Confira o e-mail. Ele precisa ter @ e um domínio, como nome@empresa.com.br.")).toBeVisible();
  await expect(page.getByLabel("Nome completo")).toHaveValue("João Silva");
  await expect(page.getByLabel("E-mail corporativo")).toBeFocused();
  await expect(page.getByLabel("Disciplina principal")).toHaveValue("edificacao-reforma");
});

test("envio válido mostra a mensagem de sucesso", async ({ page }) => {
  await page.goto("/contato");
  await preencher(page);
  await page.getByRole("button", { name: "Enviar solicitação técnica" }).click();
  await expect(page.getByText(SUCESSO)).toBeVisible();
});

test("botão desabilitado durante o envio", async ({ page }) => {
  await page.goto("/contato");
  await preencher(page);
  await page.route("**/contato", async (route) => {
    if (route.request().method() === "POST") await new Promise((r) => setTimeout(r, 1500));
    await route.continue();
  });
  const botao = page.getByRole("button", { name: /Enviar solicitação técnica|Enviando/ });
  await botao.click();
  await expect(page.getByRole("button", { name: "Enviando…" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Enviando…" })).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByText(SUCESSO)).toBeVisible();
});

test("funciona sem JavaScript", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/contato");
  await page.getByLabel("E-mail corporativo").fill("joao");
  await page.getByRole("button", { name: "Enviar solicitação técnica" }).click();
  await expect(page.getByText("Confira o e-mail.")).toBeVisible();
  await preencher(page);
  await page.getByRole("button", { name: "Enviar solicitação técnica" }).click();
  await expect(page.getByText(SUCESSO)).toBeVisible();
  await ctx.close();
});

test("campos obrigatórios têm asterisco visual, aria-required e legenda; opções com o texto do layout", async ({ page }) => {
  await page.goto("/contato");
  for (const l of ["Nome completo", "Empresa / Órgão", "E-mail corporativo", "Telefone / WhatsApp", "Disciplina principal", "Escopo resumido, prazo ou número do edital"]) {
    await expect(page.getByLabel(l)).toHaveAttribute("aria-required", "true");
  }
  await expect(page.getByLabel("Cidade / UF da obra")).not.toHaveAttribute("aria-required", "true");
  await expect(page.getByText("* Campos obrigatórios")).toBeVisible();
  await expect(page.getByText("Preencha os campos obrigatórios para direcionarmos ao coordenador da disciplina.")).toBeVisible();
  const opcoes = await page.getByLabel("Disciplina principal").locator("option").allTextContents();
  expect(opcoes).toEqual([
    "Selecione",
    "Obra rodoviária / pavimentação",
    "Terraplanagem e drenagens",
    "SAU / PRE rodoviário",
    "Edificação / reforma predial",
    "Consultoria / projeto / laudo",
  ]);
});

test("consentimento não vem marcado", async ({ page }) => {
  await page.goto("/contato");
  await expect(page.getByLabel(/Concordo com o uso/)).not.toBeChecked();
  await expect(page.getByRole("link", { name: "Política de Privacidade" })).toHaveAttribute("href", "/privacidade");
});

test("/contato traz a página unificada: formulário, canais, sede, editais e outros assuntos", async ({ page }) => {
  await page.goto("/contato");
  await expect(page.getByRole("heading", { level: 1, name: "Solicite proposta técnica ou agende consultoria" })).toBeVisible();
  for (const h of ["Dados da solicitação", "Canais Diretos de Engenharia", "Sede Operacional", "Atendimento a Editais e Licitações", "Outros assuntos"]) {
    await expect(page.getByRole("heading", { level: 2, name: h })).toBeVisible();
  }
  for (const c of ["Carreiras", "Fornecedores", "Imprensa", "Denúncias"]) {
    await expect(page.getByRole("heading", { level: 3, name: c, exact: true })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: /Trabalhe conosco/ })).toHaveAttribute("href", "/compliance#trabalhe-conosco");
  await expect(page.getByText("Fale sem medo. O canal é externo, funciona 24 horas e aceita denúncias anônimas.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Abrir no mapa/ })).toHaveAttribute("href", /google\.com\/maps\/search\/\?api=1&query=/);
  await expect(page.getByRole("link", { name: /Acessar o canal/ })).toHaveAttribute("target", "_blank");
  await expect(page.getByRole("main").getByText("Regente Feijó - SP")).toBeVisible();
  await expect(page.getByText(/CREA|Curitiba/)).toHaveCount(0);
});
