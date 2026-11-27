import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { recoverAfterError, TurnstileWidget } from "@/components/forms/FormGuards";

// Simula o next/script: guarda o onReady, que o teste dispara quando "a api.js termina de carregar".
const script = vi.hoisted(() => ({ onReady: undefined as (() => void) | undefined }));
vi.mock("next/script", () => ({
  default: function ScriptMock({ onReady, src }: { onReady?: () => void; src: string }) {
    script.onReady = onReady;
    return <i data-testid="script" data-src={src} />;
  },
}));

function installFakeTurnstile() {
  let n = 0;
  const api = {
    render: vi.fn((_el: HTMLElement, _opts: Record<string, unknown>) => `widget-${++n}`),
    remove: vi.fn(),
    reset: vi.fn(),
  };
  window.turnstile = api;
  return api;
}

describe("TurnstileWidget", () => {
  beforeEach(() => vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "site-key"));
  afterEach(() => {
    vi.unstubAllEnvs();
    delete window.turnstile;
  });

  it("sem site key não renderiza nada nem chama o Turnstile", () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "");
    const api = installFakeTurnstile();
    const { container } = render(<TurnstileWidget />);
    expect(container).toBeEmptyDOMElement();
    expect(api.render).not.toHaveBeenCalled();
  });

  it("renderiza explicitamente ao montar, remove ao desmontar e renderiza de novo ao remontar", () => {
    const api = installFakeTurnstile();
    const first = render(<TurnstileWidget />);
    expect(api.render).toHaveBeenCalledTimes(1);
    const [el, opts] = api.render.mock.calls[0];
    expect(el).toBeInstanceOf(HTMLDivElement);
    expect(opts).toMatchObject({ sitekey: "site-key", appearance: "interaction-only", "response-field-name": "cf-turnstile-response" });
    expect(first.getByTestId("script")).toHaveAttribute("data-src", expect.stringContaining("render=explicit"));

    first.unmount();
    expect(api.remove).toHaveBeenCalledWith("widget-1");

    render(<TurnstileWidget />);
    expect(api.render).toHaveBeenCalledTimes(2);
  });

  it("não renderiza em duplicidade quando o onReady dispara com o widget já criado", () => {
    const api = installFakeTurnstile();
    render(<TurnstileWidget />);
    script.onReady?.();
    expect(api.render).toHaveBeenCalledTimes(1);
  });

  it("renderiza quando a api.js só chega depois da montagem (onReady)", () => {
    render(<TurnstileWidget />);
    const api = installFakeTurnstile();
    expect(api.render).not.toHaveBeenCalled();
    script.onReady?.();
    expect(api.render).toHaveBeenCalledTimes(1);
  });

  it("recoverAfterError reseta o widget do formulário pelo id", () => {
    const api = installFakeTurnstile();
    const { container } = render(
      <form>
        <TurnstileWidget />
      </form>,
    );
    recoverAfterError(container.querySelector("form"));
    expect(api.reset).toHaveBeenCalledWith("widget-1");
  });
});
