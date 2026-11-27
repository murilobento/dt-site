import { defineField } from 'sanity';

export const SEGMENTOS = [
  { title: 'Obras civis', value: 'obras-civis' },
  { title: 'Infraestrutura', value: 'infraestrutura' },
];

export const CATEGORIAS_SERVICO = [
  { title: 'Infraestrutura rodoviária', value: 'infraestrutura' },
  { title: 'Edificações e reformas', value: 'edificacoes' },
  { title: 'Consultoria técnica', value: 'consultoria' },
];

export const ICONES_SERVICO = [
  'estrada', 'terraplanagem', 'drenagem', 'base-operacional', 'edificio',
  'reforma', 'fundacao', 'fiscalizacao', 'projeto', 'laudo',
];

export const CATEGORIAS_OBRA = [
  { title: 'Rodoviária e drenagem', value: 'rodoviaria' },
  { title: 'SAUs e PREs', value: 'saupre' },
  { title: 'Edificações e reformas', value: 'edificacoes' },
];

export const TIPOS_CLIENTE = [
  { title: 'Concessionária', value: 'concessionaria' },
  { title: 'Público', value: 'publico' },
  { title: 'Privado', value: 'privado' },
];

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
].map((v) => ({ title: v, value: v }));

const ANO_MES = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Imagem com texto alternativo obrigatório (WCAG); `alt: ""` só se decorativa, mas aqui nunca é vazio. */
export function imagem(name: string, title: string, opts: { required?: boolean } = {}) {
  return defineField({
    name,
    title,
    type: 'image',
    options: { hotspot: true },
    fields: [
      defineField({
        name: 'alt',
        title: 'Texto alternativo',
        description: 'Descreva o que se vê e onde. Para logos, use o nome do cliente.',
        type: 'string',
        validation: (rule) => rule.required().min(3),
      }),
    ],
    validation: opts.required === false ? undefined : (rule) => rule.required(),
  });
}

/** Mês no formato AAAA-MM (ex.: 2025-03). */
export function anoMes(name: string, title: string, opts: { required?: boolean } = {}) {
  return defineField({
    name,
    title,
    description: 'Formato AAAA-MM, por exemplo 2025-03.',
    type: 'string',
    validation: (rule) => {
      const r = rule.regex(ANO_MES, { name: 'AAAA-MM', invert: false }).error('Use o formato AAAA-MM.');
      return opts.required ? r.required() : r;
    },
  });
}

export function slugField(source = 'titulo') {
  return defineField({
    name: 'slug',
    title: 'Slug (endereço)',
    description: 'Parte final da URL. Mudar o slug muda o endereço da página.',
    type: 'slug',
    options: { source, maxLength: 96 },
    validation: (rule) => rule.required(),
  });
}
