import { Resend } from "resend";
import { SEGMENTO_LABEL } from "@/lib/segmentos";
import type { Lead } from "./schema";

const DEFAULT_FROM = "Site DT <site@dtconstrutora.com.br>";

const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export function buildSubject(lead: Lead): string {
  return `[Site] Lead ${lead.segmento} — ${oneLine(lead.empresa)}`;
}

function buildText(lead: Lead): string {
  return [
    `Segmento: ${SEGMENTO_LABEL[lead.segmento]}`,
    `Origem: ${lead.origem || "direto"}`,
    "",
    `Nome: ${lead.nome}`,
    `Empresa: ${lead.empresa}`,
    `Cargo: ${lead.cargo || "-"}`,
    `E-mail: ${lead.email}`,
    `Telefone: ${lead.telefone}`,
    "",
    `Tipo de obra: ${lead.tipoObra}`,
    `Local da obra: ${lead.local}`,
    "",
    "Mensagem:",
    lead.mensagem,
  ].join("\n");
}

/** Envia o lead por Resend; lança em falha. Sem RESEND_API_KEY apenas registra um resumo sem dados pessoais. */
export async function sendLeadEmail(lead: Lead, to: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[leads] transporte log: lead segmento=${lead.segmento} empresa="${oneLine(lead.empresa)}"`);
    return;
  }
  const { error } = await new Resend(apiKey).emails.send({
    from: process.env.LEAD_FROM_EMAIL || DEFAULT_FROM,
    to,
    replyTo: lead.email,
    subject: buildSubject(lead),
    text: buildText(lead),
  });
  if (error) throw new Error(`Resend: ${error.name}`);
}
