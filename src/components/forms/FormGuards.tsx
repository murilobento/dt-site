"use client";

import Link from "next/link";
import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

interface TurnstileApi {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/** Atributo do contêiner com o id do widget; permite o reset a partir do formulário. */
const WIDGET_ID_ATTR = "data-turnstile-widget-id";

/** Honeypot: invisível para pessoas e leitores de tela. */
/** Legenda "* Campos obrigatórios", ao lado do botão de envio. */
export function RequiredLegend() {
  return <p className="font-label text-label-sm text-on-surface-variant">* Campos obrigatórios</p>;
}

export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Não preencha este campo
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

/**
 * Widget do Cloudflare Turnstile; sem site key (dev/e2e offline) não renderiza nada.
 * Renderização explícita: o api.js só processa `.cf-turnstile` implícitos na primeira carga, então após uma
 * navegação client-side o widget sumiria. Aqui cada montagem chama `turnstile.render` e a desmontagem, `remove`.
 * O Turnstile injeta o input `cf-turnstile-response` dentro do contêiner, que fica dentro do <form>.
 */
export function TurnstileWidget() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const renderWidget = useCallback(() => {
    const container = containerRef.current;
    const api = window.turnstile;
    if (!siteKey || !container || !api || widgetIdRef.current !== null) return;
    const id = api.render(container, {
      sitekey: siteKey,
      appearance: "interaction-only",
      "response-field-name": "cf-turnstile-response",
    });
    widgetIdRef.current = id;
    container.setAttribute(WIDGET_ID_ATTR, id);
  }, [siteKey]);

  useEffect(() => {
    const container = containerRef.current;
    // Script já carregado (navegação client-side); senão o onReady do <Script> chama renderWidget.
    renderWidget();
    return () => {
      const id = widgetIdRef.current;
      widgetIdRef.current = null;
      container?.removeAttribute(WIDGET_ID_ATTR);
      if (id !== null) window.turnstile?.remove(id);
    };
  }, [renderWidget]);

  if (!siteKey) return null;
  return (
    <>
      <div ref={containerRef} />
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="lazyOnload"
        onReady={renderWidget}
      />
    </>
  );
}

/** Após um erro: o token do Turnstile é de uso único, e o foco vai ao primeiro campo inválido (ou à mensagem geral). */
export function recoverAfterError(form: HTMLFormElement | null) {
  const widgetId = form?.querySelector(`[${WIDGET_ID_ATTR}]`)?.getAttribute(WIDGET_ID_ATTR);
  if (widgetId) window.turnstile?.reset(widgetId);
  const first = form?.querySelector<HTMLElement>("[aria-invalid='true']");
  (first ?? form?.querySelector<HTMLElement>("[data-form-message]"))?.focus();
}

/** Checkbox de consentimento LGPD, nunca pré-marcada, com link para a Política de Privacidade. */
export function ConsentField({ error, children }: { error?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id="consentimento"
          name="consentimento"
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "consentimento-erro" : undefined}
          className="mt-1 h-5 w-5 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
        <label htmlFor="consentimento" className="font-body text-body-md text-on-surface">
          {children}{" "}
          <Link href="/privacidade" className="underline underline-offset-4">
            Política de Privacidade
          </Link>
          .
        </label>
      </div>
      {error && (
        <p id="consentimento-erro" className="mt-2 font-body text-body-md text-error">
          {error}
        </p>
      )}
    </div>
  );
}
