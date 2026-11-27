import localFont from "next/font/local";

// Fontes variáveis auto-hospedadas (@fontsource-variable), subset latin.
const jost = localFont({
  src: "../../node_modules/@fontsource-variable/jost/files/jost-latin-wght-normal.woff2",
  weight: "500 700",
  display: "swap",
  variable: "--font-jost",
});

const radioCanadaBig = localFont({
  src: "../../node_modules/@fontsource-variable/radio-canada-big/files/radio-canada-big-latin-wght-normal.woff2",
  weight: "400 700",
  display: "swap",
  variable: "--font-radio-canada-big",
});

const sourceCodePro = localFont({
  src: "../../node_modules/@fontsource-variable/source-code-pro/files/source-code-pro-latin-wght-normal.woff2",
  weight: "500 600",
  display: "swap",
  variable: "--font-source-code-pro",
});

/** Classes das três famílias; vão no `<html>` do site. */
export const FONT_VARIABLES = `${jost.variable} ${radioCanadaBig.variable} ${sourceCodePro.variable}`;
