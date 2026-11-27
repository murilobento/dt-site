# Operação do site da DT

Guia para quem cuida do site no dia a dia, sem precisar programar. Termos entre aspas são os nomes exatos que aparecem nas telas.

## 1. Publicar ou editar uma obra no Studio

O Studio é o painel de edição do site. Fica em `https://<endereço do site>/studio`. Entre com a conta Sanity que a DT cadastrou.

**Criar uma obra**

1. No menu da esquerda, clique em **Obras** e depois no botão **+** (criar).
2. Preencha os campos obrigatórios (aparecem com aviso vermelho se faltarem): **Título**, **Segmento**, **Cidade**, **UF**, **Descrição** e a imagem de capa.
3. Os demais campos são opcionais. Se deixar **Término**, **Antes e depois**, **Galeria** ou **Coordenadas** em branco, o site simplesmente não mostra essa parte.
4. Preencha **Cliente (só se divulgável)** apenas quando o cliente autorizou o uso do nome. Caso contrário, deixe em branco.
5. Marque **Destaque na home** para a obra aparecer na página inicial.
6. Clique em **Publish** (publicar). Enquanto não publicar, a obra fica como rascunho e não aparece no site.

A obra aparece no site em até 1 minuto.

**Editar**: abra a obra, altere o que precisar e clique em **Publish** de novo.

**Tirar do ar**: abra a obra, use o menu **...** ao lado de Publish e escolha **Unpublish**. O endereço antigo passa a mostrar "página não encontrada" e a obra some das listas.

Atenção: trocar o campo de endereço (**Slug**) de uma obra publicada muda o link dela. Quem tiver o link antigo verá "página não encontrada". Só troque se for realmente necessário.

## 2. Trocar os números da home

Os números ("Nossa atuação em números") ficam em **Números** no menu do Studio. Abra o número, altere **Valor**, **Unidade** ou **Rótulo** e clique em **Publish**. Não crie números sem fonte confiável: o site mostra esses valores como fatos da empresa.

## 3. Onde chegam os leads

Cada formulário de contato envia um e-mail para a caixa do segmento correspondente à disciplina escolhida. Os endereços ficam em **Configurações do site** no Studio (campos de e-mail por segmento: Obras civis e Infraestrutura; e e-mails de Carreiras, Fornecedores e Imprensa).

- Para mudar quem recebe, altere o e-mail em **Configurações do site** e publique. Vale em até 1 minuto, sem deploy.
- O assunto do e-mail segue o padrão `[Site] Lead <disciplina> — <empresa>`.
- Se o assunto começa com **`[não verificado]`**, o formulário foi enviado sem a verificação anti-robô (por exemplo, por quem usa o navegador com JavaScript desligado). Pode ser um cliente de verdade, mas trate com um pouco mais de cuidado: confirme os dados antes de responder.
- Se o e-mail de um lead não chegar, confira a pasta de spam e peça a quem administra o site para verificar o painel do Resend (serviço que envia os e-mails).

## 4. Reverter um deploy na Vercel

Se uma publicação do site quebrou algo:

1. Entre em vercel.com, abra o projeto do site da DT e clique em **Deployments**.
2. Encontre o último deploy que estava funcionando (marcado "Ready", com data anterior ao problema).
3. Clique nos três pontos (**...**) desse deploy e escolha **Promote to Production** (ou **Instant Rollback**).
4. Em segundos o site volta à versão anterior. Não precisa mexer no código.

Conteúdo editado no Studio não é afetado por rollback: textos e obras continuam como estão. Depois de reverter, avise quem desenvolve para corrigir a causa antes de publicar de novo.

## 5. Checklist de go-live

Faça tudo antes de apontar o domínio definitivo.

**Variáveis de ambiente (Vercel > Settings > Environment Variables, ambiente Production)**

| Variável | Para que serve |
| --- | --- |
| `CONTENT_SOURCE` | Deve ser `sanity` (ou ficar em branco). Nunca `fixtures` em produção. |
| `NEXT_PUBLIC_SITE_URL` | Endereço público do site, com `https://`. Sem ela o build usa `VERCEL_PROJECT_PRODUCTION_URL`; se nenhuma existir em produção, o build falha. |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | Projeto e dataset do Sanity. |
| `SANITY_API_READ_TOKEN` | Só se o dataset for privado. |
| `SANITY_REVALIDATE_SECRET` | Segredo do webhook do Sanity (item abaixo). |
| `RESEND_API_KEY` | Envio dos e-mails de lead. Sem ela, em produção, o formulário mostra falha (com o WhatsApp como alternativa) em vez de perder o lead em silêncio. |
| `LEAD_TRANSPORT` | Deixe em branco em produção. `log` só para testar localmente sem Resend. |
| `LEAD_FROM_EMAIL` | Remetente dos e-mails de lead (domínio verificado no Resend). |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Verificação anti-robô dos formulários. Sem elas, todo lead chega como "[não verificado]". |
| `NEXT_PUBLIC_GTM_ID` | ID do Google Tag Manager (formato `GTM-XXXXXXX`). |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | Opcional. Com elas, erros do servidor e do navegador vão para o Sentry (sem dados pessoais). Sem elas, o Sentry fica desligado. |
| `SENTRY_AUTH_TOKEN` | Opcional. Só para enviar mapas de código ao Sentry no build. |

Depois de alterar variáveis, faça um novo deploy (Deployments > **Redeploy**).

**Sanity**

- [ ] Webhook criado em sanity.io/manage > API > Webhooks, apontando para `https://<domínio>/api/revalidate`, mesmo segredo de `SANITY_REVALIDATE_SECRET` (passo a passo em `docs/sanity-setup.md`).
- [ ] O domínio do site cadastrado em API > CORS origins, com "Allow credentials".

**Google Tag Manager**

- [ ] Tags do GA4 configuradas com **Consent Mode**: só disparam com `analytics_storage` concedido; tags de marketing só com `ad_storage` concedido.
- [ ] Se forem adicionadas tags de marketing no GTM, incluir os domínios que elas usam na CSP em `next.config.ts` (`script-src`, `img-src`, `connect-src`, `frame-src`); sem isso o navegador bloqueia as requisições. Tags de marketing só rodam quando o visitante aceita também **Desempenho**.
- [ ] Eventos conferidos no modo Preview do GTM: `lead_submit`, `cta_click`, `whatsapp_click`, `project_view`, `filter_use`.
- [ ] Confirmado que, antes de aceitar o banner de cookies, nenhuma requisição ao Google é feita (aba Network do navegador).

**Dados reais em Configurações do site (Studio)**

- [ ] Telefone, WhatsApp e horário de atendimento.
- [ ] E-mails por segmento (Obras civis e Infraestrutura), Carreiras, Fornecedores e Imprensa.
- [ ] Endereço, CNPJ e razão social conferidos.
- [ ] Redes sociais (LinkedIn, Instagram, YouTube, Facebook): remova as que a DT não usa.
- [ ] Criar o documento **Página Compliance** no Studio (programa de integridade, SSMA e vagas); sem ele a página de Compliance não carrega.
- [ ] Definir a **categoria** de cada serviço (Infraestrutura, Edificações ou Consultoria); serviço sem categoria não aparece na página Serviços.

**Conteúdo**

- [ ] Trocar os textos provisórios da **Home** e da página **Sobre** pelos textos aprovados pela DT. Fixtures e textos marcados com "[exemplo]" não podem ir ao ar.
- [ ] Pelo menos 6 obras completas publicadas (fotos e fichas fornecidas pela DT).
- [ ] Política de privacidade e Política de cookies revisadas pelo jurídico.
- [ ] Logo e cores da DT aprovados pelo Murilo antes de apontar o domínio.

**Desempenho e proteção contra abuso**

- [ ] Medir o LCP no preview da Vercel com fotos reais e reduzir o limite do `lighthouserc.json` para 2500 ms em `/` e `/servicos/<slug>` (hoje 3500 ms, folga para as imagens provisórias).
- [ ] Criar no Vercel Firewall (WAF) uma regra de rate limit para requisições POST em `/contato` e `/compliance` (por exemplo, 5 requisições por minuto por IP). Os formulários são Server Actions públicas: sem limite, um robô pode esgotar a cota do Resend e lotar as caixas de lead e de carreiras, mesmo com Turnstile.

**Domínio e redirecionamentos**

- [ ] Confirmar se existe um site antigo da DT. Se existir, listar os endereços antigos mais acessados para criar redirecionamentos 301 (peça ao desenvolvedor: a lista fica em `src/lib/redirects.ts`). Sem isso, quem tem links antigos cai em "página não encontrada" e o Google perde o histórico de posições.

**Testes finais no endereço de produção (ou no preview da Vercel)**

- [ ] Enviar um lead de cada segmento e confirmar que chegou na caixa certa.
- [ ] Publicar uma obra no Studio e vê-la no site em até 1 minuto.
- [ ] Abrir o site no celular e conferir menu, formulário e botão do WhatsApp.
