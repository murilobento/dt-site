// Import dinâmico sob a variável pública: sem DSN o bundler descarta o ramo e o
// cliente não baixa nada do Sentry (mantém o Lighthouse).
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  void import("../sentry.client.config").then((m) => m.initSentryClient());
}
