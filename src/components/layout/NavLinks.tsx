"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isNavActive } from "@/lib/nav";

/** Links do menu principal (desktop). O item ativo ganha sublinhado laranja e aria-current. */
export function NavLinks() {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-7">
      {NAV_ITEMS.map((item) => {
        const active = isNavActive(item, pathname);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap font-label text-label-lg transition-colors duration-state-change ease-state-change ${
                active
                  ? "border-b-2 border-accent pb-1 text-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
