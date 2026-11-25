# Site Institucional DT Construtora — Fase 1: Plano de implementação

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar este plano tarefa por tarefa. Os passos usam checkbox (`- [ ]`) para acompanhamento.

**Objetivo:** pôr no ar a Fase 1 do site institucional da DT Construtora: Home, Empresa, Serviços, Obras (listagem + ficha), Contato e Contato comercial, mais header, rodapé, WhatsApp, consentimento de cookies, Privacidade/Cookies, SEO e gate de qualidade.

**Arquitetura:** Next.js (App Router) renderiza no servidor (SSG/ISR) todas as páginas de conteúdo. O conteúdo é lido por uma interface `ContentSource` com duas implementações: `fixtures` (JSON local, usada em testes, CI e antes do conteúdo real) e `sanity` (produção). JavaScript de cliente só em filtros, drawer, galeria, banner de cookies, contadores e formulário. O Sanity Studio fica embutido em `/studio` e publica via webhook que revalida as páginas por tag.

**Stack:** Next.js 15+, React 19, TypeScript (strict), Tailwind CSS v4 (`@theme`), Sanity v3 + `next-sanity`, Radix UI (Dialog), Zod, Resend, Cloudflare Turnstile (modo invisível), Vitest + Testing Library, Playwright + `@axe-core/playwright`, Lighthouse CI, Vercel, Sentry.

**Spec:** `docs/specs/2026-11-25-prd-site-institucional.md` (fonte viva: https://claude.ai/artifact/UEozGaMA36me5mLF1TQYA7).

## Pré-requisitos (entregues pelo Murilo / DT antes da tarefa indicada)

| Item | Necessário até |
| --- | --- |
| Repositório GitHub (ou acesso para criar `dt-construtora/site`) | Tarefa 1 |
| Logo da DT em SVG (versões clara e escura) + cores da marca em hex | Tarefa 2 |
| Projeto Sanity criado na conta da DT (plano Free) + token de leitura e de escrita | Tarefa 4 |
| Razão social, CNPJ, endereço da sede, telefone, horário, redes sociais, número de WhatsApp comercial | Tarefa 5 |
| E-mails de destino por segmento (Obras civis, Infraestrutura) | Tarefa 13 |
| Conta Resend com domínio da DT verificado (DNS) | Tarefa 13 |
| Chaves Cloudflare Turnstile | Tarefa 13 |
| ID do contêiner Google Tag Manager com GA4 | Tarefa 6 |
| Lista de URLs do site atual da DT (vazia se não houver site) | Tarefa 15 |
| Conta Vercel (time da DT) | Tarefa 16 |

Até o conteúdo real chegar, o site roda com `CONTENT_SOURCE=fixtures`.

## Escopo desta fase

Requisitos do PRD cobertos: RF-01, RF-02, RF-04 a RF-08, RF-10, RF-11, RF-14 a RF-16, RF-24, RF-25, RF-30, mais os RNF de performance, SEO, acessibilidade, LGPD, segurança e analytics que tocam essas páginas.

Ficam para as fases seguintes (planos próprios, ver fim do documento): RF-03 completo (links de Integridade e Fornecedores), RF-09, RF-12, RF-13, RF-17 a RF-23, RF-26 a RF-29, integração com CRM, vídeo no hero.

## Global Constraints

- Idioma `pt-BR` em `<html lang>`, datas `dd/mm/aaaa`, números com separador `.` de milhar.
- Menu principal: no máximo 6 itens, nenhum item "Mais"; cabe inline em 1280 px; abaixo de 1024 px vira drawer acessível por teclado.
- CTA do header: "Fale com a equipe" → `/contato/comercial`.
- Tokens de cor (trocar `brand.*` pelos hex da DT mantendo os papéis): `brand-primary #C3171B`, `brand-primary-bright #ED1C24` (nunca em texto pequeno), `brand-secondary #0088CB`, `surface-inverse #14213D`, `surface-default #FFFFFF`, `surface-muted #F4F4F2`, `text-primary #1A1A1A`, `text-secondary #5F6360`, `border #D9D9D6`, `success #1E7F4F`, `warning #B26B00`, `error #B3261E`.
- Fontes: display Syne 600–700 só em H1–H2; texto Raleway 400/500/600. Escala (base 16, razão 1,25): 12 · 14 · 16 · 20 · 25 · 31 · 39 · 49 · 61 px. Altura de linha 1,5 corpo / 1,1 títulos.
- Grid 12 colunas, largura máxima 1280 px, gutter 24 px (16 px no mobile). Espaços 4 · 8 · 16 · 24 · 32 · 48 · 64 · 96 · 128. Raio 4 px botões/inputs, 8 px cards. Sombra só em menu e WhatsApp.
- Movimento: entrada fade + 16 px, 300 ms, ease-out, uma vez por seção; contadores ≤ 1,2 s; com `prefers-reduced-motion` nenhuma animação de entrada e contadores mostram o valor final.
- Caixa-alta só em rótulos de até 3 palavras; nunca em parágrafos.
- Frases de até 25 palavras; botões dizem o resultado ("Solicitar proposta", "Ver obras").
- Alt de imagem descreve o que se vê e onde; logos usam o nome do cliente; decorativas com `alt=""`.
- Core Web Vitals mobile p75: LCP < 2,5 s · INP < 200 ms · CLS < 0,1. `fetchpriority="high"` só na imagem do hero.
- Lighthouse ≥ 90 em Performance, SEO e Acessibilidade nas 5 páginas principais (`/`, `/empresa`, `/servicos/[primeiro]`, `/obras`, `/contato/comercial`); zero violações axe `critical`/`serious`.
- WCAG 2.2 AA: contraste ≥ 4,5:1, foco visível, skip link, landmarks, headings sem saltos.
- LGPD: nenhum script de analytics antes do consentimento; categorias `essenciais`, `desempenho`, `marketing`; checkbox de consentimento nunca pré-marcado.
- Eventos GA4 desta fase: `lead_submit`, `cta_click`, `whatsapp_click`, `project_view`, `filter_use`.
- Segredos só em variáveis de ambiente; HTTPS + HSTS; CSP definida em `next.config.ts`.
- Navegadores: 2 últimas versões de Chrome, Safari, Edge, Firefox; layout de 360 px a 1920 px.

## Review Focus

1. **Obra com campos opcionais vazios** (sem término, sem antes/depois, sem coordenadas, galeria vazia, sem cliente divulgável): a ficha omite a seção inteira, sem rótulo órfão nem "undefined". Teste na Tarefa 11.
2. **Busca com acento e caixa diferentes** ("sao paulo", "PINHALZINHO", "conservação" vs "conservacao"): encontra a obra. Teste na Tarefa 10.
3. **Parâmetros de URL inválidos ou antigos** (`/obras?uf=XX&status=foo&segmento=`): valores desconhecidos são ignorados, lista completa aparece, nada quebra. Teste na Tarefa 10.
4. **Formulário enviado duas vezes, sem JS ou com falha no envio de e-mail**: botão desabilitado durante o envio; sem JS o Server Action funciona e mostra a mesma mensagem; falha do Resend devolve erro amigável e mantém os dados digitados. Testes na Tarefa 13.
5. **Obra despublicada ou com slug trocado no CMS**: a URL antiga dá 404 (nunca 500) e some do sitemap após o webhook. Testes nas Tarefas 4 e 15.

---

## Estrutura de arquivos

```
src/
  app/
    layout.tsx                    # html lang, fontes, Header, Footer, WhatsApp, CookieBanner, skip link
    page.tsx                      # Home
    empresa/page.tsx
    servicos/page.tsx
    servicos/[slug]/page.tsx
    obras/page.tsx
    obras/[slug]/page.tsx
    contato/page.tsx
    contato/comercial/page.tsx
    contato/comercial/actions.ts  # submitLead (Server Action)
    privacidade/page.tsx
    cookies/page.tsx
    studio/[[...tool]]/page.tsx   # Sanity Studio embutido
    api/revalidate/route.ts       # webhook do Sanity
    sitemap.ts  robots.ts  not-found.tsx
  styles/tokens.css               # @theme com todos os tokens
  components/
    ui/        Button, Container, SectionHeader, Eyebrow
    layout/    Header, MobileNav, Footer, SkipLink, WhatsAppButton
    consent/   CookieBanner, ConsentProvider, GtmLoader
    home/      Hero, StatCounter, SegmentCards, FeaturedProjects, LogoWall, CTABand
    projects/  ProjectCard, FilterBar, ProjectSpecs, Gallery, Lightbox, BeforeAfter
    company/   Timeline, ValuesGrid
    forms/     LeadForm, Field
    seo/       JsonLd
  lib/
    content/types.ts              # tipos de domínio
    content/source.ts             # ContentSource + getContentSource()
    content/fixtures/*.json       # conteúdo de exemplo
    content/fixtures-source.ts
    content/sanity-source.ts      # GROQ + mapeamento
    obras/filter.ts               # filterObras, parseObraFilters, serializeObraFilters
    leads/schema.ts  leads/routing.ts  leads/send.ts
    consent/consent.ts            # leitura/escrita do cookie dt_consent
    analytics/track.ts
    whatsapp.ts
    seo/metadata.ts  seo/jsonld.ts
    text/normalize.ts             # normalizeForSearch
sanity/
  schemas/ obra.ts servico.ts cliente.ts numero.ts configuracoes.ts paginaEmpresa.ts paginaLegal.ts index.ts
  sanity.config.ts
tests/
  unit/…  (Vitest, espelha src/)
  e2e/…   (Playwright)
```

---

### Tarefa 1: Scaffold do projeto e CI

**Arquivos:**
- Criar: `package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`, `playwright.config.ts`, `.github/workflows/ci.yml`, `.env.example`, `src/app/layout.tsx`, `src/app/page.tsx`
- Teste: `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Produz: scripts npm `dev`, `build`, `lint`, `typecheck`, `test` (Vitest), `test:e2e` (Playwright contra `next start` com `CONTENT_SOURCE=fixtures`).

- [ ] **Passo 1:** `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*"`; adicionar Vitest, Testing Library, jsdom, Playwright, `@axe-core/playwright`.
- [ ] **Passo 2: Escrever o teste que falha**

```ts
// tests/e2e/smoke.spec.ts
test('home responde e declara pt-BR', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
});
```

- [ ] **Passo 3:** `npm run test:e2e` → FALHA (`lang` é `en`).
- [ ] **Passo 4:** `lang="pt-BR"` em `layout.tsx`; `ci.yml` roda `lint`, `typecheck`, `test`, `build`, `test:e2e` em push e PR (Node 22).
- [ ] **Passo 5:** `npm run test:e2e` → PASSA; `npm run lint && npm run typecheck` sem erros.
- [ ] **Passo 6:** commit `chore: scaffold Next.js, Vitest, Playwright e CI`.

### Tarefa 2: Design tokens, fontes e primitivos de UI

**Arquivos:**
- Criar: `src/styles/tokens.css`, `src/lib/design/contrast.ts`, `src/components/ui/{Button,Container,SectionHeader,Eyebrow}.tsx`
- Modificar: `src/app/layout.tsx` (Syne + Raleway via `next/font/google`, `display: 'swap'`), `src/app/globals.css` (importa tokens)
- Teste: `tests/unit/design/contrast.test.ts`, `tests/unit/ui/Button.test.tsx`

**Interfaces:**
- Produz: classes Tailwind `bg-brand-primary`, `text-text-secondary`, `bg-surface-inverse` etc. (nome do token sem `color.`); `contrastRatio(fg: string, bg: string): number`; `<Button variant="primary"|"secondary"|"ghost" href?>`, `<Container>`, `<SectionHeader eyebrow? title lead? tone="light"|"dark">`.

- [ ] **Passo 1: Testes que falham**

```ts
// contrast.test.ts — lê os valores de src/styles/tokens.css
const t = readTokens(); // parse de --color-*: #hex
it.each([
  ['brand-primary', 'surface-default'],
  ['text-primary', 'surface-default'],
  ['text-secondary', 'surface-default'],
  ['text-secondary', 'surface-muted'],
  ['surface-default', 'surface-inverse'],
  ['error', 'surface-default'],
])('%s sobre %s ≥ 4.5:1', (fg, bg) => {
  expect(contrastRatio(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
});
it('contrastRatio de preto sobre branco é 21', () =>
  expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1));
```

```tsx
// Button.test.tsx
it('com href renderiza link', () => {
  render(<Button href="/obras">Ver obras</Button>);
  expect(screen.getByRole('link', { name: 'Ver obras' })).toHaveAttribute('href', '/obras');
});
```

- [ ] **Passo 2:** `npm test` → FALHA.
- [ ] **Passo 3:** `tokens.css` com `@theme` contendo cores, `--font-display`, `--font-sans`, escala tipográfica, espaços e raios dos Global Constraints, já com os hex da DT nos `brand-*`. `contrastRatio` pela fórmula de luminância relativa WCAG 2.x. Foco visível global: `outline: 2px solid var(--color-brand-secondary); outline-offset: 2px`.
- [ ] **Passo 4:** `npm test` → PASSA. Se um par da DT reprovar, escurecer o tom no token e registrar no commit.
- [ ] **Passo 5:** commit `feat: design tokens, fontes e primitivos`.

### Tarefa 3: Modelo de conteúdo e fonte de fixtures

**Arquivos:**
- Criar: `src/lib/content/types.ts`, `src/lib/content/source.ts`, `src/lib/content/fixtures-source.ts`, `src/lib/content/fixtures/{obras,servicos,clientes,numeros,configuracoes,paginaEmpresa,paginasLegais}.json`
- Teste: `tests/unit/content/fixtures-source.test.ts`

**Interfaces:**
- Produz (tipos em `types.ts`):

```ts
type Segmento = 'obras-civis' | 'infraestrutura';
type StatusObra = 'em-andamento' | 'concluida';
type UF = 'AC' | 'AL' | /* … 27 UFs */ 'TO';
interface Imagem { url: string; alt: string; width: number; height: number; lqip?: string }
interface Obra {
  slug: string; titulo: string; segmento: Segmento; servicos: string[] /* slugs */;
  cliente?: { nome: string; tipo: TipoCliente }; cidade: string; uf: UF;
  coordenadas?: { lat: number; lng: number }; inicio: string /* YYYY-MM */; termino?: string;
  status: StatusObra; extensao?: { valor: number; unidade: 'km' | 'm²' };
  diferencialTecnico?: string; descricao: string; capa: Imagem; galeria: Imagem[];
  antesDepois?: { antes: Imagem; depois: Imagem }; destaque: boolean;
  seo?: { titulo?: string; descricao?: string };
}
interface Servico { slug; titulo; segmento: Segmento; resumo; escopo: string[]; etapas: { titulo: string; descricao: string }[]; equipamentos: string[]; imagem: Imagem; seo? }
type TipoCliente = 'concessionaria' | 'publico' | 'privado';
interface Cliente { nome: string; logo: Imagem; tipo: TipoCliente; site?: string; ordem: number }
interface Numero { rotulo: string; valor: number; unidade?: string; fonte: string; dataReferencia: string }
interface Configuracoes { razaoSocial; cnpj; endereco: { logradouro; cidade; uf: UF; cep }; telefone; horario; whatsapp: string /* E.164 sem + */; emailsLead: Record<Segmento, string>; canalDenunciasUrl: string; emailCarreiras; emailFornecedores; emailImprensa; redes: { rede: 'linkedin'|'instagram'|'youtube'|'facebook'; url: string }[]; siglaValores?: string }
interface PaginaEmpresa { comoTrabalhamos: string; marcos: { ano: number; titulo: string; descricao: string; imagem?: Imagem }[]; missao; visao; valores: { titulo; descricao }[]; principios: string[] }
interface PaginaLegal { slug: 'privacidade' | 'cookies'; titulo; versao; vigencia: string; corpo: PortableTextBlock[] }
```

- Produz (`source.ts`):

```ts
interface ContentSource {
  getObras(): Promise<Obra[]>;               // ordenadas por inicio desc
  getObra(slug: string): Promise<Obra | null>;
  getObrasDestaque(): Promise<Obra[]>;       // destaque=true, máx. 6
  getObrasPorServico(servicoSlug: string): Promise<Obra[]>;
  getServicos(): Promise<Servico[]>;
  getServico(slug: string): Promise<Servico | null>;
  getClientes(): Promise<Cliente[]>;         // por ordem asc
  getNumeros(): Promise<Numero[]>;
  getConfiguracoes(): Promise<Configuracoes>;
  getPaginaEmpresa(): Promise<PaginaEmpresa>;
  getPaginaLegal(slug: PaginaLegal['slug']): Promise<PaginaLegal>;
}
function getContentSource(): ContentSource; // CONTENT_SOURCE = 'fixtures' | 'sanity' (padrão 'sanity' em produção)
```

- [ ] **Passo 1: Testes que falham** (contra `fixturesSource`)

```ts
it('getObrasDestaque devolve só destaques, no máximo 6', async () => {
  const d = await src.getObrasDestaque();
  expect(d.length).toBeGreaterThanOrEqual(3);
  expect(d.length).toBeLessThanOrEqual(6);
  expect(d.every(o => o.destaque)).toBe(true);
});
it('getObra de slug inexistente devolve null', async () =>
  expect(await src.getObra('nao-existe')).toBeNull());
it('getObrasPorServico filtra pelo slug do serviço', async () => {
  const r = await src.getObrasPorServico('restauracao');
  expect(r.every(o => o.servicos.includes('restauracao'))).toBe(true);
});
it('getObras ordena por início desc', async () => {
  const r = await src.getObras();
  expect(r.map(o => o.inicio)).toEqual([...r.map(o => o.inicio)].sort().reverse());
});
it('todo número tem fonte e data de referência', async () =>
  (await src.getNumeros()).forEach(n => { expect(n.fonte).toBeTruthy(); expect(n.dataReferencia).toMatch(/^\d{4}-\d{2}/); }));
```

- [ ] **Passo 2:** `npm test` → FALHA.
- [ ] **Passo 3:** fixtures com 8 obras (mín. 2 por segmento, 4 com `destaque`, a obra `pinhalzinho-sc` completa com galeria de 4 fotos e antes/depois, 1 obra sem `termino`/`antesDepois`/`coordenadas`/`galeria` para o Review Focus 1, nomes de cidade com acento), 4 serviços (`obras-civis`; `conservacao`, `restauracao`, `construcao-rodoviaria`), 9 clientes (3 por tipo), 5 números, imagens em `public/fixtures/` (placeholders com proporção real). Texto marcado "[exemplo]" para não ir ao ar por engano.
- [ ] **Passo 4:** `npm test` → PASSA.
- [ ] **Passo 5:** commit `feat: tipos de conteúdo e fonte de fixtures`.

### Tarefa 4: Sanity — schemas, Studio, fonte de produção e revalidação

**Arquivos:**
- Criar: `sanity/schemas/*.ts`, `sanity/sanity.config.ts`, `src/app/studio/[[...tool]]/page.tsx`, `src/lib/content/sanity-source.ts`, `src/app/api/revalidate/route.ts`
- Teste: `tests/unit/content/sanity-source.test.ts`, `tests/unit/api/revalidate.test.ts`, `tests/unit/sanity/schemas.test.ts`

**Interfaces:**
- Consome: `ContentSource` e tipos da Tarefa 3.
- Produz: `sanitySource: ContentSource`; tags de cache `obra`, `servico`, `cliente`, `numero`, `configuracoes`, `paginaEmpresa`, `paginaLegal` (uma por `_type`); `POST /api/revalidate` com assinatura `SANITY_REVALIDATE_SECRET` (`parseBody` de `next-sanity/webhook`).

- [ ] **Passo 1: Testes que falham**

```ts
// sanity-source.test.ts — client.fetch mockado devolvendo documentos crus
it('mapeia documento obra para Obra', async () => {
  fetchMock.mockResolvedValue([rawObra]); // fixture crua com asset refs
  const [o] = await sanitySource.getObras();
  expect(o.capa.url).toMatch(/^https:\/\/cdn\.sanity\.io\//);
  expect(o.capa.alt).toBe(rawObra.capa.alt);
  expect(o.servicos).toEqual(['restauracao']);
});
it('getObra exclui rascunhos e devolve null quando não acha', async () => {
  fetchMock.mockResolvedValue(null);
  expect(await sanitySource.getObra('x')).toBeNull();
  expect(fetchMock.mock.calls[0][0]).toContain('!(_id in path("drafts.**"))');
});
// revalidate.test.ts
it('assinatura inválida → 401 e nada revalidado', …expect(res.status).toBe(401); expect(revalidateTag).not.toHaveBeenCalled());
it('assinatura válida revalida a tag do _type', …expect(revalidateTag).toHaveBeenCalledWith('obra'));
// schemas.test.ts
it('numero exige fonte e dataReferencia', () => expect(requiredFields(numero)).toEqual(expect.arrayContaining(['fonte','dataReferencia'])));
it('imagens exigem alt', () => expect(requiredFields(obra, 'capa')).toContain('alt'));
```

- [ ] **Passo 2:** `npm test` → FALHA.
- [ ] **Passo 3:** schemas espelhando os tipos da Tarefa 3 (`configuracoes`, `paginaEmpresa` e cada `paginaLegal` como singletons). Validações: `slug` obrigatório e único, `alt` obrigatório em toda imagem, `termino ≥ inicio`, `numero.fonte` e `numero.dataReferencia` obrigatórios, `destaque` com aviso se > 6. GROQ em `sanity-source.ts` com `fetch(query, params, { next: { tags: [<_type>] } })`, URLs via `@sanity/image-url` com `auto('format')`. Studio com `basePath: '/studio'`, rota excluída do sitemap e com `noindex`.
- [ ] **Passo 4:** `npm test` → PASSA.
- [ ] **Passo 5:** com o projeto Sanity da DT: `npx sanity dataset import` das fixtures convertidas (`scripts/seed-sanity.ts`), abrir `/studio`, editar uma obra, conferir que o webhook revalida em até 1 min.
- [ ] **Passo 6:** commit `feat: Sanity schemas, Studio e revalidação por webhook`.

### Tarefa 5: Layout global — header, drawer mobile, rodapé, skip link

**Arquivos:**
- Criar: `src/components/layout/{Header,MobileNav,Footer,SkipLink}.tsx`, `src/lib/nav.ts`
- Modificar: `src/app/layout.tsx`
- Teste: `tests/e2e/layout.spec.ts`, `tests/unit/nav.test.ts`

**Interfaces:**
- Consome: `getConfiguracoes()`.
- Produz: `NAV_ITEMS: { label: string; href: string }[]` = Empresa `/empresa`, Serviços `/servicos`, Obras `/obras`, Contato `/contato` (Carreiras entra na Fase 2); `<main id="conteudo">` em todas as páginas.

- [ ] **Passo 1: Testes que falham**

```ts
// nav.test.ts
it('menu tem no máximo 6 itens e nenhum "Mais"', () => {
  expect(NAV_ITEMS.length).toBeLessThanOrEqual(6);
  expect(NAV_ITEMS.map(i => i.label)).not.toContain('Mais');
});
// layout.spec.ts
test('1280 px: itens e CTA visíveis sem drawer', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 }); await page.goto('/');
  for (const l of ['Empresa','Serviços','Obras','Contato']) await expect(page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: l })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Fale com a equipe' })).toHaveAttribute('href', '/contato/comercial');
});
test('360 px: drawer abre por teclado, prende o foco, fecha com Esc e devolve o foco', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 }); await page.goto('/');
  const btn = page.getByRole('button', { name: 'Abrir menu' });
  await btn.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible();
  for (let i = 0; i < 10; i++) await page.keyboard.press('Tab');
  await expect(page.getByRole('dialog').locator(':focus')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(btn).toBeFocused();
});
test('skip link leva ao conteúdo', async ({ page }) => {
  await page.goto('/'); await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
});
test('rodapé mostra razão social, CNPJ e links legais', async ({ page }) => { /* getByText(cnpj fixture); links /privacidade e /cookies */ });
```

- [ ] **Passo 2:** `npm run test:e2e -- layout` → FALHA.
- [ ] **Passo 3:** Header fixo (`sticky`, fundo branco, sombra só ao rolar), `MobileNav` com Radix Dialog abaixo de 1024 px. Footer em `surface-inverse` com razão social, CNPJ, endereço, telefone, redes, Privacidade, Cookies, Canal de denúncias (link externo de `canalDenunciasUrl`, abre em nova aba com "(abre em nova aba)" no nome acessível) e sigla de valores.
- [ ] **Passo 4:** testes → PASSAM.
- [ ] **Passo 5:** commit `feat: header, drawer mobile, rodapé e skip link`.

### Tarefa 6: Consentimento LGPD, analytics e páginas legais

**Arquivos:**
- Criar: `src/lib/consent/consent.ts`, `src/components/consent/{ConsentProvider,CookieBanner,GtmLoader}.tsx`, `src/lib/analytics/track.ts`, `src/app/privacidade/page.tsx`, `src/app/cookies/page.tsx`
- Teste: `tests/unit/consent/consent.test.ts`, `tests/unit/analytics/track.test.ts`, `tests/e2e/consent.spec.ts`

**Interfaces:**
- Produz:

```ts
type ConsentCategory = 'essenciais' | 'desempenho' | 'marketing';
interface ConsentState { version: 1; decidedAt: string /* ISO */; desempenho: boolean; marketing: boolean } // essenciais sempre true
const CONSENT_COOKIE = 'dt_consent'; // 180 dias, SameSite=Lax, Secure
function parseConsent(raw: string | undefined): ConsentState | null; // inválido/versão antiga → null
function serializeConsent(s: Omit<ConsentState,'version'|'decidedAt'>, now?: Date): string;
function useConsent(): { state: ConsentState | null; save(s): void; openPreferences(): void };
type AnalyticsEvent = 'lead_submit' | 'cta_click' | 'whatsapp_click' | 'project_view' | 'filter_use';
function track(event: AnalyticsEvent, params?: Record<string, string | number>): void; // no-op sem desempenho
```

- [ ] **Passo 1: Testes que falham**

```ts
it('parseConsent rejeita JSON inválido e versão desconhecida', () => {
  expect(parseConsent('{')).toBeNull();
  expect(parseConsent(JSON.stringify({ version: 0 }))).toBeNull();
});
it('track não empurra nada sem consentimento de desempenho', () => {
  setConsent(null); track('cta_click'); expect(window.dataLayer ?? []).toHaveLength(0);
});
it('track empurra evento com consentimento', () => {
  setConsent({ desempenho: true }); track('cta_click', { local: 'hero' });
  expect(window.dataLayer.at(-1)).toEqual({ event: 'cta_click', local: 'hero' });
});
```

```ts
// consent.spec.ts
test('nenhuma requisição ao GTM antes do aceite', async ({ page }) => {
  const hits: string[] = []; page.on('request', r => r.url().includes('googletagmanager.com') && hits.push(r.url()));
  await page.goto('/'); await expect(page.getByRole('region', { name: 'Cookies' })).toBeVisible();
  expect(hits).toHaveLength(0);
  await page.getByRole('button', { name: 'Recusar opcionais' }).click(); await page.reload();
  expect(hits).toHaveLength(0);
});
test('aceitar desempenho carrega o GTM e o banner some', async ({ page }) => { /* clicar "Aceitar todos" → hits.length > 0; banner oculto após reload */ });
test('preferências: categorias desmarcadas por padrão, essenciais travadas', async ({ page }) => { /* checkbox Desempenho not.toBeChecked; Essenciais disabled+checked */ });
test('rodapé reabre preferências', …);
```

- [ ] **Passo 2:** testes → FALHAM.
- [ ] **Passo 3:** banner não modal no rodapé da tela (não bloqueia leitura), botões "Aceitar todos", "Recusar opcionais", "Preferências" (mesmo peso visual para aceitar e recusar). `GtmLoader` injeta o script com `next/script` só quando `state.desempenho`; Consent Mode v2 com `ad_storage`/`analytics_storage` `denied` por padrão. Link "Preferências de cookies" no rodapé. Páginas `/privacidade` e `/cookies` renderizam `getPaginaLegal` com versão e vigência no topo.
- [ ] **Passo 4:** testes → PASSAM.
- [ ] **Passo 5:** commit `feat: consentimento LGPD, GTM condicionado e páginas legais`.

### Tarefa 7: Botão flutuante de WhatsApp

**Arquivos:**
- Criar: `src/lib/whatsapp.ts`, `src/components/layout/WhatsAppButton.tsx`
- Modificar: `src/app/layout.tsx`
- Teste: `tests/unit/whatsapp.test.ts`, `tests/e2e/whatsapp.spec.ts`

**Interfaces:**
- Consome: `getConfiguracoes().whatsapp`, `track`.
- Produz: `buildWhatsAppUrl(phone: string, pathname: string, pageTitle?: string): string`.

- [ ] **Passo 1: Testes que falham**

```ts
it('monta wa.me com mensagem da página de obra', () => {
  const u = new URL(buildWhatsAppUrl('5565999990000', '/obras/pinhalzinho-sc', 'Pinhalzinho (SC)'));
  expect(u.origin + u.pathname).toBe('https://wa.me/5565999990000');
  expect(u.searchParams.get('text')).toBe('Olá! Vi a obra Pinhalzinho (SC) no site da DT e quero falar com o comercial.');
});
it('mensagem padrão nas demais páginas', () =>
  expect(new URL(buildWhatsAppUrl('5565999990000', '/empresa')).searchParams.get('text'))
    .toBe('Olá! Vim pelo site da DT e quero falar com o comercial.'));
it('serviço usa o nome do serviço', …'Olá! Vi o serviço Restauração no site da DT e quero falar com o comercial.');
```

- [ ] **Passo 2:** FALHA. **Passo 3:** implementar; botão 56 px, canto inferior direito, nome acessível "Falar no WhatsApp (abre em nova aba)", `track('whatsapp_click', { pagina: pathname })`, sobe acima do banner de cookies quando ele está aberto (sem sobrepor). **Passo 4:** PASSA (inclui e2e: botão visível em 360 px sem cobrir o botão do banner).
- [ ] **Passo 5:** commit `feat: botão de WhatsApp com mensagem por página`.

### Tarefa 8: Home

**Arquivos:**
- Criar: `src/components/home/{Hero,StatCounter,SegmentCards,FeaturedProjects,LogoWall,CTABand}.tsx`, `src/components/projects/ProjectCard.tsx`, `src/lib/format.ts`
- Modificar: `src/app/page.tsx`
- Teste: `tests/unit/home/StatCounter.test.tsx`, `tests/unit/home/LogoWall.test.tsx`, `tests/unit/format.test.ts`, `tests/e2e/home.spec.ts`

**Interfaces:**
- Consome: `getObrasDestaque`, `getServicos`, `getClientes`, `getNumeros`, `track`, `Button`, `SectionHeader`.
- Produz: `<ProjectCard obra variant="padrao"|"horizontal">` (reusado nas Tarefas 9–10); `formatNumber(n: number): string` (`142000` → `"142.000"`); `formatPeriodo(inicio: string, termino?: string): string` (`"2024-05","2029-05"` → `"mai/2024 a mai/2029"`; sem término → `"desde mai/2024"`).

- [ ] **Passo 1: Testes que falham**

```tsx
it('StatCounter com reduced motion mostra o valor final na hora', () => {
  mockMatchMedia({ '(prefers-reduced-motion: reduce)': true });
  render(<StatCounter numeros={[{ rotulo: 'km executados', valor: 1420, fonte: 'x', dataReferencia: '2026-06' }]} />);
  expect(screen.getByText('1.420')).toBeInTheDocument();
});
it('StatCounter expõe o valor final a leitores de tela durante a animação', () => {
  render(<StatCounter numeros={[n]} />);
  expect(screen.getByText('1.420 km executados', { selector: '.sr-only' })).toBeInTheDocument();
});
it('LogoWall agrupa por tipo e usa o nome como alt', () => {
  render(<LogoWall clientes={fixtures.clientes} />);
  expect(screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent)).toEqual(['Concessionárias','Órgãos públicos','Clientes privados']);
  expect(screen.getByAltText('Nome do Cliente A')).toBeInTheDocument();
});
it('formatPeriodo', () => {
  expect(formatPeriodo('2024-05', '2029-05')).toBe('mai/2024 a mai/2029');
  expect(formatPeriodo('2024-05')).toBe('desde mai/2024');
});
```

```ts
// home.spec.ts
test('hero tem H1, 2 CTAs e imagem priorizada', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Fale com a equipe' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver obras' })).toHaveAttribute('href', '/obras');
  await expect(page.locator('img[fetchpriority="high"]')).toHaveCount(1);
});
test('seções na ordem do PRD', …/* números → segmentos → obras em destaque (3–6 cards) → clientes → CTA final */);
test('clique no CTA do hero gera cta_click (com consentimento)', …);
```

- [ ] **Passo 2:** FALHAM.
- [ ] **Passo 3:** Hero em `surface-inverse` com `next/image` `priority`, slogan (H1 em Syne), subtítulo, CTAs "Fale com a equipe" (`primary`) e "Ver obras" (`secondary`). StatCounter: anima com `IntersectionObserver` + `requestAnimationFrame` em 1,2 s, uma vez; valor visual `aria-hidden`, texto final em `.sr-only`. SegmentCards: 2 cards (Obras Civis, Infraestrutura) listando serviços do segmento, cada serviço linka `/servicos/[slug]`. LogoWall: grade em escala de cinza, cor no hover e no foco. CTABand navy com "Solicitar proposta" → `/contato/comercial`. Entrada de seção com classe `reveal` respeitando reduced motion (CSS `@media`).
- [ ] **Passo 4:** PASSAM.
- [ ] **Passo 5:** commit `feat: home`.

### Tarefa 9: Serviços (índice e página de serviço)

**Arquivos:**
- Criar: `src/app/servicos/page.tsx`, `src/app/servicos/[slug]/page.tsx`, `src/lib/links.ts`
- Teste: `tests/unit/links.test.ts`, `tests/e2e/servicos.spec.ts`

**Interfaces:**
- Consome: `getServicos`, `getServico`, `getObrasPorServico`, `ProjectCard`.
- Produz: `leadHref(segmento: Segmento, origem?: string): string` → `/contato/comercial?segmento=infraestrutura&origem=restauracao` (usado nas Tarefas 11 e 13).

- [ ] **Passo 1: Testes que falham**

```ts
it('leadHref', () => expect(leadHref('infraestrutura', 'restauracao')).toBe('/contato/comercial?segmento=infraestrutura&origem=restauracao'));
// servicos.spec.ts
test('página de serviço tem escopo, etapas, equipamentos, obras relacionadas e CTA com segmento', async ({ page }) => {
  await page.goto('/servicos/restauracao');
  for (const h of ['Escopo','Etapas','Equipamentos','Obras relacionadas']) await expect(page.getByRole('heading', { name: h })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Solicitar proposta' }).last()).toHaveAttribute('href', /segmento=infraestrutura/);
});
test('serviço inexistente → 404', async ({ page }) => expect((await page.goto('/servicos/nao-existe'))?.status()).toBe(404));
test('índice agrupa por segmento', …);
```

- [ ] **Passo 2:** FALHA. **Passo 3:** `generateStaticParams` a partir de `getServicos`; `notFound()` para slug ausente; etapas como lista numerada; "Obras relacionadas" omitida se vazia. **Passo 4:** PASSA.
- [ ] **Passo 5:** commit `feat: páginas de serviço`.

### Tarefa 10: Obras — listagem com filtros e busca

**Arquivos:**
- Criar: `src/lib/text/normalize.ts`, `src/lib/obras/filter.ts`, `src/components/projects/FilterBar.tsx`, `src/app/obras/page.tsx`, `src/app/obras/ObrasExplorer.tsx` (client)
- Teste: `tests/unit/obras/filter.test.ts`, `tests/e2e/obras.spec.ts`

**Interfaces:**
- Consome: `getObras`, `ProjectCard`, `track`.
- Produz:

```ts
interface ObraFilters { segmento?: Segmento; uf?: UF; status?: StatusObra; cliente?: string; q?: string }
function normalizeForSearch(s: string): string;               // minúsculas, sem acento, espaços colapsados
function parseObraFilters(sp: URLSearchParams): ObraFilters;  // descarta valores fora dos enums e vazios
function serializeObraFilters(f: ObraFilters): string;        // ordem estável: segmento, uf, status, cliente, q
function filterObras(obras: Obra[], f: ObraFilters): Obra[];  // q casa titulo, cidade, uf, cliente.nome, nomes de serviço
```

- [ ] **Passo 1: Testes que falham**

```ts
it('busca ignora acento e caixa', () => {
  expect(filterObras(obras, { q: 'sao paulo' }).map(o => o.slug)).toContain('obra-em-sao-paulo');
  expect(filterObras(obras, { q: 'PINHALZINHO' })).toHaveLength(1);
});
it('combina filtros com E', () =>
  expect(filterObras(obras, { segmento: 'infraestrutura', uf: 'SC', status: 'em-andamento' }).every(o => o.uf === 'SC' && o.status === 'em-andamento')).toBe(true));
it('parse descarta valores inválidos', () =>
  expect(parseObraFilters(new URLSearchParams('uf=XX&status=foo&segmento=&q=%20'))).toEqual({}));
it('serialize é estável e omite vazios', () =>
  expect(serializeObraFilters({ q: 'br-282', segmento: 'infraestrutura' })).toBe('segmento=infraestrutura&q=br-282'));
it('round-trip parse(serialize(f)) === f', …);
```

```ts
// obras.spec.ts
test('filtrar atualiza a URL sem recarregar', async ({ page }) => {
  await page.goto('/obras'); await page.evaluate(() => ((window as any).__marker = 1));
  await page.getByLabel('Segmento').selectOption('infraestrutura');
  await expect(page).toHaveURL(/segmento=infraestrutura/);
  expect(await page.evaluate(() => (window as any).__marker)).toBe(1);
  await expect(page.getByRole('status')).toHaveText(/\d+ obras?/);
});
test('URL com filtros restaura o estado', …/* goto ?uf=SC → select UF mostra SC, só obras SC */);
test('URL inválida mostra todas as obras', …/* ?uf=XX → contagem = total */);
test('sem resultado mostra a mensagem do PRD', async ({ page }) => {
  await page.goto('/obras?q=zzzz');
  await expect(page.getByText('Nenhuma obra com esses filtros. Limpe um filtro para ver mais.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Limpar filtros' })).toBeVisible();
});
```

- [ ] **Passo 2:** FALHAM.
- [ ] **Passo 3:** `page.tsx` (server) busca todas as obras e passa para `ObrasExplorer` (client), que lê `useSearchParams`, filtra em memória e escreve com `router.replace('?'+…, { scroll: false })`. Busca com debounce de 250 ms. Contagem em `role="status"` (`aria-live="polite"`). Opções de UF e cliente derivadas das obras existentes. `track('filter_use', { filtro, valor })` a cada mudança. Grade de 1/2/3 colunas (360/768/1280). Sem JS, o formulário de filtros faz GET e o servidor filtra com as mesmas funções (`searchParams` na page).
- [ ] **Passo 4:** PASSAM.
- [ ] **Passo 5:** commit `feat: listagem de obras com filtros na URL`.

### Tarefa 11: Ficha de obra

**Arquivos:**
- Criar: `src/app/obras/[slug]/page.tsx`, `src/components/projects/{ProjectSpecs,Gallery,Lightbox,BeforeAfter}.tsx`, `src/components/seo/JsonLd.tsx`, `src/lib/seo/jsonld.ts`
- Teste: `tests/unit/projects/ProjectSpecs.test.tsx`, `tests/unit/seo/jsonld.test.ts`, `tests/e2e/obra.spec.ts`

**Interfaces:**
- Consome: `getObra`, `getObras` (static params), `leadHref`, `formatPeriodo`, `formatNumber`, `track`.
- Produz: `obraJsonLd(obra: Obra, siteUrl: string): object` (`@type: ['CreativeWork']`, `locationCreated: { @type: 'Place', address }`, `image`, `dateCreated`); `breadcrumbJsonLd(items: { name: string; url: string }[]): object` (reusado na Tarefa 15).

- [ ] **Passo 1: Testes que falham**

```tsx
it('ProjectSpecs omite linhas sem dado', () => {
  render(<ProjectSpecs obra={obraMinima} />); // sem termino, extensao, cliente
  expect(screen.queryByText(/Extensão/)).toBeNull();
  expect(screen.queryByText(/undefined|null/)).toBeNull();
  expect(screen.getByText('desde mai/2024')).toBeInTheDocument();
});
it('obraJsonLd tem tipo, lugar e imagem', () => {
  const j = obraJsonLd(obraCompleta, 'https://dtconstrutora.com.br');
  expect(j).toMatchObject({ '@context': 'https://schema.org', '@type': 'CreativeWork', name: obraCompleta.titulo,
    locationCreated: { '@type': 'Place', address: { addressLocality: 'Pinhalzinho', addressRegion: 'SC' } } });
});
```

```ts
// obra.spec.ts
test('lightbox: abre por teclado, setas navegam, Esc fecha e devolve o foco', async ({ page }) => {
  await page.goto('/obras/pinhalzinho-sc');
  const thumb = page.getByRole('button', { name: /Ampliar foto 1/ });
  await thumb.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toContainText('1 de');
  await page.keyboard.press('ArrowRight'); await expect(page.getByRole('dialog')).toContainText('2 de');
  await page.keyboard.press('Escape'); await expect(thumb).toBeFocused();
});
test('obra sem galeria nem antes/depois não mostra essas seções', …/* slug da obra mínima */);
test('CTA final usa a microcopy e o segmento da obra', async ({ page }) => {
  await page.goto('/obras/pinhalzinho-sc');
  await expect(page.getByText('Tem uma obra parecida? Fale com nosso time de Infraestrutura.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Solicitar proposta' }).last()).toHaveAttribute('href', /segmento=infraestrutura&origem=pinhalzinho-sc/);
});
test('JSON-LD válido na página', …/* parse do script application/ld+json */);
test('obra inexistente → 404', …);
```

- [ ] **Passo 2:** FALHAM.
- [ ] **Passo 3:** Hero compacto com capa; `ProjectSpecs` como `<dl>` (local, cliente, período, extensão/área, serviços com link, status); diferencial técnico em destaque; `Gallery` em grade com botões "Ampliar foto N: <alt>"; `Lightbox` com Radix Dialog, legenda = alt, contador "N de M"; `BeforeAfter` lado a lado (sem slider arrastável nesta fase). Microcopy do CTA: "Obras Civis" ou "Infraestrutura" conforme segmento. `track('project_view', { obra: slug })` uma vez por carregamento. `generateMetadata` com título, descrição e OG image = capa.
- [ ] **Passo 4:** PASSAM.
- [ ] **Passo 5:** commit `feat: ficha de obra com galeria acessível e JSON-LD`.

### Tarefa 12: Empresa

**Arquivos:**
- Criar: `src/app/empresa/page.tsx`, `src/components/company/{Timeline,ValuesGrid}.tsx`
- Teste: `tests/e2e/empresa.spec.ts`

**Interfaces:**
- Consome: `getPaginaEmpresa`, `getConfiguracoes().siglaValores`, `SectionHeader`.

- [ ] **Passo 1: Testes que falham**

```ts
test('seções da página Empresa', async ({ page }) => {
  await page.goto('/empresa');
  for (const h of ['Nossa história','Como trabalhamos','Missão','Visão','Valores','Princípios']) await expect(page.getByRole('heading', { name: h })).toBeVisible();
});
test('timeline navegável por teclado', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 }); await page.goto('/empresa');
  const tabs = page.getByRole('tablist', { name: 'Linha do tempo' }).getByRole('tab');
  await tabs.first().focus(); await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toBeFocused(); await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End'); await expect(tabs.last()).toBeFocused();
});
test('mobile: timeline vira lista vertical com todos os marcos visíveis', …);
```

- [ ] **Passo 2:** FALHA. **Passo 3:** desktop: Timeline como tablist horizontal (padrão ARIA Tabs: setas, Home, End, roving tabindex) com painel do marco; mobile (< 768 px): `<ol>` vertical com todos os marcos. Princípios em lista com ícone de check (`aria-hidden`). **Passo 4:** PASSA.
- [ ] **Passo 5:** commit `feat: página Empresa com timeline acessível`.

### Tarefa 13: Contato e formulário comercial

**Arquivos:**
- Criar: `src/lib/leads/{schema,routing,send}.ts`, `src/app/contato/page.tsx`, `src/app/contato/comercial/{page,actions}.ts(x)`, `src/components/forms/{LeadForm,Field}.tsx`
- Teste: `tests/unit/leads/schema.test.ts`, `tests/unit/leads/routing.test.ts`, `tests/unit/leads/actions.test.ts`, `tests/e2e/contato.spec.ts`

**Interfaces:**
- Consome: `getConfiguracoes`, `track`, `leadHref` (lê `segmento` e `origem` da query).
- Produz:

```ts
const leadSchema: z.ZodObject<…>; // nome, empresa, cargo?, email, telefone, segmento: Segmento, tipoObra, local, mensagem, consentimento: literal(true), origem?
type Lead = z.infer<typeof leadSchema>;
function resolveLeadRecipient(segmento: Segmento, cfg: Configuracoes): string;
type LeadFormState = { status: 'idle' } | { status: 'error'; fieldErrors: Partial<Record<keyof Lead, string>>; values: Partial<Lead>; message?: string } | { status: 'success' };
async function submitLead(prev: LeadFormState, formData: FormData): Promise<LeadFormState>;
async function sendLeadEmail(lead: Lead, to: string): Promise<void>; // Resend; lança em falha
```

- [ ] **Passo 1: Testes que falham**

```ts
it('e-mail inválido usa a microcopy do PRD', () => {
  const r = leadSchema.safeParse({ ...valido, email: 'joao' });
  expect(r.error!.flatten().fieldErrors.email![0]).toBe('Confira o e-mail. Ele precisa ter @ e um domínio, como nome@empresa.com.br.');
});
it('consentimento é obrigatório', () => expect(leadSchema.safeParse({ ...valido, consentimento: false }).success).toBe(false));
it('roteia por segmento', () => {
  expect(resolveLeadRecipient('infraestrutura', cfg)).toBe(cfg.emailsLead.infraestrutura);
  expect(resolveLeadRecipient('obras-civis', cfg)).toBe(cfg.emailsLead['obras-civis']);
});
// actions.test.ts (sendLeadEmail e verifyTurnstile mockados)
it('honeypot preenchido → sucesso aparente, nenhum e-mail', async () => {
  expect((await submitLead(idle, fd({ ...valido, website: 'spam' }))).status).toBe('success');
  expect(sendLeadEmail).not.toHaveBeenCalled();
});
it('Turnstile inválido → erro genérico, sem e-mail', …);
it('falha do Resend → erro amigável e valores preservados', async () => {
  sendLeadEmail.mockRejectedValue(new Error('500'));
  const s = await submitLead(idle, fd(valido));
  expect(s).toMatchObject({ status: 'error', values: { nome: valido.nome }, message: 'Não conseguimos enviar agora. Tente de novo em alguns minutos ou fale pelo WhatsApp.' });
});
it('lead válido envia para o destinatário do segmento', …expect(sendLeadEmail).toHaveBeenCalledWith(expect.objectContaining({ segmento: 'infraestrutura' }), cfg.emailsLead.infraestrutura));
```

```ts
// contato.spec.ts
test('segmento vem preenchido pela URL', async ({ page }) => {
  await page.goto('/contato/comercial?segmento=infraestrutura&origem=restauracao');
  await expect(page.getByLabel('Segmento')).toHaveValue('infraestrutura');
});
test('erros aparecem ligados aos campos e o foco vai para o primeiro', async ({ page }) => {
  await page.goto('/contato/comercial'); await page.getByRole('button', { name: 'Solicitar proposta' }).click();
  await expect(page.getByLabel('Nome')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel('Nome')).toBeFocused();
});
test('envio válido mostra a mensagem de sucesso', async ({ page }) => {
  /* RESEND_API_KEY ausente em teste → send.ts usa transporte "log"; Turnstile com chave de teste da Cloudflare */
  await expect(page.getByText('Recebemos sua mensagem. Nossa equipe responde em até 2 dias úteis.')).toBeVisible();
});
test('botão desabilitado durante o envio', …);
test('funciona sem JavaScript', async ({ browser }) => { const ctx = await browser.newContext({ javaScriptEnabled: false }); /* mesmo fluxo → texto de sucesso */ });
test('consentimento não vem marcado', …);
test('/contato tem sede e cartões por intenção', async ({ page }) => {
  await page.goto('/contato');
  for (const c of ['Comercial','Carreiras','Fornecedores','Denúncias','Imprensa']) await expect(page.getByRole('heading', { name: c })).toBeVisible();
});
```

- [ ] **Passo 2:** FALHAM.
- [ ] **Passo 3:** `LeadForm` com `useActionState`; campos com `<label>`, `aria-describedby` para erro, `autocomplete` (`name`, `organization`, `organization-title`, `email`, `tel`); honeypot `website` oculto (`aria-hidden`, `tabindex=-1`); Turnstile invisível verificado no servidor (`TURNSTILE_SECRET_KEY`); texto do consentimento com link para `/privacidade`. `send.ts`: Resend com `reply_to` = e-mail do lead, assunto `[Site] Lead <segmento> — <empresa>`; transporte `log` quando `RESEND_API_KEY` não existe. `track('lead_submit', { segmento })` no sucesso. `/contato`: sede com endereço, telefone, horário e link "Abrir no mapa" (sem iframe de terceiros); cartões: Comercial → `/contato/comercial`; Carreiras, Fornecedores, Imprensa → `mailto:` das configurações; Denúncias → `canalDenunciasUrl` com a microcopy "Fale sem medo. O canal é externo, funciona 24 horas e aceita denúncias anônimas."
- [ ] **Passo 4:** PASSAM.
- [ ] **Passo 5:** commit `feat: contato e formulário comercial com roteamento por segmento`.

### Tarefa 14: Página 404 e estados de erro

**Arquivos:**
- Criar: `src/app/not-found.tsx`, `src/app/error.tsx`
- Teste: `tests/e2e/errors.spec.ts`

- [ ] **Passo 1:** teste: `/qualquer-coisa` → 404 com H1 "Página não encontrada", links para Home e Obras, `<meta name="robots" content="noindex">`.
- [ ] **Passo 2:** FALHA. **Passo 3:** implementar. **Passo 4:** PASSA. **Passo 5:** commit `feat: páginas de erro`.

### Tarefa 15: SEO técnico e redirecionamentos

**Arquivos:**
- Criar: `src/lib/seo/metadata.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/lib/redirects.ts`
- Modificar: `next.config.ts` (redirects, headers de segurança), `src/app/layout.tsx` (JSON-LD Organization), `src/app/contato/page.tsx` (LocalBusiness), páginas com breadcrumb
- Teste: `tests/unit/seo/sitemap.test.ts`, `tests/unit/seo/metadata.test.ts`, `tests/unit/redirects.test.ts`, `tests/e2e/seo.spec.ts`

**Interfaces:**
- Consome: `ContentSource`, `breadcrumbJsonLd` (Tarefa 11).
- Produz: `buildMetadata({ title, description, path, image? }): Metadata` (título `"<title> | DT Construtora"`, canonical, OG); `LEGACY_REDIRECTS: { source: string; destination: string; permanent: true }[]`.

- [ ] **Passo 1: Testes que falham**

```ts
it('sitemap lista páginas fixas, todos os serviços e todas as obras publicadas, sem /studio', async () => {
  const urls = (await sitemap()).map(e => e.url);
  expect(urls).toEqual(expect.arrayContaining([`${SITE}/`, `${SITE}/obras`, `${SITE}/obras/pinhalzinho-sc`, `${SITE}/servicos/restauracao`]));
  expect(urls.some(u => u.includes('/studio'))).toBe(false);
});
it('redirects: todo destino existe e nenhum source repete', …);
// seo.spec.ts
test('títulos e descriptions únicos nas páginas da Fase 1', async ({ page }) => { /* coleta <title> e meta description de 8 URLs; Set.size === 8 */ });
test('robots.txt bloqueia /studio e aponta o sitemap', …);
test('headers de segurança', async ({ request }) => {
  const h = (await request.get('/')).headers();
  expect(h['strict-transport-security']).toContain('max-age=');
  expect(h['content-security-policy']).toContain("default-src 'self'");
  expect(h['x-content-type-options']).toBe('nosniff');
});
```

- [ ] **Passo 2:** FALHAM.
- [ ] **Passo 3:** CSP permitindo `self`, `cdn.sanity.io` (img), `challenges.cloudflare.com` (script/frame), `www.googletagmanager.com` e `*.google-analytics.com` (script/connect); `LEGACY_REDIRECTS` preenchido com a lista de URLs da DT (vazio se não houver site antigo). `lastModified` das obras vem de `_updatedAt`.
- [ ] **Passo 4:** PASSAM.
- [ ] **Passo 5:** commit `feat: SEO técnico, headers de segurança e redirecionamentos`.

### Tarefa 16: Gate de qualidade, observabilidade e deploy

**Arquivos:**
- Criar: `lighthouserc.json`, `tests/e2e/a11y.spec.ts`, `sentry.*.config.ts`, `docs/operacao.md`
- Modificar: `.github/workflows/ci.yml`, `src/app/layout.tsx` (`@vercel/analytics`, `@vercel/speed-insights`)

- [ ] **Passo 1: Teste que falha**

```ts
// a11y.spec.ts
for (const path of ['/', '/empresa', '/servicos', '/servicos/restauracao', '/obras', '/obras/pinhalzinho-sc', '/contato', '/contato/comercial', '/privacidade']) {
  test(`axe sem violações graves em ${path}`, async ({ page }) => {
    await page.goto(path);
    const r = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(r.violations.filter(v => ['critical','serious'].includes(v.impact!))).toEqual([]);
  });
}
```

- [ ] **Passo 2:** `npm run test:e2e -- a11y` → corrigir o que falhar até PASSAR.
- [ ] **Passo 3:** `lighthouserc.json` com as 5 páginas principais, preset mobile, `assert`: `categories:performance`, `categories:seo`, `categories:accessibility` `minScore: 0.9`, `largest-contentful-paint` `maxNumericValue: 2500`, `cumulative-layout-shift` `maxNumericValue: 0.1`. Job `lighthouse` no CI bloqueia merge.
- [ ] **Passo 4:** Vercel: projeto ligado ao repositório, variáveis (`CONTENT_SOURCE=sanity`, `SANITY_*`, `RESEND_API_KEY`, `TURNSTILE_*`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_SITE_URL`, `SENTRY_DSN`), webhook do Sanity apontando para `/api/revalidate`. Sentry captura erros de servidor e cliente (sem PII: `sendDefaultPii: false`).
- [ ] **Passo 5:** verificação no preview da Vercel: CI verde (lint, typecheck, unit, e2e, a11y, Lighthouse); enviar um lead real de cada segmento e confirmar chegada no e-mail certo; publicar uma obra no Studio e vê-la no site em até 1 min.
- [ ] **Passo 6:** `docs/operacao.md` (como publicar obra, trocar números, onde chegam os leads, como reverter deploy). Commit `chore: gate de qualidade, observabilidade e deploy`.

---

## Critério de pronto da Fase 1

- Todas as tarefas com testes verdes no CI e no preview.
- Lighthouse ≥ 90 (Performance, SEO, Acessibilidade) nas 5 páginas principais; zero violações axe graves.
- Lead de cada segmento chega ao e-mail configurado.
- Nenhuma requisição de analytics antes do consentimento.
- Pelo menos 6 obras completas publicadas pelo Studio, sem ajuda de dev (depende das fotos e fichas da DT).
- Murilo aprova o visual com as cores e o logo da DT antes de apontar o domínio.

## Fases seguintes (cada uma vira um plano próprio)

| Fase | Conteúdo | Depende de |
| --- | --- | --- |
| 2 — Pessoas e confiança | Carreiras com ATS (RF-21, RF-22, RF-23 link), Integridade (RF-20), Fornecedores (RF-26), rodapé completo (RF-03), Diretoria (RF-12), Programas (RF-13), Premiações (RF-09, RF-19) | ATS escolhido; políticas em PDF revisadas pelo jurídico |
| 3 — Portfólio avançado | Mapa interativo de obras com MapLibre (RF-17), Equipamentos (RF-18), vídeo no hero, slider antes/depois | Coordenadas das obras; fotos da frota |
| 4 — Comercial e conteúdo | Integração com CRM (RD Station ou HubSpot), Licitações sob solicitação (RF-28), Notícias (RF-29), Responsabilidade social (RF-27) | CRM contratado |
