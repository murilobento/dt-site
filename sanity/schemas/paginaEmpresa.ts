import { defineField, defineType } from 'sanity';
import { imagem } from './fields';

export const paginaEmpresa = defineType({
  name: 'paginaEmpresa',
  title: 'Página Sobre',
  type: 'document',
  fields: [
    defineField({ name: 'comoTrabalhamos', title: 'Como trabalhamos', type: 'text', rows: 5, validation: (r) => r.required() }),
    defineField({
      name: 'marcos',
      title: 'Marcos da história',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'marco',
          fields: [
            defineField({ name: 'ano', title: 'Ano', type: 'number', validation: (r) => r.required().integer().min(1900) }),
            defineField({ name: 'titulo', title: 'Título', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'descricao', title: 'Descrição', type: 'text', rows: 3, validation: (r) => r.required() }),
            imagem('imagem', 'Imagem', { required: false }),
          ],
          preview: { select: { title: 'titulo', subtitle: 'ano' } },
        },
      ],
    }),
    defineField({ name: 'missao', title: 'Missão', type: 'text', rows: 3, validation: (r) => r.required() }),
    defineField({ name: 'visao', title: 'Visão', type: 'text', rows: 3, validation: (r) => r.required() }),
    defineField({
      name: 'valores',
      title: 'Valores',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'valor',
          fields: [
            defineField({ name: 'titulo', title: 'Título', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'descricao', title: 'Descrição', type: 'text', rows: 3, validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'titulo' } },
        },
      ],
    }),
    defineField({ name: 'principios', title: 'Princípios', type: 'array', of: [{ type: 'string' }] }),
  ],
  preview: { prepare: () => ({ title: 'Página Sobre' }) },
});
