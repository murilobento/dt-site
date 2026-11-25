import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DT Construtora",
  description: "DT Construtora e Consultoria",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
