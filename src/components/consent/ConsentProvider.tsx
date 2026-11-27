"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { pushConsentUpdate } from "@/lib/analytics/gtag";
import {
  clearGaCookies,
  parseConsent,
  readConsentCookieRaw,
  revokesConsent,
  writeConsentCookie,
  type ConsentChoice,
  type ConsentState,
} from "@/lib/consent/consent";

interface ConsentContextValue {
  /** `null` = sem decisão válida. */
  state: ConsentState | null;
  /** `false` até a hidratação: o banner não aparece antes de lermos o cookie. */
  ready: boolean;
  save(s: ConsentChoice): void;
  openPreferences(): void;
  preferencesOpen: boolean;
  setPreferencesOpen(open: boolean): void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => void listeners.delete(cb);
}
const getSnapshot = () => readConsentCookieRaw();
// `null` no servidor e na hidratação: páginas seguem estáticas e sem flash do banner.
const getServerSnapshot = () => null;

export function ConsentProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const state = useMemo(() => (raw === null ? null : parseConsent(raw)), [raw]);

  const save = useCallback((s: ConsentChoice) => {
    const revokes = revokesConsent(parseConsent(readConsentCookieRaw()), s);
    writeConsentCookie(s);
    pushConsentUpdate(s);
    listeners.forEach((l) => l());
    setPreferencesOpen(false);
    if (revokes) {
      // O GTM já carregado não "descarrega": limpa os cookies do GA e recarrega.
      clearGaCookies();
      window.location.reload();
    }
  }, []);

  const openPreferences = useCallback(() => setPreferencesOpen(true), []);

  const value = useMemo<ConsentContextValue>(
    () => ({ state, ready: raw !== null, save, openPreferences, preferencesOpen, setPreferencesOpen }),
    [state, raw, save, openPreferences, preferencesOpen],
  );
  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent deve ser usado dentro de ConsentProvider");
  return ctx;
}
