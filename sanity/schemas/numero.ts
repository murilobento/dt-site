import { defineField, defineType } from 'sanity';
import { anoMes } from './fields';

export const numero = defineType({
  name: 'numero',
  title: 'Número da empresa',
  type: 'document',
  fields: [
    defineField({ name: 'rotulo', title: 'Rótulo', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'valor', title: 'Valor', type: 'number', validation: (r) => r.required() }),
    defineField({ name: 'unidade', title: 'Unidade', type: 'string', description: 'Ex.: km, m². Vazio para contagens.' }),
    defineField({
      name: 'fonte',
      title: 'Fonte do dado',
      description: 'De onde vem o número (contrato, medição, relatório). Obrigatório: não publicamos número sem fonte.',
      type: 'string',
      validation: (r) => r.required(),
    }),
    anoMes('dataReferencia', 'Data de referência', { required: true }),
    defineField({ name: 'ordem', title: 'Ordem de exibição', type: 'number', initialValue: 0 }),
  ],
  preview: { select: { title: 'rotulo', subtitle: 'dataReferencia' } },
});
