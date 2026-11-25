/**
 * Importa as fixtures (src/lib/content/fixtures/*.json + public/fixtures/*.webp) para o Sanity.
 * Idempotente: `_id` = `<tipo>-<slug>` (singletons têm id fixo) e usa createOrReplace;
 * o upload de imagem deduplica por hash. Rodar de novo apenas sobrescreve com as fixtures.
 *
 * Uso (ver docs/sanity-setup.md):
 *   npx tsx --env-file=.env.local scripts/seed-sanity.ts [--dry-run]
 * Variáveis: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.
 * ATENÇÃO: sobrescreve documentos com os mesmos _id. Não rode em dataset com conteúdo real editado.
 */
import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { createClient } from 'next-sanity';
import type { Cliente, Configuracoes, Imagem, Numero, Obra, PaginaEmpresa, PaginaLegal, Servico } from '../src/lib/content/types';

const ROOT = join(__dirname, '..');
const FIXTURES = join(ROOT, 'src/lib/content/fixtures');
const PUBLIC = join(ROOT, 'public');
const dryRun = process.argv.includes('--dry-run');

const json = <T>(f: string): T => JSON.parse(readFileSync(join(FIXTURES, f), 'utf8')) as T;

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!dryRun && (!projectId || !token)) {
  console.error('Defina NEXT_PUBLIC_SANITY_PROJECT_ID e SANITY_API_WRITE_TOKEN (token com permissão de escrita).');
  process.exit(1);
}

const client = createClient({
  projectId: projectId ?? 'dry-run',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  useCdn: false,
  token,
});

const slugify = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const ref = (id: string) => ({ _type: 'reference' as const, _ref: id });
const key = (prefix: string, i: number) => `${prefix}${i}`;

const uploaded = new Map<string, string>();
async function imagem(img: Imagem) {
  let assetId = uploaded.get(img.url);
  if (!assetId) {
    if (dryRun) {
      assetId = `image-dry-run-${basename(img.url)}`;
    } else {
      const asset = await client.assets.upload('image', readFileSync(join(PUBLIC, img.url)), {
        filename: basename(img.url),
      });
      assetId = asset._id;
    }
    uploaded.set(img.url, assetId);
  }
  return { _type: 'image' as const, alt: img.alt, asset: ref(assetId) };
}

const slug = (s: string) => ({ _type: 'slug' as const, current: s });

async function build() {
  const docs: Record<string, unknown>[] = [];
  const servicos = json<Servico[]>('servicos.json');
  const clientes = json<Cliente[]>('clientes.json');
  const obras = json<Obra[]>('obras.json');
  const numeros = json<Numero[]>('numeros.json');
  const cfg = json<Configuracoes>('configuracoes.json');
  const empresa = json<PaginaEmpresa>('paginaEmpresa.json');
  const legais = json<PaginaLegal[]>('paginasLegais.json');

  const clientePorNome = new Map(clientes.map((c) => [c.nome, `cliente-${slugify(c.nome)}`]));
  const servicoId = (s: string) => `servico-${s}`;

  for (const [i, s] of servicos.entries()) {
    docs.push({
      _id: servicoId(s.slug), _type: 'servico', titulo: s.titulo, slug: slug(s.slug), segmento: s.segmento,
      ordem: i, resumo: s.resumo, escopo: s.escopo, equipamentos: s.equipamentos,
      etapas: s.etapas.map((e, j) => ({ _key: key('etapa', j), _type: 'etapa', ...e })),
      imagem: await imagem(s.imagem), ...(s.seo ? { seo: { _type: 'seo', ...s.seo } } : {}),
    });
  }

  for (const c of clientes) {
    docs.push({
      _id: clientePorNome.get(c.nome), _type: 'cliente', nome: c.nome, tipo: c.tipo, ordem: c.ordem,
      ...(c.site ? { site: c.site } : {}), logo: await imagem(c.logo),
    });
  }

  for (const o of obras) {
    const clienteId = o.cliente ? clientePorNome.get(o.cliente.nome) : undefined;
    if (o.cliente && !clienteId) throw new Error(`Obra ${o.slug}: cliente "${o.cliente.nome}" não está em clientes.json`);
    docs.push({
      _id: `obra-${o.slug}`, _type: 'obra', titulo: o.titulo, slug: slug(o.slug), segmento: o.segmento,
      servicos: o.servicos.map((s, j) => ({ _key: key('srv', j), ...ref(servicoId(s)) })),
      ...(clienteId ? { cliente: ref(clienteId) } : {}),
      cidade: o.cidade, uf: o.uf,
      ...(o.coordenadas ? { coordenadas: { _type: 'geopoint', lat: o.coordenadas.lat, lng: o.coordenadas.lng } } : {}),
      inicio: o.inicio, ...(o.termino ? { termino: o.termino } : {}), status: o.status,
      ...(o.extensao ? { extensao: o.extensao } : {}),
      ...(o.diferencialTecnico ? { diferencialTecnico: o.diferencialTecnico } : {}),
      descricao: o.descricao, capa: await imagem(o.capa),
      galeria: await Promise.all(o.galeria.map(async (g, j) => ({ _key: key('gal', j), ...(await imagem(g)) }))),
      ...(o.antesDepois
        ? { antesDepois: { antes: await imagem(o.antesDepois.antes), depois: await imagem(o.antesDepois.depois) } }
        : {}),
      destaque: o.destaque, ...(o.seo ? { seo: { _type: 'seo', ...o.seo } } : {}),
    });
  }

  for (const [i, n] of numeros.entries()) {
    docs.push({ _id: `numero-${slugify(n.rotulo)}`, _type: 'numero', ...n, ordem: i });
  }

  docs.push({
    _id: 'configuracoes', _type: 'configuracoes', ...cfg,
    emailsLead: { obrasCivis: cfg.emailsLead['obras-civis'], infraestrutura: cfg.emailsLead.infraestrutura },
    redes: cfg.redes.map((r, i) => ({ _key: key('rede', i), _type: 'redeSocial', ...r })),
  });

  docs.push({
    _id: 'paginaEmpresa', _type: 'paginaEmpresa', comoTrabalhamos: empresa.comoTrabalhamos,
    missao: empresa.missao, visao: empresa.visao, principios: empresa.principios,
    valores: empresa.valores.map((v, i) => ({ _key: key('val', i), _type: 'valor', ...v })),
    marcos: await Promise.all(
      empresa.marcos.map(async (m, i) => ({
        _key: key('marco', i), _type: 'marco', ano: m.ano, titulo: m.titulo, descricao: m.descricao,
        ...(m.imagem ? { imagem: await imagem(m.imagem) } : {}),
      })),
    ),
  });

  for (const p of legais) docs.push({ _id: `paginaLegal-${p.slug}`, _type: 'paginaLegal', ...p });

  return docs;
}

async function main() {
  const docs = await build();
  if (dryRun) {
    console.log(`[dry-run] ${docs.length} documentos:`);
    for (const d of docs) console.log(`  ${d._type}\t${d._id}`);
    return;
  }
  const tx = docs.reduce((t, d) => t.createOrReplace(d as never), client.transaction());
  await tx.commit();
  console.log(`${docs.length} documentos publicados (createOrReplace).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
