import type { Configuracoes } from "@/lib/content/types";

export const valido = {
  nome: "João Silva",
  empresa: "Prefeitura de Exemplo",
  cargo: "Engenheiro",
  email: "joao@empresa.com.br",
  telefone: "(18) 99999-0000",
  segmento: "infraestrutura",
  tipoObra: "Restauração de rodovia",
  local: "Presidente Prudente, SP",
  mensagem: "Precisamos de uma proposta para restauração de 12 km.",
  consentimento: true,
  origem: "restauracao",
} as const;

export const cfg = {
  emailsLead: { "obras-civis": "obras-civis@example.com", infraestrutura: "infra@example.com" },
  emailCarreiras: "carreiras@example.com",
} as unknown as Configuracoes;

export const candidaturaValida = {
  nome: "Maria Souza",
  email: "maria@exemplo.com.br",
  telefone: "(18) 98888-0000",
  area: "Segurança do Trabalho",
  resumo: "Técnica em segurança, 6 anos de obras viárias. Currículo: https://exemplo.com/cv",
  consentimento: true,
} as const;
