export type NavItem = { label: string; href: string };

/** Menu principal: no máximo 6 itens, sem "Mais". Carreiras entra na Fase 2. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Empresa", href: "/empresa" },
  { label: "Serviços", href: "/servicos" },
  { label: "Obras", href: "/obras" },
  { label: "Contato", href: "/contato" },
];

export const CTA = { label: "Fale com a equipe", href: "/contato/comercial" } as const;
