import {
  Building2,
  CalendarRange,
  ClipboardCheck,
  DraftingCompass,
  Droplets,
  FileText,
  Hammer,
  Handshake,
  Layers,
  Route,
  SearchCheck,
  ShieldCheck,
  Shovel,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import type { Diferencial, IconeServico } from "@/lib/content/types";

/** Ícone de cada `Servico.icone` (lucide, SVG inline). */
export const SERVICO_ICONES: Record<IconeServico, LucideIcon> = {
  estrada: Route,
  terraplanagem: Shovel,
  drenagem: Droplets,
  "base-operacional": Warehouse,
  edificio: Building2,
  reforma: Hammer,
  fundacao: Layers,
  fiscalizacao: SearchCheck,
  projeto: DraftingCompass,
  laudo: FileText,
};

/** Ícone de cada `Diferencial.icone`. */
export const DIFERENCIAL_ICONES: Record<Diferencial["icone"], LucideIcon> = {
  controle: ClipboardCheck,
  seguranca: ShieldCheck,
  planejamento: CalendarRange,
  atendimento: Handshake,
};
