# Sanity: configuração e importação inicial

Pendente de credenciais do projeto Sanity da DT. Nada aqui foi executado ainda.

## 1. Variáveis de ambiente

Em `.env.local` (e no painel da hospedagem):

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ID do projeto (sanity.io/manage) |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset; padrão `production` |
| `SANITY_API_READ_TOKEN` | Token de leitura (só necessário se o dataset for privado) |
| `SANITY_API_WRITE_TOKEN` | Token de escrita, **só** para o seed; não vai para a hospedagem |
| `SANITY_REVALIDATE_SECRET` | Segredo do webhook (gere uma string aleatória longa) |

`CONTENT_SOURCE=fixtures` faz o site usar as fixtures locais (testes e CI). Qualquer outro valor usa o Sanity e exige o Project ID.

## 2. Tokens

1. sanity.io/manage > projeto > API > Tokens > Add API token.
2. Leitura: papel Viewer. Escrita (seed): papel Editor. Copie na hora, o valor não é mostrado de novo.
3. Em API > CORS origins, adicione `http://localhost:3000` e o domínio do site com "Allow credentials" (necessário para o Studio em `/studio`).

## 3. Importar as fixtures

```bash
npx tsx --env-file=.env.local scripts/seed-sanity.ts --dry-run   # lista os 30 documentos
npx tsx --env-file=.env.local scripts/seed-sanity.ts             # envia imagens e documentos
```

O script é idempotente (`_id` = `<tipo>-<slug>`; singletons: `configuracoes`, `paginaEmpresa`, `paginaLegal-privacidade`, `paginaLegal-cookies`) e usa `createOrReplace`: rodar de novo **sobrescreve** edições feitas no Studio nesses documentos. Use só no dataset vazio ou de teste.

## 4. Webhook de revalidação

sanity.io/manage > API > Webhooks > Create webhook:

- URL: `https://<domínio>/api/revalidate`
- Trigger on: Create, Update, Delete
- Filter: deixe vazio (todos os tipos)
- Projection: `{_type}`
- HTTP method: POST
- Secret: o mesmo valor de `SANITY_REVALIDATE_SECRET`
- Drafts: desligado (só publicações disparam)

A rota valida a assinatura (401 se inválida), espera 3 s pela consistência do Content Lake e expira a tag do `_type` (`obra`, `servico`, `cliente`, `numero`, `configuracoes`, `paginaEmpresa`, `paginaLegal`). Obra despublicada ou com slug trocado devolve 404 na requisição seguinte.

## 5. Verificação manual

1. `npm run dev`, abrir `/studio`, entrar com a conta Sanity.
2. Editar o título de uma obra e publicar.
3. Em até 1 minuto, a ficha da obra e a lista mostram o novo título.
4. Despublicar a obra: a URL antiga dá 404 e ela some da lista.
