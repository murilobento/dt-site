import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("next.config images", () => {
  it("permite imagens do cdn.sanity.io em AVIF/WebP", () => {
    expect(nextConfig.images?.remotePatterns).toContainEqual({
      protocol: "https",
      hostname: "cdn.sanity.io",
      pathname: "/images/**",
    });
    expect(nextConfig.images?.formats).toEqual(["image/avif", "image/webp"]);
  });
});
