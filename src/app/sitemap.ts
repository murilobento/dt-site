import type { MetadataRoute } from "next";
import { getContentSource } from "@/lib/content/source";
import { STATIC_PATHS } from "@/lib/redirects";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const source = getContentSource();
  const [servicos, obras] = await Promise.all([source.getServicos(), source.getObras()]);
  return [
    ...STATIC_PATHS.map((p) => ({ url: `${site}${p === "/" ? "/" : p}` })),
    ...servicos.map((s) => ({ url: `${site}/servicos/${s.slug}` })),
    ...obras.map((o) => ({
      url: `${site}/obras/${o.slug}`,
      ...(o.atualizadoEm && { lastModified: o.atualizadoEm }),
    })),
  ];
}
