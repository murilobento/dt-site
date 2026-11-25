import type { PortableTextBlock } from '@portabletext/types';

export type { PortableTextBlock };

export type Segmento = 'obras-civis' | 'infraestrutura';
export type StatusObra = 'em-andamento' | 'concluida';
export type TipoCliente = 'concessionaria' | 'publico' | 'privado';
export type UF =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export interface Imagem {
  url: string;
  alt: string;
  width: number;
  height: number;
  lqip?: string;
}

export interface Seo {
  titulo?: string;
  descricao?: string;
}

export interface Obra {
  slug: string;
  titulo: string;
  segmento: Segmento;
  /** slugs de Servico */
  servicos: string[];
  cliente?: { nome: string; tipo: TipoCliente };
  cidade: string;
  uf: UF;
  coordenadas?: { lat: number; lng: number };
  /** YYYY-MM */
  inicio: string;
  /** YYYY-MM */
  termino?: string;
  status: StatusObra;
  extensao?: { valor: number; unidade: 'km' | 'm²' };
  diferencialTecnico?: string;
  descricao: string;
  capa: Imagem;
  galeria: Imagem[];
  antesDepois?: { antes: Imagem; depois: Imagem };
  destaque: boolean;
  seo?: Seo;
  /** ISO 8601, do `_updatedAt` do Sanity; ausente nas fixtures. */
  atualizadoEm?: string;
}

export interface Servico {
  slug: string;
  titulo: string;
  segmento: Segmento;
  resumo: string;
  escopo: string[];
  etapas: { titulo: string; descricao: string }[];
  equipamentos: string[];
  imagem: Imagem;
  seo?: Seo;
}

export interface Cliente {
  nome: string;
  logo: Imagem;
  tipo: TipoCliente;
  site?: string;
  ordem: number;
}

export interface Numero {
  rotulo: string;
  valor: number;
  unidade?: string;
  fonte: string;
  /** YYYY-MM */
  dataReferencia: string;
}

export interface Configuracoes {
  razaoSocial: string;
  cnpj: string;
  endereco: { logradouro: string; cidade: string; uf: UF; cep: string };
  telefone: string;
  horario: string;
  /** E.164 sem "+" */
  whatsapp: string;
  emailsLead: Record<Segmento, string>;
  canalDenunciasUrl: string;
  emailCarreiras: string;
  emailFornecedores: string;
  emailImprensa: string;
  redes: { rede: 'linkedin' | 'instagram' | 'youtube' | 'facebook'; url: string }[];
  siglaValores?: string;
}

export interface PaginaEmpresa {
  comoTrabalhamos: string;
  marcos: { ano: number; titulo: string; descricao: string; imagem?: Imagem }[];
  missao: string;
  visao: string;
  valores: { titulo: string; descricao: string }[];
  principios: string[];
}

export interface PaginaLegal {
  slug: 'privacidade' | 'cookies';
  titulo: string;
  versao: string;
  /** YYYY-MM-DD */
  vigencia: string;
  corpo: PortableTextBlock[];
}
