import type { Configuracoes, Obra } from "@/lib/content/types";

function absolute(siteUrl: string, path: string): string {
  return /^https?:\/\//.test(path) ? path : `${siteUrl}${path}`;
}

export function obraJsonLd(obra: Obra, siteUrl: string): object {
  const images = [obra.capa, ...obra.galeria].map((i) => absolute(siteUrl, i.url));
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: obra.titulo,
    description: obra.seo?.descricao ?? obra.descricao,
    url: `${siteUrl}/obras/${obra.slug}`,
    image: images,
    dateCreated: obra.termino ?? obra.inicio,
    locationCreated: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: obra.cidade,
        addressRegion: obra.uf,
        addressCountry: "BR",
      },
      ...(obra.coordenadas && {
        geo: { "@type": "GeoCoordinates", latitude: obra.coordenadas.lat, longitude: obra.coordenadas.lng },
      }),
    },
    ...(obra.cliente && { sponsor: { "@type": "Organization", name: obra.cliente.nome } }),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function postalAddress(c: Configuracoes): object {
  const { logradouro, cidade, uf, cep } = c.endereco;
  return {
    "@type": "PostalAddress",
    streetAddress: logradouro,
    addressLocality: cidade,
    addressRegion: uf,
    postalCode: cep,
    addressCountry: "BR",
  };
}

export function organizationJsonLd(c: Configuracoes, siteUrl: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: c.razaoSocial,
    legalName: c.razaoSocial,
    url: siteUrl,
    logo: `${siteUrl}/brand/logo.svg`,
    address: postalAddress(c),
    taxID: c.cnpj,
    sameAs: c.redes.map((r) => r.url),
  };
}

export function localBusinessJsonLd(c: Configuracoes, siteUrl: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    name: c.razaoSocial,
    url: `${siteUrl}/contato`,
    image: `${siteUrl}/brand/logo.svg`,
    address: postalAddress(c),
    telephone: c.telefone,
  };
}
