/** URL pública do site, sem barra final. Usada em JSON-LD, sitemap e canonical. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}
