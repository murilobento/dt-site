import type { ConsentChoice } from "@/lib/consent/consent";

/**
 * GTM só processa comandos de consentimento empurrados como objeto `Arguments`
 * (snippet padrão do Google); um array comum é ignorado. Por isso `arguments`.
 */
export function gtag(..._declared: unknown[]): void {
  void _declared;
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

/** Consent Mode v2: `update` derivado da escolha. Desempenho → analytics; marketing → ad_*. */
export function pushConsentUpdate(s: ConsentChoice): void {
  const g = (v: boolean) => (v ? "granted" : "denied");
  gtag("consent", "update", {
    analytics_storage: g(s.desempenho),
    ad_storage: g(s.marketing),
    ad_user_data: g(s.marketing),
    ad_personalization: g(s.marketing),
  });
}
