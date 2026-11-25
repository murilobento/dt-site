import { cliente } from './cliente';
import { configuracoes } from './configuracoes';
import { numero } from './numero';
import { obra } from './obra';
import { paginaEmpresa } from './paginaEmpresa';
import { paginaLegal } from './paginaLegal';
import { seo } from './seo';
import { servico } from './servico';

/** Tipos de documento (um por tag de cache) + objetos reutilizáveis. */
export const documentTypes = [obra, servico, cliente, numero, configuracoes, paginaEmpresa, paginaLegal];
export const schemaTypes = [...documentTypes, seo];
