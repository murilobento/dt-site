import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchMock = vi.fn();
vi.mock('next-sanity', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-sanity')>();
  return { ...actual, createClient: () => ({ fetch: fetchMock }) };
});

import { sanitySource } from '@/lib/content/sanity-source';
import { getContentSource } from '@/lib/content/source';

const rawImagem = (id: string, alt: string) => ({
  alt,
  asset: { _type: 'reference', _ref: `image-${id}-1600x1000-webp` },
  width: 1600,
  height: 1000,
  lqip: 'data:image/jpeg;base64,AAAA',
});

const rawObra = {
  slug: 'pinhalzinho-sc',
  titulo: 'Restauração em Pinhalzinho',
  segmento: 'infraestrutura',
  servicos: ['restauracao'],
  cliente: { nome: 'Cliente A', tipo: 'publico' },
  cidade: 'Pinhalzinho',
  uf: 'SC',
  coordenadas: null,
  inicio: '2024-06',
  termino: null,
  status: 'em-andamento',
  extensao: null,
  diferencialTecnico: null,
  descricao: 'Descrição',
  capa: rawImagem('abc123', 'Vista aérea da rodovia em Pinhalzinho, SC'),
  galeria: null,
  antesDepois: null,
  destaque: true,
  seo: null,
};

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'proj123');
  vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'production');
});

describe('sanitySource', () => {
  it('mapeia documento obra para Obra', async () => {
    fetchMock.mockResolvedValue([rawObra]);
    const [o] = await sanitySource.getObras();
    expect(o.capa.url).toMatch(/^https:\/\/cdn\.sanity\.io\//);
    expect(o.capa.url).toContain('auto=format');
    expect(o.capa.alt).toBe(rawObra.capa.alt);
    expect(o.capa.width).toBe(1600);
    expect(o.servicos).toEqual(['restauracao']);
  });

  it('normaliza nulos do GROQ em campos opcionais ausentes e galeria vazia', async () => {
    fetchMock.mockResolvedValue([rawObra]);
    const [o] = await sanitySource.getObras();
    expect(o.galeria).toEqual([]);
    for (const k of ['termino', 'coordenadas', 'extensao', 'antesDepois', 'diferencialTecnico', 'seo'] as const) {
      expect(o[k]).toBeUndefined();
    }
    expect(JSON.stringify(o)).not.toContain('null');
  });

  it('getObra exclui rascunhos e devolve null quando não acha', async () => {
    fetchMock.mockResolvedValue(null);
    expect(await sanitySource.getObra('x')).toBeNull();
    expect(fetchMock.mock.calls[0][0]).toContain('!(_id in path("drafts.**"))');
    expect(fetchMock.mock.calls[0][1]).toEqual({ slug: 'x' });
  });

  it('getObra devolve null (não lança) para documento sem capa', async () => {
    fetchMock.mockResolvedValue({ ...rawObra, capa: null });
    expect(await sanitySource.getObra('pinhalzinho-sc')).toBeNull();
  });

  it('toda consulta exclui rascunhos e usa tags de cache do _type', async () => {
    fetchMock.mockResolvedValue([]);
    await sanitySource.getObras();
    await sanitySource.getServicos();
    await sanitySource.getClientes();
    await sanitySource.getNumeros();
    for (const call of fetchMock.mock.calls) {
      expect(call[0]).toContain('!(_id in path("drafts.**"))');
    }
    const tags = fetchMock.mock.calls.map((c) => c[2].next.tags);
    expect(tags[0]).toEqual(expect.arrayContaining(['obra', 'servico', 'cliente']));
    expect(tags[1]).toEqual(['servico']);
    expect(tags[2]).toEqual(['cliente']);
    expect(tags[3]).toEqual(['numero']);
  });

  it('getObrasDestaque limita a 6 e getObrasPorServico passa o slug', async () => {
    fetchMock.mockResolvedValue([]);
    await sanitySource.getObrasDestaque();
    expect(fetchMock.mock.calls[0][0]).toContain('[0...6]');
    await sanitySource.getObrasPorServico('restauracao');
    expect(fetchMock.mock.calls[1][1]).toEqual({ servico: 'restauracao' });
  });

  it('mapeia emailsLead do documento configuracoes (campos sem hífen)', async () => {
    fetchMock.mockResolvedValue({
      razaoSocial: 'DT', cnpj: '1', endereco: { logradouro: 'a', cidade: 'b', uf: 'SP', cep: 'c' },
      telefone: '1', horario: 'h', whatsapp: '55', canalDenunciasUrl: 'u',
      emailCarreiras: 'c', emailFornecedores: 'f', emailImprensa: 'i', redes: null, siglaValores: null,
      emailsLead: { obrasCivis: 'oc@x.com', infraestrutura: 'in@x.com' },
    });
    const c = await sanitySource.getConfiguracoes();
    expect(c.emailsLead).toEqual({ 'obras-civis': 'oc@x.com', infraestrutura: 'in@x.com' });
    expect(c.redes).toEqual([]);
    expect(fetchMock.mock.calls[0][2].next.tags).toEqual(['configuracoes']);
  });

  it('getPaginaLegal deriva o slug do _id do singleton', async () => {
    fetchMock.mockResolvedValue({ titulo: 'Cookies', versao: '1', vigencia: '2025-01-01', corpo: [] });
    const p = await sanitySource.getPaginaLegal('cookies');
    expect(p).toEqual({ slug: 'cookies', titulo: 'Cookies', versao: '1', vigencia: '2025-01-01', corpo: [] });
    expect(fetchMock.mock.calls[0][1]).toEqual({ id: 'paginaLegal-cookies' });
  });

  it('descarta imagem sem alt: galeria filtra o item e obra sem alt na capa é excluída', async () => {
    fetchMock.mockResolvedValue([
      { ...rawObra, galeria: [rawImagem('g1', 'Fachada'), { ...rawImagem('g2', ''), alt: '  ' }] },
      { ...rawObra, slug: 'sem-alt', capa: { ...rawObra.capa, alt: null } },
    ]);
    const obras = await sanitySource.getObras();
    expect(obras.map((o) => o.slug)).toEqual(['pinhalzinho-sc']);
    expect(obras[0].galeria.map((g) => g.alt)).toEqual(['Fachada']);
  });

  it('getPaginaLegal lança erro claro quando o documento não existe', async () => {
    fetchMock.mockResolvedValue(null);
    await expect(sanitySource.getPaginaLegal('privacidade')).rejects.toThrow(/privacidade/);
    expect(fetchMock.mock.calls[0][1]).toEqual({ id: 'paginaLegal-privacidade' });
  });
});

describe('getContentSource', () => {
  it('usa fixtures quando CONTENT_SOURCE=fixtures', () => {
    vi.stubEnv('CONTENT_SOURCE', 'fixtures');
    expect(getContentSource()).not.toBe(sanitySource);
  });

  it('usa Sanity nos demais casos', () => {
    vi.stubEnv('CONTENT_SOURCE', '');
    expect(getContentSource()).toBe(sanitySource);
  });

  it('lança erro de configuração claro sem NEXT_PUBLIC_SANITY_PROJECT_ID', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', '');
    await expect(sanitySource.getObras()).rejects.toThrow(/NEXT_PUBLIC_SANITY_PROJECT_ID/);
  });
});
