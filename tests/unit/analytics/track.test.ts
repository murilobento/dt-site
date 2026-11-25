import { beforeEach, describe, expect, it } from "vitest";
import { CONSENT_COOKIE, serializeConsent } from "@/lib/consent/consent";
import { track } from "@/lib/analytics/track";

function setConsent(s: { desempenho: boolean } | null) {
  document.cookie = s
    ? `${CONSENT_COOKIE}=${encodeURIComponent(serializeConsent({ desempenho: s.desempenho, marketing: false }))}; path=/`
    : `${CONSENT_COOKIE}=; path=/; max-age=0`;
}

describe("track", () => {
  beforeEach(() => {
    setConsent(null);
    delete (window as { dataLayer?: unknown }).dataLayer;
  });

  it("não empurra nada sem consentimento de desempenho", () => {
    setConsent(null);
    track("cta_click");
    expect(window.dataLayer ?? []).toHaveLength(0);
  });

  it("não empurra evento quando o desempenho foi recusado", () => {
    setConsent({ desempenho: false });
    track("cta_click");
    expect(window.dataLayer ?? []).toHaveLength(0);
  });

  it("empurra evento com consentimento", () => {
    setConsent({ desempenho: true });
    track("cta_click", { local: "hero" });
    expect(window.dataLayer.at(-1)).toEqual({ event: "cta_click", local: "hero" });
  });
});
