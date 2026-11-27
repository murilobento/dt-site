import { defineField, defineType } from 'sanity';
import { UFS } from './fields';

const email = (name: string, title: string) =>
  defineField({ name, title, type: 'string', validation: (r) => r.required().email() });

export const configuracoes = defineType({
  name: 'configuracoes',
  title: 'Configurações do site',
  type: 'document',
  fields: [
    defineField({ name: 'razaoSocial', title: 'Razão social', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'cnpj', title: 'CNPJ', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'endereco',
      title: 'Endereço',
      type: 'object',
      validation: (r) => r.required(),
      fields: [
        defineField({ name: 'logradouro', title: 'Logradouro', type: 'string', validation: (r) => r.required() }),
        defineField({ name: 'cidade', title: 'Cidade', type: 'string', validation: (r) => r.required() }),
        defineField({ name: 'uf', title: 'UF', type: 'string', options: { list: UFS }, validation: (r) => r.required() }),
        defineField({ name: 'cep', title: 'CEP', type: 'string', validation: (r) => r.required() }),
      ],
    }),
    defineField({ name: 'telefone', title: 'Telefone', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'horario', title: 'Horário de atendimento', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'whatsapp',
      title: 'WhatsApp',
      description: 'Somente dígitos, com DDI e DDD, sem "+". Ex.: 5514999999999.',
      type: 'string',
      validation: (r) => r.required().regex(/^\d{12,13}$/, { name: 'E.164 sem +' }),
    }),
    defineField({
      name: 'emailsLead',
      title: 'E-mails que recebem os contatos',
      type: 'object',
      validation: (r) => r.required(),
      fields: [
        email('obrasCivis', 'Obras civis'),
        email('infraestrutura', 'Infraestrutura'),
      ],
    }),
    defineField({ name: 'canalDenunciasUrl', title: 'Canal de denúncias (URL)', type: 'url', validation: (r) => r.required() }),
    email('emailCarreiras', 'E-mail de carreiras'),
    email('emailFornecedores', 'E-mail de fornecedores'),
    email('emailImprensa', 'E-mail de imprensa'),
    defineField({
      name: 'redes',
      title: 'Redes sociais',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'redeSocial',
          fields: [
            defineField({
              name: 'rede',
              title: 'Rede',
              type: 'string',
              options: { list: ['linkedin', 'instagram', 'youtube', 'facebook'] },
              validation: (r) => r.required(),
            }),
            defineField({ name: 'url', title: 'URL', type: 'url', validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'rede', subtitle: 'url' } },
        },
      ],
    }),
    defineField({
      name: 'diferenciais',
      title: 'Diferenciais (home)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'diferencial',
          fields: [
            defineField({ name: 'titulo', title: 'Título', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'descricao', title: 'Descrição', type: 'text', rows: 3, validation: (r) => r.required() }),
            defineField({
              name: 'icone',
              title: 'Ícone',
              type: 'string',
              options: { list: ['controle', 'seguranca', 'planejamento', 'atendimento'] },
              validation: (r) => r.required(),
            }),
          ],
          preview: { select: { title: 'titulo' } },
        },
      ],
    }),
    defineField({ name: 'siglaValores', title: 'Sigla dos valores', type: 'string' }),
  ],
  preview: { prepare: () => ({ title: 'Configurações do site' }) },
});
