import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (!process.env.SENTRY_DSN) return;
  if (process.env.NEXT_RUNTIME === "nodejs") await import("../sentry.server.config");
  if (process.env.NEXT_RUNTIME === "edge") await import("../sentry.edge.config");
}

/** Erros de requisição no servidor; sem DSN o SDK não está inicializado e isto não faz nada. */
export const onRequestError = Sentry.captureRequestError;
