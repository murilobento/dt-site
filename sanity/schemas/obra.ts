import { defineField, defineType } from 'sanity';
import { anoMes, CATEGORIAS_OBRA, imagem, SEGMENTOS, slugField, UFS } from './fields';

const MAX_DESTAQUES = 6;

export const obra = defineType({
  name: 'obra',
  title: 'Obra',
  type: 'document',
  fields: [
    defineField({ name: 'titulo', title: 'Título', type: 'string', validation: (r) => r.required() }),
    slugField(),
    defineField({
      name: 'segmento',
      title: 'Segmento',
      type: 'string',
      options: { list: SEGMENTOS, layout: 'radio' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'categoria',
      title: 'Categoria (filtro do portfólio)',
      type: 'string',
      options: { list: CATEGORIAS_OBRA, layout: 'radio' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'servicos',
      title: 'Serviços',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'servico' }] }],
      validation: (r) => r.unique(),
    }),
    defineField({
      name: 'cliente',
      title: 'Cliente (só se divulgável)',
      description: 'Deixe vazio quando o cliente não puder ser divulgado.',
      type: 'reference',
      to: [{ type: 'cliente' }],
    }),
    defineField({ name: 'cidade', title: 'Cidade', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'uf',
      title: 'UF',
      type: 'string',
      options: { list: UFS },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'coordenadas', title: 'Coordenadas', type: 'geopoint' }),
    anoMes('inicio', 'Início', { required: true }),
    defineField({
      ...anoMes('termino', 'Término'),
      validation: (rule) =>
        rule
          .regex(/^\d{4}-(0[1-9]|1[0-2])$/, { name: 'AAAA-MM' })
          .error('Use o formato AAAA-MM.')
          .custom((termino, context) => {
            const inicio = (context.document as { inicio?: string } | undefined)?.inicio;
            if (!termino || !inicio) return true;
            return termino >= inicio ? true : 'O término não pode ser anterior ao início.';
          }),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Em andamento', value: 'em-andamento' },
          { title: 'Concluída', value: 'concluida' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'extensao',
      title: 'Extensão',
      type: 'object',
      fields: [
        defineField({ name: 'valor', title: 'Valor', type: 'number', validation: (r) => r.required().positive() }),
        defineField({
          name: 'unidade',
          title: 'Unidade',
          type: 'string',
          options: { list: ['km', 'm²'] },
          validation: (r) => r.required(),
        }),
      ],
    }),
    defineField({ name: 'diferencialTecnico', title: 'Diferencial técnico', type: 'text', rows: 3 }),
    defineField({ name: 'codigoContrato', title: 'Código do contrato', type: 'string' }),
    defineField({ name: 'norma', title: 'Norma / órgão', description: 'Ex.: DNIT / DER.', type: 'string' }),
    defineField({ name: 'desafio', title: 'Desafio', type: 'text', rows: 4 }),
    defineField({ name: 'solucao', title: 'Solução', type: 'text', rows: 4 }),
    defineField({
      name: 'quantitativos',
      title: 'Quantitativos',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'quantitativo',
          fields: [
            defineField({ name: 'rotulo', title: 'Rótulo', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'valor', title: 'Valor', type: 'string', validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'rotulo', subtitle: 'valor' } },
        },
      ],
    }),
    defineField({
      name: 'etapas',
      title: 'Etapas',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'etapa',
          fields: [
            defineField({ name: 'titulo', title: 'Título', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'descricao', title: 'Descrição', type: 'text', rows: 3, validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'titulo' } },
        },
      ],
    }),
    defineField({ name: 'descricao', title: 'Descrição', type: 'text', rows: 6, validation: (r) => r.required() }),
    imagem('capa', 'Imagem de capa'),
    defineField({
      name: 'galeria',
      title: 'Galeria',
      type: 'array',
      of: [imagem('imagem', 'Imagem', { required: false })],
    }),
    defineField({
      name: 'antesDepois',
      title: 'Antes e depois',
      type: 'object',
      fields: [imagem('antes', 'Antes'), imagem('depois', 'Depois')],
      validation: (rule) =>
        rule.custom((v) => {
          const o = v as { antes?: unknown; depois?: unknown } | undefined;
          if (!o) return true;
          return o.antes && o.depois ? true : 'Preencha as duas imagens ou apague o bloco.';
        }),
    }),
    defineField({
      name: 'destaque',
      title: 'Destaque na home',
      type: 'boolean',
      initialValue: false,
      validation: (rule) =>
        rule
          .custom(async (value, context) => {
            if (!value) return true;
            const id = (context.document?._id ?? '').replace(/^drafts\./, '');
            const outros = await context
              .getClient({ apiVersion: '2025-01-01' })
              .fetch<number>(
                'count(*[_type == "obra" && destaque == true && !(_id in path("drafts.**")) && _id != $id])',
                { id },
              );
            return outros >= MAX_DESTAQUES
              ? `A home mostra no máximo ${MAX_DESTAQUES} obras em destaque; as demais serão ignoradas.`
              : true;
          })
          .warning(),
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
  ],
  orderings: [
    { title: 'Início (mais recente)', name: 'inicioDesc', by: [{ field: 'inicio', direction: 'desc' }] },
  ],
  preview: { select: { title: 'titulo', subtitle: 'cidade', media: 'capa' } },
});
