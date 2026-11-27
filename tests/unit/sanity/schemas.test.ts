import { describe, expect, it } from 'vitest';
import { documentTypes } from '../../../sanity/schemas';
import { obra } from '../../../sanity/schemas/obra';
import { numero } from '../../../sanity/schemas/numero';
import { servico } from '../../../sanity/schemas/servico';
import { cliente } from '../../../sanity/schemas/cliente';
import { paginaLegal } from '../../../sanity/schemas/paginaLegal';
import { paginaEmpresa } from '../../../sanity/schemas/paginaEmpresa';
import { paginaCompliance } from '../../../sanity/schemas/paginaCompliance';
import { configuracoes } from '../../../sanity/schemas/configuracoes';
import { requiredFields } from './requiredFields';

describe('schemas Sanity', () => {
  it('numero exige fonte e dataReferencia', () => {
    expect(requiredFields(numero)).toEqual(expect.arrayContaining(['fonte', 'dataReferencia']));
  });

  it('imagens exigem alt', () => {
    expect(requiredFields(obra, 'capa')).toContain('alt');
    expect(requiredFields(servico, 'imagem')).toContain('alt');
    expect(requiredFields(cliente, 'logo')).toContain('alt');
  });

  it('obra exige slug, titulo, capa, datas e localização', () => {
    expect(requiredFields(obra)).toEqual(
      expect.arrayContaining(['slug', 'titulo', 'capa', 'segmento', 'cidade', 'uf', 'inicio', 'status', 'descricao', 'categoria']),
    );
  });

  it('serviço exige categoria; subtítulo e ícone são opcionais', () => {
    expect(requiredFields(servico)).toContain('categoria');
    expect(requiredFields(servico)).not.toEqual(expect.arrayContaining(['subtitulo', 'icone']));
  });

  it('campos novos da ficha da obra são opcionais', () => {
    const req = requiredFields(obra);
    for (const f of ['codigoContrato', 'norma', 'desafio', 'solucao', 'quantitativos', 'etapas'])
      expect(req).not.toContain(f);
    expect(obra.fields.map((f) => f.name)).toEqual(
      expect.arrayContaining(['codigoContrato', 'norma', 'desafio', 'solucao', 'quantitativos', 'etapas']),
    );
  });

  it('configuracoes tem diferenciais e paginaCompliance tem pilares e vagas', () => {
    expect(configuracoes.fields.map((f) => f.name)).toContain('diferenciais');
    expect(paginaCompliance.fields.map((f) => f.name)).toEqual(['pilares', 'vagas']);
  });

  it('slug de obra e servico é obrigatório', () => {
    expect(requiredFields(servico)).toContain('slug');
  });

  it('galeria, antes/depois e marcos também exigem alt nas imagens', () => {
    const galeria = obra.fields.find((f) => f.name === 'galeria') as unknown as {
      of: { fields: { name: string; validation?: unknown }[] }[];
    };
    expect(requiredFields(galeria.of[0])).toContain('alt');
    expect(requiredFields(obra, 'antesDepois')).toEqual(expect.arrayContaining(['antes', 'depois']));
  });

  it('paginaLegal não tem campo slug obrigatório (vem do _id do singleton)', () => {
    expect(paginaLegal.fields.map((f) => f.name)).not.toContain('slug');
    expect(requiredFields(paginaLegal)).toEqual(expect.arrayContaining(['titulo', 'versao', 'vigencia', 'corpo']));
  });

  it('registra todos os tipos de documento esperados', () => {
    expect(documentTypes.map((t) => t.name).sort()).toEqual(
      ['cliente', 'configuracoes', 'numero', 'obra', 'paginaCompliance', 'paginaEmpresa', 'paginaLegal', 'servico'],
    );
    expect(paginaEmpresa.name).toBe('paginaEmpresa');
  });
});
