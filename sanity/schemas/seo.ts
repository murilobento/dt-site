import { defineField, defineType } from 'sanity';

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({ name: 'titulo', title: 'Título para buscadores', type: 'string', validation: (r) => r.max(60) }),
    defineField({ name: 'descricao', title: 'Descrição para buscadores', type: 'text', rows: 3, validation: (r) => r.max(160) }),
  ],
});
