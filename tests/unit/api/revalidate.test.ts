import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { encodeSignatureHeader, SIGNATURE_HEADER_NAME } from '@sanity/webhook';

const { revalidateTag } = vi.hoisted(() => ({ revalidateTag: vi.fn() }));
vi.mock('next/cache', () => ({ revalidateTag }));

import { POST } from '@/app/api/revalidate/route';

const SECRET = 'segredo-de-teste';

async function req(body: unknown, secret: string | null = SECRET) {
  const raw = typeof body === 'string' ? body : JSON.stringify(body);
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (secret) headers[SIGNATURE_HEADER_NAME] = await encodeSignatureHeader(raw, Date.now(), secret);
  return new NextRequest('http://localhost/api/revalidate', { method: 'POST', body: raw, headers });
}

async function call(r: NextRequest) {
  // parseBody espera 3 s pela consistência do Content Lake; avançamos o relógio falso até terminar.
  let res: Response | undefined;
  const p = POST(r).then((x) => (res = x));
  const limite = Date.now() + 4000;
  while (!res && Date.now() < limite) {
    if (vi.getTimerCount() > 0) await vi.advanceTimersByTimeAsync(3000);
    else await new Promise<void>((resolve) => setImmediate(resolve));
  }
  await p;
  return res as Response;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout'] });
  revalidateTag.mockReset();
  vi.stubEnv('SANITY_REVALIDATE_SECRET', SECRET);
});
afterEach(() => vi.useRealTimers());

describe('POST /api/revalidate', () => {
  it('assinatura inválida → 401 e nada revalidado', async () => {
    const res = await call(await req({ _type: 'obra' }, 'outro-segredo'));
    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('sem cabeçalho de assinatura → 401', async () => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await call(await req({ _type: 'obra' }, null));
    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
    expect(erro).toHaveBeenCalledWith('Missing signature header');
    erro.mockRestore();
  });

  it('corpo malformado com assinatura inválida → 401', async () => {
    const res = await call(await req('{nope', 'outro-segredo'));
    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('corpo malformado com assinatura válida → 400', async () => {
    const res = await call(await req('{nope'));
    expect(res.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('segredo não configurado → 500 e nada revalidado', async () => {
    vi.stubEnv('SANITY_REVALIDATE_SECRET', '');
    const res = await call(await req({ _type: 'obra' }));
    expect(res.status).toBe(500);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('assinatura válida revalida a tag do _type com expiração imediata', async () => {
    const res = await call(await req({ _type: 'obra' }));
    expect(res.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith('obra', { expire: 0 });
  });

  it.each(['obra', 'servico', 'cliente', 'numero', 'configuracoes', 'paginaEmpresa', 'paginaLegal'])(
    'aceita _type %s',
    async (t) => {
      const res = await call(await req({ _type: t }));
      expect(res.status).toBe(200);
      expect(revalidateTag).toHaveBeenCalledWith(t, { expire: 0 });
    },
  );

  it('_type desconhecido ou ausente → 400 sem revalidar', async () => {
    expect((await call(await req({ _type: 'outro' }))).status).toBe(400);
    expect((await call(await req({}))).status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
