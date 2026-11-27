import { defineField, defineType } from 'sanity';
import { CATEGORIAS_SERVICO, ICONES_SERVICO, imagem, SEGMENTOS, slugField } from './fields';

export const servico = defineType({
  name: 'servico',
  title: 'Serviço',
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
      title: 'Categoria (aba em Serviços)',
      type: 'string',
      options: { list: CATEGORIAS_SERVICO, layout: 'radio' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'subtitulo',
      title: 'Subtítulo',
      description: 'Palavras-chave separadas por " • ". Ex.: CBUQ • Fresagem • Restauração.',
      type: 'string',
    }),
    defineField({ name: 'icone', title: 'Ícone', type: 'string', options: { list: ICONES_SERVICO } }),
    defineField({ name: 'ordem', title: 'Ordem de exibição', type: 'number', initialValue: 0 }),
    defineField({ name: 'resumo', title: 'Resumo', type: 'text', rows: 3, validation: (r) => r.required() }),
    defineField({ name: 'escopo', title: 'Escopo', type: 'array', of: [{ type: 'string' }] }),
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
    defineField({ name: 'equipamentos', title: 'Equipamentos', type: 'array', of: [{ type: 'string' }] }),
    imagem('imagem', 'Imagem'),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
  ],
  preview: { select: { title: 'titulo', subtitle: 'segmento', media: 'imagem' } },
});
