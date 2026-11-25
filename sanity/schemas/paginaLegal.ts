import { defineField, defineType } from 'sanity';

export const paginaLegal = defineType({
  name: 'paginaLegal',
  title: 'Página legal',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      title: 'Página',
      type: 'string',
      options: {
        list: [
          { title: 'Política de privacidade', value: 'privacidade' },
          { title: 'Política de cookies', value: 'cookies' },
        ],
        layout: 'radio',
      },
      readOnly: true,
      validation: (r) => r.required(),
    }),
    defineField({ name: 'titulo', title: 'Título', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'versao', title: 'Versão', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'vigencia',
      title: 'Vigência',
      description: 'Data de início da vigência (AAAA-MM-DD).',
      type: 'date',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'corpo',
      title: 'Texto',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: 'titulo', subtitle: 'versao' } },
});
