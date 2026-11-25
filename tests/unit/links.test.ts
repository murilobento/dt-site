import { describe, expect, it } from "vitest";
import { leadHref } from "@/lib/links";

describe("leadHref", () => {
  it("inclui segmento e origem", () =>
    expect(leadHref("infraestrutura", "restauracao")).toBe(
      "/contato/comercial?segmento=infraestrutura&origem=restauracao",
    ));
  it("omite origem quando ausente", () =>
    expect(leadHref("obras-civis")).toBe("/contato/comercial?segmento=obras-civis"));
});
