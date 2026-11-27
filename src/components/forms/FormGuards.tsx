"use client";

import Link from "next/link";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: { reset: () => void };
  }
}

/** Honeypot: invisível para pessoas e leitores de tela. */
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

/** Widget do Cloudflare Turnstile; sem site key (dev/e2e offline) não renderiza nada. */
export function TurnstileWidget() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;
  return (
    <>
      <div className="cf-turnstile" data-sitekey={siteKey} data-appearance="interaction-only" data-response-field-name="cf-turnstile-response" />
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
    </>
  );
}

/** Após um erro: o token do Turnstile é de uso único, e o foco vai ao primeiro campo inválido (ou à mensagem geral). */
export function recoverAfterError(form: HTMLFormElement | null) {
  window.turnstile?.reset();
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
