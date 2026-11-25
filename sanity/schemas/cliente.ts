import { defineField, defineType } from 'sanity';
import { imagem, TIPOS_CLIENTE } from './fields';

export const cliente = defineType({
  name: 'cliente',
  title: 'Cliente',
  type: 'document',
  fields: [
    defineField({ name: 'nome', title: 'Nome', type: 'string', validation: (r) => r.required() }),
    imagem('logo', 'Logo'),
    defineField({
      name: 'tipo',
      title: 'Tipo',
      type: 'string',
      options: { list: TIPOS_CLIENTE, layout: 'radio' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'site', title: 'Site', type: 'url', validation: (r) => r.uri({ scheme: ['https', 'http'] }) }),
    defineField({ name: 'ordem', title: 'Ordem de exibição', type: 'number', validation: (r) => r.required() }),
  ],
  orderings: [{ title: 'Ordem', name: 'ordem', by: [{ field: 'ordem', direction: 'asc' }] }],
  preview: { select: { title: 'nome', subtitle: 'tipo', media: 'logo' } },
});
