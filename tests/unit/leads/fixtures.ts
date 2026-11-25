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
} as unknown as Configuracoes;
