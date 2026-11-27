"use client";

import Script from "next/script";
import { useConsent } from "./ConsentProvider";

/**
 * Só monta (e portanto só pede algo ao Google) com consentimento de desempenho.
 * Consent Mode v2: tudo `denied` por padrão; `update` concede conforme as categorias.
 */
export function GtmLoader() {
  const { state } = useConsent();
  const id = process.env.NEXT_PUBLIC_GTM_ID;
  if (!id || !state?.desempenho) return null;

  const grant = (v: boolean) => (v ? "granted" : "denied");
  const inline = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
gtag('consent','update',{analytics_storage:'${grant(state.desempenho)}',ad_storage:'${grant(state.marketing)}',ad_user_data:'${grant(state.marketing)}',ad_personalization:'${grant(state.marketing)}'});
dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});`;

  return (
    <>
      <Script id="gtm-consent" strategy="afterInteractive">{inline}</Script>
      <Script
        id="gtm-loader"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`}
      />
    </>
  );
}
