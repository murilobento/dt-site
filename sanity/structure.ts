import type { StructureResolver } from 'sanity/structure';

/** Singletons: documento único com `_id` fixo (o site os consulta por esse id). */
const SINGLETONS = [
  { id: 'configuracoes', type: 'configuracoes', title: 'Configurações do site' },
  { id: 'paginaEmpresa', type: 'paginaEmpresa', title: 'Página Empresa' },
  { id: 'paginaCompliance', type: 'paginaCompliance', title: 'Página Compliance' },
  { id: 'paginaLegal-privacidade', type: 'paginaLegal', title: 'Política de privacidade' },
  { id: 'paginaLegal-cookies', type: 'paginaLegal', title: 'Política de cookies' },
] as const;

export const SINGLETON_TYPES = new Set<string>(SINGLETONS.map((s) => s.type));

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Conteúdo')
    .items([
      S.documentTypeListItem('obra').title('Obras'),
      S.documentTypeListItem('servico').title('Serviços'),
      S.documentTypeListItem('cliente').title('Clientes'),
      S.documentTypeListItem('numero').title('Números'),
      S.divider(),
      ...SINGLETONS.map((s) =>
        S.listItem()
          .id(s.id)
          .title(s.title)
          .child(S.document().schemaType(s.type).documentId(s.id).title(s.title)),
      ),
    ]);
