import { describe, expect, it } from "vitest";
import { resolveLeadRecipient } from "@/lib/leads/routing";
import { cfg } from "./fixtures";

describe("resolveLeadRecipient", () => {
  it("roteia por segmento", () => {
    expect(resolveLeadRecipient("infraestrutura", cfg)).toBe(cfg.emailsLead.infraestrutura);
    expect(resolveLeadRecipient("obras-civis", cfg)).toBe(cfg.emailsLead["obras-civis"]);
  });
});
