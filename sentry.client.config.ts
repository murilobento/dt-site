import * as Sentry from "@sentry/nextjs";

/** No-op sem NEXT_PUBLIC_SENTRY_DSN. Nunca envia PII. Carregado por instrumentation-client.ts. */
export function initSentryClient() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    sendDefaultPii: false,
    tracesSampleRate: 0,
  });
}
