"use client";

import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics/track";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const TITLE_SUFFIX = " | DT Construtora";

function currentPageTitle(): string {
  const title = document.title;
  return title.endsWith(TITLE_SUFFIX) ? title.slice(0, -TITLE_SUFFIX.length) : title;
}

export function WhatsAppButton({ phone }: { phone: string }) {
  const pathname = usePathname();
  // href base (sem título) para SSR/sem JS; o título real é lido no clique.
  const baseHref = buildWhatsAppUrl(phone, pathname);

  return (
    <a
      href={baseHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp (abre em nova aba)"
      onClick={(e) => {
        e.currentTarget.href = buildWhatsAppUrl(phone, pathname, currentPageTitle());
        track("whatsapp_click", { pagina: pathname });
      }}
      className="fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-text-on-inverse shadow-overlay hover:bg-brand-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary lg:right-6"
      style={{ bottom: "calc(var(--cookie-banner-h, 0px) + 16px)" }}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
        <path d="M12.04 2a9.93 9.93 0 0 0-8.5 15.04L2 22l5.1-1.34A9.94 9.94 0 1 0 12.04 2Zm0 18.1a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.02.8.8-2.94-.2-.31a8.1 8.1 0 1 1 6.85 3.76Zm4.44-6.06c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06a6.6 6.6 0 0 1-1.95-1.2 7.3 7.3 0 0 1-1.35-1.68c-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.47-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.5.58.18 1.1.16 1.51.1.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
      </svg>
    </a>
  );
}
