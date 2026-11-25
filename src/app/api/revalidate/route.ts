import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

/** Uma tag de cache por `_type` (ver TAGS em sanity-source.ts). */
const TAGS_VALIDAS = new Set([
  'obra', 'servico', 'cliente', 'numero', 'configuracoes', 'paginaEmpresa', 'paginaLegal',
]);

/**
 * Webhook do Sanity. Configure com projeção `{_type}` e o segredo SANITY_REVALIDATE_SECRET.
 * `expire: 0` expira o cache na hora: obra despublicada ou com slug trocado vira 404 na
 * próxima requisição, em vez de servir a página antiga enquanto revalida.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ message: 'SANITY_REVALIDATE_SECRET não configurado' }, { status: 500 });
  }

  const { isValidSignature, body } = await parseBody<{ _type?: string }>(req, secret);
  if (!isValidSignature) {
    return NextResponse.json({ message: 'Assinatura inválida' }, { status: 401 });
  }

  const tipo = body?._type;
  if (!tipo || !TAGS_VALIDAS.has(tipo)) {
    return NextResponse.json({ message: `_type desconhecido: ${tipo ?? '(vazio)'}` }, { status: 400 });
  }

  revalidateTag(tipo, { expire: 0 });
  return NextResponse.json({ revalidated: tipo });
}
