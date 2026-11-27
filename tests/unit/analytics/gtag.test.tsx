import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ConsentProvider, useConsent } from "@/components/consent/ConsentProvider";
import { gtag } from "@/lib/analytics/gtag";

const tag = (x: unknown) => Object.prototype.toString.call(x);

beforeEach(() => {
  document.cookie = "dt_consent=; path=/; max-age=0";
  window.dataLayer = [];
});

describe("gtag", () => {
  it("empurra um objeto Arguments, não um array", () => {
    gtag("consent", "update", { analytics_storage: "granted" });
    const last = window.dataLayer.at(-1);
    expect(tag(last)).toBe("[object Arguments]");
    expect(Array.from(last as ArrayLike<unknown>)).toEqual(["consent", "update", { analytics_storage: "granted" }]);
  });
});

describe("save() empurra consent update derivado da escolha", () => {
  function setup() {
    let api!: ReturnType<typeof useConsent>;
    function Probe() {
      api = useConsent();
      return null;
    }
    render(<ConsentProvider><Probe /></ConsentProvider>);
    return () => api;
  }

  it("só desempenho: analytics granted, ad_storage denied", () => {
    const get = setup();
    act(() => get().save({ desempenho: true, marketing: false }));
    const last = window.dataLayer.at(-1);
    expect(tag(last)).toBe("[object Arguments]");
    const [cmd, kind, params] = Array.from(last as ArrayLike<unknown>);
    expect([cmd, kind]).toEqual(["consent", "update"]);
    expect(params).toMatchObject({
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  });
});
