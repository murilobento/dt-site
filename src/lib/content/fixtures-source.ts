import type { ContentSource } from './source';
import type {
  Cliente, Configuracoes, Numero, Obra, PaginaEmpresa, PaginaLegal, Servico,
} from './types';
import obrasJson from './fixtures/obras.json';
import servicosJson from './fixtures/servicos.json';
import clientesJson from './fixtures/clientes.json';
import numerosJson from './fixtures/numeros.json';
import configuracoesJson from './fixtures/configuracoes.json';
import paginaEmpresaJson from './fixtures/paginaEmpresa.json';
import paginasLegaisJson from './fixtures/paginasLegais.json';

const obras = obrasJson as Obra[];
const servicos = servicosJson as Servico[];
const clientes = clientesJson as Cliente[];
const numeros = numerosJson as Numero[];
const configuracoes = configuracoesJson as Configuracoes;
const paginaEmpresa = paginaEmpresaJson as PaginaEmpresa;
const paginasLegais = paginasLegaisJson as PaginaLegal[];

const obrasOrdenadas = [...obras].sort((a, b) => b.inicio.localeCompare(a.inicio));

export const fixturesSource: ContentSource = {
  async getObras() {
    return obrasOrdenadas;
  },
  async getObra(slug) {
    return obras.find((o) => o.slug === slug) ?? null;
  },
  async getObrasDestaque() {
    return obrasOrdenadas.filter((o) => o.destaque).slice(0, 6);
  },
  async getObrasPorServico(servicoSlug) {
    return obrasOrdenadas.filter((o) => o.servicos.includes(servicoSlug));
  },
  async getServicos() {
    return servicos;
  },
  async getServico(slug) {
    return servicos.find((s) => s.slug === slug) ?? null;
  },
  async getClientes() {
    return [...clientes].sort((a, b) => a.ordem - b.ordem);
  },
  async getNumeros() {
    return numeros;
  },
  async getConfiguracoes() {
    return configuracoes;
  },
  async getPaginaEmpresa() {
    return paginaEmpresa;
  },
  async getPaginaLegal(slug) {
    const p = paginasLegais.find((x) => x.slug === slug);
    if (!p) throw new Error(`Página legal não encontrada: ${slug}`);
    return p;
  },
};
