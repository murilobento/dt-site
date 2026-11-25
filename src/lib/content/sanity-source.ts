import 'server-only';
import { createClient } from 'next-sanity';
import { createImageUrlBuilder } from '@sanity/image-url';
import type { ContentSource } from './source';
import type {
  Cliente, Configuracoes, Imagem, Numero, Obra, PaginaEmpresa, PaginaLegal, Servico, TipoCliente,
} from './types';

const API_VERSION = '2025-01-01';
const PUBLICADO = '!(_id in path("drafts.**"))';

/** Tags de cache = `_type` do documento; o webhook revalida a tag do tipo alterado. */
const TAGS = {
  obra: ['obra', 'servico', 'cliente'], // a obra resolve slugs de serviço e dados do cliente
  servico: ['servico'],
  cliente: ['cliente'],
  numero: ['numero'],
  configuracoes: ['configuracoes'],
  paginaEmpresa: ['paginaEmpresa'],
  paginaLegal: ['paginaLegal'],
} as const;

function projectId(): string {
  const id = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!id) {
    throw new Error(
      'Sanity não configurado: defina NEXT_PUBLIC_SANITY_PROJECT_ID (ou use CONTENT_SOURCE=fixtures).',
    );
  }
  return id;
}

const dataset = () => process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

function client() {
  return createClient({
    projectId: projectId(),
    dataset: dataset(),
    apiVersion: API_VERSION,
    useCdn: false, // a revalidação por tag já cuida do cache; CDN da API traria atraso extra
    perspective: 'published',
    token: process.env.SANITY_API_READ_TOKEN,
  });
}

async function fetchSanity<T>(
  query: string,
  params: Record<string, unknown>,
  tags: readonly string[],
): Promise<T> {
  return client().fetch<T>(query, params, { next: { tags: [...tags] } });
}

// ---------- imagens ----------

interface RawImagem {
  alt?: string | null;
  asset?: { _ref?: string; _id?: string } | null;
  crop?: unknown;
  hotspot?: unknown;
  width?: number | null;
  height?: number | null;
  lqip?: string | null;
}

/** Projeção GROQ padrão de imagem: referência do asset + metadados. */
const IMG = (campo: string) =>
  `${campo}{alt, asset, crop, hotspot, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, "lqip": asset->metadata.lqip}`;

function imagemOuNull(raw: RawImagem | null | undefined): Imagem | null {
  // Sem asset ou sem alt a imagem é descartada: alt vazio tornaria conteúdo em imagem decorativa.
  if (!raw?.asset || !raw.alt?.trim()) return null;
  const url = createImageUrlBuilder({ projectId: projectId(), dataset: dataset() })
    .image(raw as never)
    .auto('format')
    .url();
  return {
    url,
    alt: raw.alt,
    width: raw.width ?? 0,
    height: raw.height ?? 0,
    ...(raw.lqip ? { lqip: raw.lqip } : {}),
  };
}

// ---------- helpers de normalização (GROQ devolve null para campo ausente) ----------

/** Remove chaves nulas: os tipos usam `undefined` para opcionais ausentes. */
function semNulos<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined)) as T;
}

// ---------- obra ----------

interface RawObra {
  slug: string;
  titulo: string;
  segmento: Obra['segmento'];
  servicos?: (string | null)[] | null;
  cliente?: { nome?: string; tipo?: TipoCliente } | null;
  cidade: string;
  uf: Obra['uf'];
  coordenadas?: { lat: number; lng: number } | null;
  inicio: string;
  termino?: string | null;
  status: Obra['status'];
  extensao?: Obra['extensao'] | null;
  diferencialTecnico?: string | null;
  descricao: string;
  capa?: RawImagem | null;
  galeria?: (RawImagem | null)[] | null;
  antesDepois?: { antes?: RawImagem | null; depois?: RawImagem | null } | null;
  destaque?: boolean | null;
  seo?: Obra['seo'] | null;
}

const OBRA_PROJECAO = `{
  "slug": slug.current,
  titulo, segmento,
  "servicos": servicos[]->slug.current,
  "cliente": cliente->{nome, tipo},
  cidade, uf,
  "coordenadas": coordenadas{lat, lng},
  inicio, termino, status,
  extensao{valor, unidade},
  diferencialTecnico, descricao,
  ${IMG('capa')},
  "galeria": galeria[]{alt, asset, crop, hotspot, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, "lqip": asset->metadata.lqip},
  "antesDepois": select(defined(antesDepois.antes.asset) && defined(antesDepois.depois.asset) => {
    "antes": antesDepois.antes{alt, asset, crop, hotspot, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, "lqip": asset->metadata.lqip},
    "depois": antesDepois.depois{alt, asset, crop, hotspot, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, "lqip": asset->metadata.lqip}
  }),
  destaque,
  seo{titulo, descricao}
}`;

/** Obra sem slug ou sem capa é ignorada (dado incompleto nunca derruba a página). */
const OBRA_BASE = `_type == "obra" && ${PUBLICADO} && defined(slug.current) && defined(capa.asset)`;

function mapObra(raw: RawObra | null | undefined): Obra | null {
  if (!raw) return null;
  const capa = imagemOuNull(raw.capa);
  if (!raw.slug || !capa) return null;

  const galeria = (raw.galeria ?? []).map(imagemOuNull).filter((i): i is Imagem => i !== null);
  const antes = imagemOuNull(raw.antesDepois?.antes);
  const depois = imagemOuNull(raw.antesDepois?.depois);
  const seo = raw.seo ? semNulos(raw.seo) : undefined;

  return {
    slug: raw.slug,
    titulo: raw.titulo,
    segmento: raw.segmento,
    servicos: (raw.servicos ?? []).filter((s): s is string => !!s),
    ...(raw.cliente?.nome && raw.cliente.tipo
      ? { cliente: { nome: raw.cliente.nome, tipo: raw.cliente.tipo } }
      : {}),
    cidade: raw.cidade,
    uf: raw.uf,
    ...(raw.coordenadas ? { coordenadas: { lat: raw.coordenadas.lat, lng: raw.coordenadas.lng } } : {}),
    inicio: raw.inicio,
    ...(raw.termino ? { termino: raw.termino } : {}),
    status: raw.status,
    ...(raw.extensao?.valor != null && raw.extensao.unidade
      ? { extensao: { valor: raw.extensao.valor, unidade: raw.extensao.unidade } }
      : {}),
    ...(raw.diferencialTecnico ? { diferencialTecnico: raw.diferencialTecnico } : {}),
    descricao: raw.descricao,
    capa,
    galeria,
    ...(antes && depois ? { antesDepois: { antes, depois } } : {}),
    destaque: !!raw.destaque,
    ...(seo && Object.keys(seo).length ? { seo } : {}),
  };
}

const mapObras = (raws: RawObra[] | null | undefined): Obra[] =>
  (raws ?? []).map(mapObra).filter((o): o is Obra => o !== null);

// ---------- servico / cliente / numero ----------

interface RawServico {
  slug: string;
  titulo: string;
  segmento: Servico['segmento'];
  resumo: string;
  escopo?: string[] | null;
  etapas?: { titulo: string; descricao: string }[] | null;
  equipamentos?: string[] | null;
  imagem?: RawImagem | null;
  seo?: Servico['seo'] | null;
}

const SERVICO_PROJECAO = `{
  "slug": slug.current, titulo, segmento, resumo, escopo,
  "etapas": etapas[]{titulo, descricao},
  equipamentos,
  ${IMG('imagem')},
  seo{titulo, descricao}
}`;
const SERVICO_BASE = `_type == "servico" && ${PUBLICADO} && defined(slug.current) && defined(imagem.asset)`;

function mapServico(raw: RawServico | null | undefined): Servico | null {
  const imagem = imagemOuNull(raw?.imagem);
  if (!raw || !raw.slug || !imagem) return null;
  const seo = raw.seo ? semNulos(raw.seo) : undefined;
  return {
    slug: raw.slug,
    titulo: raw.titulo,
    segmento: raw.segmento,
    resumo: raw.resumo,
    escopo: raw.escopo ?? [],
    etapas: (raw.etapas ?? []).map((e) => ({ titulo: e.titulo, descricao: e.descricao })),
    equipamentos: raw.equipamentos ?? [],
    imagem,
    ...(seo && Object.keys(seo).length ? { seo } : {}),
  };
}

interface RawCliente {
  nome: string;
  tipo: TipoCliente;
  site?: string | null;
  ordem?: number | null;
  logo?: RawImagem | null;
}

function mapCliente(raw: RawCliente): Cliente | null {
  const logo = imagemOuNull(raw.logo);
  if (!logo) return null;
  return {
    nome: raw.nome,
    tipo: raw.tipo,
    logo,
    ordem: raw.ordem ?? 0,
    ...(raw.site ? { site: raw.site } : {}),
  };
}

// ---------- singletons ----------

interface RawConfiguracoes extends Omit<Configuracoes, 'emailsLead' | 'redes' | 'siglaValores'> {
  emailsLead: { obrasCivis: string; infraestrutura: string };
  redes?: Configuracoes['redes'] | null;
  siglaValores?: string | null;
}

async function singleton<T>(type: keyof typeof TAGS, id: string, projecao: string): Promise<T> {
  const doc = await fetchSanity<T | null>(
    `*[_id == $id && ${PUBLICADO}][0]${projecao}`,
    { id },
    TAGS[type],
  );
  if (!doc) throw new Error(`Documento "${id}" não encontrado no Sanity. Crie e publique-o no Studio.`);
  return doc;
}

// ---------- fonte ----------

export const sanitySource: ContentSource = {
  async getObras() {
    const raws = await fetchSanity<RawObra[]>(
      `*[${OBRA_BASE}] | order(inicio desc) ${OBRA_PROJECAO}`,
      {},
      TAGS.obra,
    );
    return mapObras(raws);
  },

  async getObra(slug) {
    const raw = await fetchSanity<RawObra | null>(
      `*[${OBRA_BASE} && slug.current == $slug][0] ${OBRA_PROJECAO}`,
      { slug },
      TAGS.obra,
    );
    return mapObra(raw);
  },

  async getObrasDestaque() {
    const raws = await fetchSanity<RawObra[]>(
      `*[${OBRA_BASE} && destaque == true] | order(inicio desc) [0...6] ${OBRA_PROJECAO}`,
      {},
      TAGS.obra,
    );
    return mapObras(raws);
  },

  async getObrasPorServico(servico) {
    const raws = await fetchSanity<RawObra[]>(
      `*[${OBRA_BASE} && $servico in servicos[]->slug.current] | order(inicio desc) ${OBRA_PROJECAO}`,
      { servico },
      TAGS.obra,
    );
    return mapObras(raws);
  },

  async getServicos() {
    const raws = await fetchSanity<RawServico[]>(
      `*[${SERVICO_BASE}] | order(ordem asc, titulo asc) ${SERVICO_PROJECAO}`,
      {},
      TAGS.servico,
    );
    return (raws ?? []).map(mapServico).filter((s): s is Servico => s !== null);
  },

  async getServico(slug) {
    const raw = await fetchSanity<RawServico | null>(
      `*[${SERVICO_BASE} && slug.current == $slug][0] ${SERVICO_PROJECAO}`,
      { slug },
      TAGS.servico,
    );
    return mapServico(raw);
  },

  async getClientes() {
    const raws = await fetchSanity<RawCliente[]>(
      `*[_type == "cliente" && ${PUBLICADO} && defined(logo.asset)] | order(ordem asc) {
        nome, tipo, site, ordem, ${IMG('logo')}
      }`,
      {},
      TAGS.cliente,
    );
    return (raws ?? []).map(mapCliente).filter((c): c is Cliente => c !== null);
  },

  async getNumeros() {
    const raws = await fetchSanity<Numero[]>(
      `*[_type == "numero" && ${PUBLICADO}] | order(ordem asc, rotulo asc) {
        rotulo, valor, unidade, fonte, dataReferencia
      }`,
      {},
      TAGS.numero,
    );
    return (raws ?? []).map((n) => semNulos(n));
  },

  async getConfiguracoes() {
    const raw = await singleton<RawConfiguracoes>(
      'configuracoes',
      'configuracoes',
      `{razaoSocial, cnpj, endereco{logradouro, cidade, uf, cep}, telefone, horario, whatsapp,
        emailsLead{obrasCivis, infraestrutura}, canalDenunciasUrl, emailCarreiras, emailFornecedores,
        emailImprensa, "redes": redes[]{rede, url}, siglaValores}`,
    );
    const { emailsLead, redes, siglaValores, ...resto } = raw;
    return {
      ...resto,
      emailsLead: { 'obras-civis': emailsLead.obrasCivis, infraestrutura: emailsLead.infraestrutura },
      redes: redes ?? [],
      ...(siglaValores ? { siglaValores } : {}),
    };
  },

  async getPaginaEmpresa() {
    const raw = await singleton<
      Omit<PaginaEmpresa, 'marcos' | 'valores' | 'principios'> & {
        marcos?: (Omit<PaginaEmpresa['marcos'][number], 'imagem'> & { imagem?: RawImagem | null })[] | null;
        valores?: PaginaEmpresa['valores'] | null;
        principios?: string[] | null;
      }
    >(
      'paginaEmpresa',
      'paginaEmpresa',
      `{comoTrabalhamos, missao, visao,
        "marcos": marcos[]{ano, titulo, descricao, ${IMG('imagem')}},
        "valores": valores[]{titulo, descricao}, principios}`,
    );
    return {
      comoTrabalhamos: raw.comoTrabalhamos,
      missao: raw.missao,
      visao: raw.visao,
      marcos: (raw.marcos ?? [])
        .map((m) => {
          const imagem = imagemOuNull(m.imagem);
          return { ano: m.ano, titulo: m.titulo, descricao: m.descricao, ...(imagem ? { imagem } : {}) };
        })
        .sort((a, b) => a.ano - b.ano),
      valores: (raw.valores ?? []).map((v) => ({ titulo: v.titulo, descricao: v.descricao })),
      principios: raw.principios ?? [],
    };
  },

  async getPaginaLegal(slug) {
    const doc = await singleton<Omit<PaginaLegal, 'slug'>>(
      'paginaLegal',
      `paginaLegal-${slug}`,
      `{titulo, versao, vigencia, corpo}`,
    ).catch((e: unknown) => {
      throw new Error(`Página legal não encontrada: ${slug}. ${(e as Error).message}`);
    });
    // O slug identifica o singleton pelo _id; não é um campo editável.
    return { slug, titulo: doc.titulo, versao: doc.versao, vigencia: doc.vigencia, corpo: doc.corpo };
  },
};
