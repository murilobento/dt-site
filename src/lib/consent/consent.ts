export type ConsentCategory = "essenciais" | "desempenho" | "marketing";

export interface ConsentState {
  version: 1;
  /** ISO 8601 */
  decidedAt: string;
  /** `essenciais` é sempre verdadeiro e não é armazenado. */
  desempenho: boolean;
  marketing: boolean;
}

export type ConsentChoice = Omit<ConsentState, "version" | "decidedAt">;

export const CONSENT_COOKIE = "dt_consent";
export const CONSENT_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

/** Inválido, malformado ou de versão antiga → `null` (o banner volta a perguntar). */
export function parseConsent(raw: string | undefined): ConsentState | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;
  if (
    d.version !== 1 ||
    typeof d.decidedAt !== "string" ||
    typeof d.desempenho !== "boolean" ||
    typeof d.marketing !== "boolean"
  ) {
    return null;
  }
  return { version: 1, decidedAt: d.decidedAt, desempenho: d.desempenho, marketing: d.marketing };
}

export function serializeConsent(s: ConsentChoice, now: Date = new Date()): string {
  const state: ConsentState = {
    version: 1,
    decidedAt: now.toISOString(),
    desempenho: s.desempenho,
    marketing: s.marketing,
  };
  return JSON.stringify(state);
}

/** Valor bruto (JSON) do cookie, ou `""` se ausente. Só no navegador. */
export function readConsentCookieRaw(): string {
  const prefix = `${CONSENT_COOKIE}=`;
  const part = document.cookie.split("; ").find((c) => c.startsWith(prefix));
  if (!part) return "";
  try {
    return decodeURIComponent(part.slice(prefix.length));
  } catch {
    return "";
  }
}

/** Grava o cookie; `Secure` só em HTTPS para o e2e local em http funcionar. */
export function writeConsentCookie(s: ConsentChoice): void {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${CONSENT_COOKIE}=${encodeURIComponent(serializeConsent(s))}` +
    `; path=/; max-age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

/** Remove `_ga` e `_ga_*` (path=/) no host e nos domínios pai. */
export function clearGaCookies(): void {
  const host = location.hostname;
  const parts = host.split(".");
  const domains = [undefined, host];
  const isIp = /^[\d.]+$/.test(host) || host.includes(":");
  if (!isIp) {
    for (let i = 0; i < parts.length - 1; i++) domains.push(`.${parts.slice(i).join(".")}`);
  }
  const names = document.cookie
    .split("; ")
    .map((c) => c.split("=")[0])
    .filter((n) => n === "_ga" || n.startsWith("_ga_"));
  for (const name of names) {
    for (const d of domains) {
      document.cookie = `${name}=; path=/; max-age=0${d ? `; domain=${d}` : ""}`;
    }
  }
}

/** Alguma categoria concedida antes foi retirada na nova escolha. */
export function revokesConsent(prev: ConsentState | null, next: ConsentChoice): boolean {
  return !!prev && ((prev.desempenho && !next.desempenho) || (prev.marketing && !next.marketing));
}
