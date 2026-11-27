"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useConsent } from "./ConsentProvider";

const CHECK = "mt-1 h-5 w-5 accent-primary";

/** Montado só com o diálogo aberto: o estado inicial vem da decisão salva, nunca pré-marcado. */
function PreferencesForm() {
  const { state, save } = useConsent();
  const [desempenho, setDesempenho] = useState(state?.desempenho ?? false);
  const [marketing, setMarketing] = useState(state?.marketing ?? false);

  return (
    <form
      className="mt-6 flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        save({ desempenho, marketing });
      }}
    >
      <label className="flex gap-3">
        <input type="checkbox" className={CHECK} checked disabled readOnly />
        <span>
          <span className="block font-label text-label-lg">Essenciais</span>
          <span className="block font-body text-body-md text-on-surface-variant">
            Necessários para o site funcionar e lembrar esta escolha. Sempre ativos.
          </span>
        </span>
      </label>
      <label className="flex gap-3">
        <input
          type="checkbox"
          className={CHECK}
          checked={desempenho}
          onChange={(e) => setDesempenho(e.target.checked)}
        />
        <span>
          <span className="block font-label text-label-lg">Desempenho</span>
          <span className="block font-body text-body-md text-on-surface-variant">
            Medem como o site é usado, para melhorarmos páginas e conteúdo.
          </span>
        </span>
      </label>
      <label className="flex gap-3">
        <input
          type="checkbox"
          className={CHECK}
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
        />
        <span>
          <span className="block font-label text-label-lg">Marketing</span>
          <span className="block font-body text-body-md text-on-surface-variant">
            Permitem medir campanhas e mostrar anúncios mais relevantes.
          </span>
        </span>
      </label>
      <p className="font-body text-body-md text-on-surface-variant">
        Ao retirar um consentimento, a página será recarregada para aplicar a mudança.
      </p>
      <Button type="submit" variant="accent">Salvar preferências</Button>
    </form>
  );
}

function PreferencesDialog() {
  const { preferencesOpen, setPreferencesOpen } = useConsent();
  return (
    <Dialog.Root open={preferencesOpen} onOpenChange={setPreferencesOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-brand-navy/50" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-[70] max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-surface-container-lowest p-6 text-on-surface"
        >
          <Dialog.Title className="font-headline text-headline-md text-primary">Preferências de cookies</Dialog.Title>
          <PreferencesForm />
          <Dialog.Close
            aria-label="Fechar"
            className="absolute right-4 top-4 min-h-12 min-w-12 text-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span aria-hidden="true">×</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function CookieBanner() {
  const { state, ready, save, openPreferences } = useConsent();
  // O banner vai no HTML do servidor (entra no primeiro paint em vez de surgir só após a hidratação,
  // o que o tornava o LCP). Quem já decidiu não o vê: o script do layout marca `data-consent="decided"`
  // antes do paint e o CSS esconde o `data-ssr`; depois de hidratar, só o estado do React manda.
  const visible = !ready || state === null;
  const ref = useRef<HTMLElement>(null);

  // Expõe a altura do banner para outros elementos fixos (ex.: botão do WhatsApp).
  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    if (!visible || !el) return;
    const update = () => root.style.setProperty("--cookie-banner-h", `${el.offsetHeight}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--cookie-banner-h");
    };
  }, [visible]);

  return (
    <>
      {visible && (
        <section
          ref={ref}
          role="region"
          aria-label="Cookies"
          data-cookie-banner
          data-ssr={ready ? undefined : ""}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-outline-variant bg-surface-container-lowest text-on-surface shadow-none"
        >
          <div className="mx-auto flex w-full max-w-page flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-3xl font-body text-body-md">
              Usamos cookies essenciais para o site funcionar e, com a sua permissão, cookies de desempenho e
              marketing. Saiba mais na{" "}
              <Link href="/cookies" className="font-semibold underline underline-offset-4">
                Política de Cookies
              </Link>
              .
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" onClick={() => save({ desempenho: false, marketing: false })}>
                Recusar opcionais
              </Button>
              <Button variant="secondary" onClick={() => save({ desempenho: true, marketing: true })}>
                Aceitar todos
              </Button>
              <Button variant="ghost" onClick={openPreferences}>
                Preferências
              </Button>
            </div>
          </div>
        </section>
      )}
      <PreferencesDialog />
    </>
  );
}
