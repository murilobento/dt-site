import { defineField, defineType } from 'sanity';

export const paginaCompliance = defineType({
  name: 'paginaCompliance',
  title: 'Página Compliance',
  type: 'document',
  fields: [
    defineField({
      name: 'pilares',
      title: 'Pilares do programa de integridade e SSMA',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'pilar',
          fields: [
            defineField({ name: 'titulo', title: 'Título', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'descricao', title: 'Descrição', type: 'text', rows: 3, validation: (r) => r.required() }),
            defineField({
              name: 'icone',
              title: 'Ícone',
              type: 'string',
              options: { list: ['etica', 'seguranca', 'ambiental'] },
              validation: (r) => r.required(),
            }),
            defineField({ name: 'itens', title: 'Itens', type: 'array', of: [{ type: 'string' }] }),
          ],
          preview: { select: { title: 'titulo' } },
        },
      ],
    }),
    defineField({
      name: 'vagas',
      title: 'Vagas abertas',
      description: 'Deixe vazio para ocultar a lista de vagas.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'vaga',
          fields: [
            defineField({ name: 'titulo', title: 'Título', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'requisito', title: 'Requisito', type: 'string' }),
            defineField({ name: 'regime', title: 'Regime', type: 'string' }),
            defineField({ name: 'descricao', title: 'Descrição', type: 'text', rows: 3, validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'titulo', subtitle: 'regime' } },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Página Compliance' }) },
});
