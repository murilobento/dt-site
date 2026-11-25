"use client";

import { useConsent } from "./ConsentProvider";

export function PreferencesButton({ className }: { className?: string }) {
  const { openPreferences } = useConsent();
  return (
    <button type="button" onClick={openPreferences} className={className}>
      Preferências de cookies
    </button>
  );
}
