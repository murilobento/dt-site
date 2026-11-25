import { describe, expect, it } from 'vitest';
import { fixturesSource } from '@/lib/content/fixtures-source';
import { filterObras, parseObraFilters, serializeObraFilters, type ObraFilters } from '@/lib/obras/filter';
import { normalizeForSearch } from '@/lib/text/normalize';

const obras = await fixturesSource.getObras();
const servicos = await fixturesSource.getServicos();
const nomes = Object.fromEntries(servicos.map((s) => [s.slug, s.titulo]));

describe('normalizeForSearch', () => {
  it('minúsculas, sem acento, espaços colapsados', () =>
    expect(normalizeForSearch('  São   PAULO ')).toBe('sao paulo'));
});

describe('filterObras', () => {
  it('busca ignora acento e caixa', () => {
    expect(filterObras(obras, { q: 'sao paulo' }).map((o) => o.slug)).toContain('obra-em-sao-paulo');
    expect(filterObras(obras, { q: 'PINHALZINHO' })).toHaveLength(1);
  });
  it('busca por nome de serviço ignora acento (conservacao vs Conservação)', () => {
    const r = filterObras(obras, { q: 'conservacao' }, nomes);
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((o) => o.servicos.includes('conservacao'))).toBe(true);
  });
  it('busca por cliente', () =>
    expect(filterObras(obras, { q: 'cliente b' }).map((o) => o.slug)).toContain('pinhalzinho-sc'));
  it('combina filtros com E', () => {
    const r = filterObras(obras, { segmento: 'infraestrutura', uf: 'SC', status: 'em-andamento' });
    expect(r.every((o) => o.uf === 'SC' && o.status === 'em-andamento')).toBe(true);
    const sc = filterObras(obras, { segmento: 'infraestrutura', uf: 'SC' });
    expect(sc.length).toBeGreaterThan(0);
  });
  it('cliente casa o nome exato; obra sem cliente não casa', () => {
    const r = filterObras(obras, { cliente: 'Nome do Cliente A' });
    expect(r.map((o) => o.slug)).toEqual(['obra-em-sao-paulo']);
  });
  it('sem filtros devolve tudo, incluindo obra mínima', () => {
    const r = filterObras(obras, {});
    expect(r).toHaveLength(obras.length);
    expect(r.map((o) => o.slug)).toContain('obra-minima-exemplo');
  });
});

describe('parse/serialize', () => {
  it('parse descarta valores inválidos', () =>
    expect(parseObraFilters(new URLSearchParams('uf=XX&status=foo&segmento=&q=%20'))).toEqual({}));
  it('parse mantém valores válidos', () =>
    expect(parseObraFilters(new URLSearchParams('uf=SC&status=concluida&segmento=infraestrutura&cliente=X&q=ponte'))).toEqual({
      segmento: 'infraestrutura', uf: 'SC', status: 'concluida', cliente: 'X', q: 'ponte',
    }));
  it('serialize é estável e omite vazios', () =>
    expect(serializeObraFilters({ q: 'br-282', segmento: 'infraestrutura' })).toBe('segmento=infraestrutura&q=br-282'));
  it('round-trip parse(serialize(f)) === f', () => {
    const f: ObraFilters = { segmento: 'obras-civis', uf: 'SP', status: 'em-andamento', cliente: 'Nome do Cliente A', q: 'são paulo & cia' };
    expect(parseObraFilters(new URLSearchParams(serializeObraFilters(f)))).toEqual(f);
  });
});
