import type { Metadata } from "next";
import "./globals.css";
import { SiteDocument } from "@/components/layout/SiteDocument";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "DT Construtora",
  description: "DT Construtora e Consultoria",
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument>{children}</SiteDocument>;
}
