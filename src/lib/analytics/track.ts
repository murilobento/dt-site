import { parseConsent, readConsentCookieRaw } from "@/lib/consent/consent";

export type AnalyticsEvent = "lead_submit" | "cta_click" | "whatsapp_click" | "project_view" | "filter_use";

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

/** No-op sem consentimento de desempenho; a decisão vem sempre do cookie. */
export function track(event: AnalyticsEvent, params: Record<string, string | number> = {}): void {
  if (typeof document === "undefined") return;
  if (!parseConsent(readConsentCookieRaw())?.desempenho) return;
  (window.dataLayer ??= []).push({ event, ...params });
}
