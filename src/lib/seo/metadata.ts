import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

export const SITE_NAME = "DT Construtora";
/** Sufixo exato removido pelo WhatsAppButton de document.title; não alterar. */
export const TITLE_SUFFIX = ` | ${SITE_NAME}`;

export interface BuildMetadataInput {
  title: string;
  description: string;
  /** Caminho começando em "/" (sem query string). */
  path: string;
  image?: { url: string; width?: number; height?: number; alt?: string };
  /** Usa `title` como está, sem o sufixo " | DT Construtora" (home). */
  absoluteTitle?: boolean;
}

export function buildMetadata({ title, description, path, image, absoluteTitle }: BuildMetadataInput): Metadata {
  const fullTitle = absoluteTitle ? title : `${title}${TITLE_SUFFIX}`;
  const url = `${getSiteUrl()}${path}`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url,
      ...(image && { images: [image] }),
    },
  };
}
