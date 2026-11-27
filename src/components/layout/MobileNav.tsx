"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CTA, NAV_ITEMS, isNavActive } from "@/lib/nav";

/** Drawer à direita, só abaixo de 1024 px. Radix cuida de foco preso, Esc e retorno do foco. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  // Ao chegar em >=1024 px o drawer fica oculto por CSS; fecha para não deixar foco preso invisível.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 64rem)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label="Abrir menu"
        className="inline-flex size-12 items-center justify-center rounded-sm border border-outline-variant text-primary hover:bg-surface-container-low lg:hidden"
      >
        <Menu aria-hidden="true" size={24} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-brand-navy/50 lg:hidden" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex h-full w-80 max-w-full flex-col gap-6 bg-surface-container-lowest p-6 text-primary shadow-overlay lg:hidden"
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-title text-title-lg">Menu</Dialog.Title>
            <Dialog.Close
              aria-label="Fechar menu"
              className="inline-flex size-12 items-center justify-center rounded-sm"
            >
              <X aria-hidden="true" size={24} />
            </Dialog.Close>
          </div>
          <nav aria-label="Menu móvel">
            <ul className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={isNavActive(item, pathname) ? "page" : undefined}
                    className={`flex min-h-12 items-center border-b border-outline-variant font-label text-label-lg ${
                      isNavActive(item, pathname) ? "text-primary" : "text-on-surface-variant"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Button href={CTA.href} onClick={close}>
            {CTA.label}
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
