import type { PortableTextBlock } from '@portabletext/types';

export type { PortableTextBlock };

export type Segmento = 'obras-civis' | 'infraestrutura';
export type CategoriaServico = 'infraestrutura' | 'edificacoes' | 'consultoria';
export type IconeServico =
  | 'estrada' | 'terraplanagem' | 'drenagem' | 'base-operacional' | 'edificio'
  | 'reforma' | 'fundacao' | 'fiscalizacao' | 'projeto' | 'laudo';
export type CategoriaObra = 'rodoviaria' | 'saupre' | 'edificacoes';
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
  categoria: CategoriaObra;
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
  codigoContrato?: string;
  /** Norma ou órgão de referência, ex.: "DNIT / DER". */
  norma?: string;
  desafio?: string;
  solucao?: string;
  quantitativos?: { rotulo: string; valor: string }[];
  etapas?: { titulo: string; descricao: string }[];
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
  /** Roteamento de leads (e-mail de destino); a navegação usa `categoria`. */
  segmento: Segmento;
  categoria: CategoriaServico;
  /** Ex.: "CBUQ • Fresagem • Restauração". */
  subtitulo?: string;
  icone?: IconeServico;
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

export interface Diferencial {
  titulo: string;
  descricao: string;
  icone: 'controle' | 'seguranca' | 'planejamento' | 'atendimento';
}

export interface PaginaCompliance {
  pilares: {
    titulo: string;
    descricao: string;
    icone: 'etica' | 'seguranca' | 'ambiental';
    itens: string[];
  }[];
  vagas: { titulo: string; requisito?: string; regime?: string; descricao: string }[];
}
