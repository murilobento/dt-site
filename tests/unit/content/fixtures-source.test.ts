import { describe, it, expect, vi } from 'vitest';
import { fixturesSource as src } from '@/lib/content/fixtures-source';

describe('fixturesSource', () => {
  it('getObrasDestaque devolve só destaques, no máximo 6', async () => {
    const d = await src.getObrasDestaque();
    expect(d.length).toBeGreaterThanOrEqual(3);
    expect(d.length).toBeLessThanOrEqual(6);
    expect(d.every((o) => o.destaque)).toBe(true);
  });
  it('getObra de slug inexistente devolve null', async () =>
    expect(await src.getObra('nao-existe')).toBeNull());
  it('getObra devolve a obra pelo slug', async () =>
    expect((await src.getObra('obra-em-sao-paulo'))?.cidade).toBe('São Paulo'));
  it('getObrasPorServico filtra pelo slug do serviço', async () => {
    const r = await src.getObrasPorServico('restauracao');
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((o) => o.servicos.includes('restauracao'))).toBe(true);
  });
  it('getObras ordena por início desc', async () => {
    const r = await src.getObras();
    expect(r.map((o) => o.inicio)).toEqual([...r.map((o) => o.inicio)].sort().reverse());
  });
  it('todo número tem fonte e data de referência', async () =>
    (await src.getNumeros()).forEach((n) => {
      expect(n.fonte).toBeTruthy();
      expect(n.dataReferencia).toMatch(/^\d{4}-\d{2}/);
    }));
  it('tem 8 obras, 2+ por segmento, e a obra mínima sem opcionais', async () => {
    const r = await src.getObras();
    expect(r).toHaveLength(8);
    for (const s of ['obras-civis', 'infraestrutura'] as const)
      expect(r.filter((o) => o.segmento === s).length).toBeGreaterThanOrEqual(2);
    const m = await src.getObra('obra-minima-exemplo');
    expect(m).not.toBeNull();
    expect(m!.termino).toBeUndefined();
    expect(m!.antesDepois).toBeUndefined();
    expect(m!.coordenadas).toBeUndefined();
    expect(m!.galeria).toEqual([]);
    expect(m!.cliente).toBeUndefined();
    expect(m!.extensao).toBeUndefined();
    const p = await src.getObra('pinhalzinho-sc');
    expect(p!.galeria).toHaveLength(4);
    expect(p!.antesDepois).toBeDefined();
  });
  it('clientes: 3 por tipo, ordenados por ordem asc', async () => {
    const c = await src.getClientes();
    expect(c).toHaveLength(9);
    for (const t of ['concessionaria', 'publico', 'privado'] as const)
      expect(c.filter((x) => x.tipo === t)).toHaveLength(3);
    expect(c.map((x) => x.ordem)).toEqual([...c.map((x) => x.ordem)].sort((a, b) => a - b));
    expect(c.some((x) => x.nome === 'Nome do Cliente A')).toBe(true);
  });
  it('todo cliente de obra existe em clientes com mesmo nome e tipo', async () => {
    const clientes = await src.getClientes();
    for (const o of await src.getObras())
      if (o.cliente)
        expect(clientes.some((c) => c.nome === o.cliente!.nome && c.tipo === o.cliente!.tipo)).toBe(true);
  });
  it('serviços e configurações', async () => {
    expect((await src.getServicos()).map((s) => s.slug).sort()).toEqual(
      ['conservacao', 'construcao-rodoviaria', 'obras-civis', 'restauracao'],
    );
    expect(await src.getServico('x')).toBeNull();
    const cfg = await src.getConfiguracoes();
    expect(cfg.cnpj).toBe('53.675.601/0001-60');
    expect(cfg.whatsapp).toBe('5514981734581');
    expect((await src.getPaginaLegal('cookies')).slug).toBe('cookies');
  });
});

describe('getContentSource', () => {
  it('CONTENT_SOURCE=fixtures devolve a fonte de fixtures', async () => {
    vi.stubEnv('CONTENT_SOURCE', 'fixtures');
    const { getContentSource } = await import('@/lib/content/source');
    expect(getContentSource()).toBe(src);
    vi.unstubAllEnvs();
  });
  it('sem fixtures, falha claramente enquanto o Sanity não existe', async () => {
    vi.stubEnv('CONTENT_SOURCE', 'sanity');
    const { getContentSource } = await import('@/lib/content/source');
    expect(() => getContentSource()).toThrow('Sanity source not configured yet');
    vi.unstubAllEnvs();
  });
});
