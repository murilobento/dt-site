export type NavItem = { label: string; href: string };

/** Menu principal do layout: 6 itens, sem "Mais". */
export const NAV_ITEMS: NavItem[] = [
  { label: "Serviços", href: "/servicos" },
  { label: "Obras", href: "/obras" },
  { label: "Consultoria", href: "/servicos#consultoria" },
  { label: "Sobre Nós", href: "/sobre" },
  { label: "Compliance", href: "/compliance" },
  { label: "Contato", href: "/contato" },
];

export const CTA = { label: "Solicitar proposta", href: "/contato" } as const;

/** Item ativo: o caminho atual (sem hash) é o do item; /obras/* conta como Obras. "Consultoria" é âncora de /servicos e não fica ativo. */
export function isNavActive(item: NavItem, pathname: string): boolean {
  if (item.href.includes("#")) return false;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
