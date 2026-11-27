import 'server-only';
import { fixturesSource } from './fixtures-source';
import { sanitySource } from './sanity-source';
import type {
  Cliente, Configuracoes, Diferencial, Numero, Obra, PaginaCompliance, PaginaEmpresa, PaginaLegal, Servico,
} from './types';

export interface ContentSource {
  /** ordenadas por inicio desc */
  getObras(): Promise<Obra[]>;
  getObra(slug: string): Promise<Obra | null>;
  /** destaque=true, máx. 6 */
  getObrasDestaque(): Promise<Obra[]>;
  getObrasPorServico(servicoSlug: string): Promise<Obra[]>;
  getServicos(): Promise<Servico[]>;
  getServico(slug: string): Promise<Servico | null>;
  /** por ordem asc */
  getClientes(): Promise<Cliente[]>;
  getNumeros(): Promise<Numero[]>;
  getConfiguracoes(): Promise<Configuracoes>;
  getPaginaEmpresa(): Promise<PaginaEmpresa>;
  getPaginaCompliance(): Promise<PaginaCompliance>;
  getDiferenciais(): Promise<Diferencial[]>;
  getPaginaLegal(slug: PaginaLegal['slug']): Promise<PaginaLegal>;
}

/** CONTENT_SOURCE = 'fixtures' | 'sanity' (padrão: sanity). */
export function getContentSource(): ContentSource {
  if (process.env.CONTENT_SOURCE === 'fixtures') return fixturesSource;
  return sanitySource;
}
