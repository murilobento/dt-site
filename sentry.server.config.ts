import * as Sentry from "@sentry/nextjs";

/** No-op sem SENTRY_DSN. Nunca envia PII. */
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    sendDefaultPii: false,
    tracesSampleRate: 0,
  });
}
