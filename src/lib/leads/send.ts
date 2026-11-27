import { Resend } from "resend";
import { SEGMENTO_LABEL } from "@/lib/segmentos";
import type { Candidatura } from "./candidatura";
import type { Lead } from "./schema";

const DEFAULT_FROM = "Site DT <site@dtconstrutora.com.br>";

const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export function buildSubject(lead: Lead, unverified = false): string {
  return `${unverified ? "[não verificado] " : ""}[Site] Lead ${lead.segmento} — ${oneLine(lead.empresa)}`;
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

type Message = { to: string; replyTo: string; subject: string; text: string; logLine: string };

/** Envia por Resend; lança em falha. Sem RESEND_API_KEY apenas registra `logLine`, que nunca deve conter dados pessoais. */
async function deliver({ to, replyTo, subject, text, logLine }: Message): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Em produção a ausência da chave descarta a mensagem: precisa aparecer como erro no monitoramento.
    const log = process.env.NODE_ENV === "production" ? console.error : console.info;
    log(logLine);
    return;
  }
  const { error } = await new Resend(apiKey).emails.send({
    from: process.env.LEAD_FROM_EMAIL || DEFAULT_FROM,
    to,
    replyTo,
    subject,
    text,
  });
  if (error) throw new Error(`Resend: ${error.name}`);
}

export async function sendLeadEmail(lead: Lead, to: string, opts: { unverified?: boolean } = {}): Promise<void> {
  return deliver({
    to,
    replyTo: lead.email,
    subject: buildSubject(lead, opts.unverified),
    text: buildText(lead),
    logLine: `[leads] RESEND_API_KEY ausente, transporte log: lead segmento=${lead.segmento}`,
  });
}

export function buildCandidaturaSubject(c: Candidatura, unverified = false): string {
  return `${unverified ? "[não verificado] " : ""}[Site] Candidatura — ${oneLine(c.area)}`;
}

function buildCandidaturaText(c: Candidatura): string {
  return [
    `Área de interesse: ${c.area}`,
    "",
    `Nome: ${c.nome}`,
    `E-mail: ${c.email}`,
    `Telefone / WhatsApp: ${c.telefone}`,
    "",
    "Resumo de experiência / link para currículo:",
    c.resumo,
  ].join("\n");
}

export async function sendCandidaturaEmail(c: Candidatura, to: string, opts: { unverified?: boolean } = {}): Promise<void> {
  return deliver({
    to,
    replyTo: c.email,
    subject: buildCandidaturaSubject(c, opts.unverified),
    text: buildCandidaturaText(c),
    logLine: "[leads] RESEND_API_KEY ausente, transporte log: candidatura recebida",
  });
}
