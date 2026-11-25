import { defineField, defineType } from 'sanity';

export const paginaLegal = defineType({
  name: 'paginaLegal',
  title: 'Página legal',
  type: 'document',
  // O slug (privacidade/cookies) vem do _id fixo do singleton (paginaLegal-<slug>), não de um campo.
  fields: [
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
