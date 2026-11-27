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
  it('tem 9 obras, 2+ por segmento, e a obra mínima sem opcionais', async () => {
    const r = await src.getObras();
    expect(r).toHaveLength(9);
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
    for (const k of ['codigoContrato', 'norma', 'desafio', 'solucao', 'quantitativos', 'etapas'] as const)
      expect(m![k]).toBeUndefined();
    const p = await src.getObra('pinhalzinho-sc');
    expect(p!.galeria).toHaveLength(4);
    expect(p!.antesDepois).toBeDefined();
    expect(p!.categoria).toBe('rodoviaria');
    for (const k of ['codigoContrato', 'norma', 'desafio', 'solucao'] as const) expect(p![k]).toBeTruthy();
    expect(p!.quantitativos!.length).toBeGreaterThan(0);
    expect(p!.etapas!.length).toBeGreaterThan(0);
  });
  it('obras cobrem as 3 categorias (rodoviária ≥ 2) e os serviços citados existem', async () => {
    const obras = await src.getObras();
    const n = (c: string) => obras.filter((o) => o.categoria === c).length;
    expect(n('rodoviaria')).toBeGreaterThanOrEqual(2);
    expect(n('saupre')).toBeGreaterThanOrEqual(1);
    expect(n('edificacoes')).toBeGreaterThanOrEqual(1);
    const slugs = (await src.getServicos()).map((s) => s.slug);
    for (const o of obras) for (const s of o.servicos) expect(slugs).toContain(s);
  });
  it('dados de exemplo nunca usam Curitiba/PR, (41) ou CREA-PR', async () => {
    const todo = JSON.stringify([
      await src.getObras(), await src.getServicos(), await src.getPaginaCompliance(), await src.getDiferenciais(),
    ]);
    expect(todo).not.toMatch(/Curitiba|\(41\)|CREA-PR/);
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
    const servicos = await src.getServicos();
    expect(servicos.map((s) => s.slug)).toContain('restauracao');
    for (const c of ['infraestrutura', 'edificacoes', 'consultoria'] as const)
      expect(servicos.filter((s) => s.categoria === c).length).toBeGreaterThanOrEqual(2);
    const seg = { infraestrutura: 'infraestrutura', edificacoes: 'obras-civis', consultoria: 'infraestrutura' } as const;
    for (const s of servicos) expect(s.segmento).toBe(seg[s.categoria]);
    expect(new Set(servicos.map((s) => s.slug)).size).toBe(servicos.length);
    expect(await src.getServico('x')).toBeNull();
    const cfg = await src.getConfiguracoes();
    expect(cfg.cnpj).toBe('53.675.601/0001-60');
    expect(cfg.whatsapp).toBe('5514981734581');
    expect((await src.getPaginaLegal('cookies')).slug).toBe('cookies');
  });
});

describe('fixturesSource: compliance e diferenciais', () => {
  it('compliance tem 3 pilares com itens e vagas; uma vaga sem requisito/regime', async () => {
    const c = await src.getPaginaCompliance();
    expect(c.pilares.map((p) => p.icone)).toEqual(['etica', 'seguranca', 'ambiental']);
    expect(c.pilares.every((p) => p.itens.length > 0)).toBe(true);
    expect(c.vagas.length).toBeGreaterThanOrEqual(2);
    expect(c.vagas.every((v) => v.titulo.includes('[exemplo]'))).toBe(true);
    expect(c.vagas.some((v) => v.requisito === undefined && v.regime === undefined)).toBe(true);
  });
  it('diferenciais: 4, um por ícone', async () => {
    const d = await src.getDiferenciais();
    expect(d.map((x) => x.icone).sort()).toEqual(['atendimento', 'controle', 'planejamento', 'seguranca']);
  });
});

describe('getContentSource', () => {
  it('CONTENT_SOURCE=fixtures devolve a fonte de fixtures', async () => {
    vi.stubEnv('CONTENT_SOURCE', 'fixtures');
    const { getContentSource } = await import('@/lib/content/source');
    expect(getContentSource()).toBe(src);
    vi.unstubAllEnvs();
  });
});
