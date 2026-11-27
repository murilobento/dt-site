/**
 * URL pública do site, sem barra final. Usada em JSON-LD, sitemap e canonical.
 * Ordem: NEXT_PUBLIC_SITE_URL → https://VERCEL_PROJECT_PRODUCTION_URL → localhost (nunca em produção na Vercel).
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  let raw: string;
  if (explicit) {
    raw = explicit;
  } else if (vercelHost) {
    raw = `https://${vercelHost}`;
  } else if (process.env.VERCEL_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL não definida em produção: canonical, sitemap e JSON-LD apontariam para localhost. Defina a variável na Vercel.",
    );
  } else {
    raw = "http://localhost:3000";
  }
  return raw.replace(/\/+$/, "");
}
