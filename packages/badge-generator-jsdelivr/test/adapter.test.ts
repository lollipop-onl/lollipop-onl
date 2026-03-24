import { describe, expect, it } from "bun:test";
import { jsdelivrToBadgeData } from "../src/adapter.js";
import type { JsDelivrPackageInfo } from "../src/api.js";

describe("jsdelivrToBadgeData", () => {
  it("converts JsDelivrPackageInfo to BadgeData", () => {
    const info: JsDelivrPackageInfo = {
      name: "docsify-shiki",
      description: "A docsify plugin",
      version: "2.0.0",
      license: "MIT",
      lastUpdate: "2024-06-01",
      weeklyHits: 5000,
    };
    const badge = jsdelivrToBadgeData(info);
    expect(badge.name).toBe("docsify-shiki");
    expect(badge.logoSvg).toContain("<svg");
    expect(badge.fields).toEqual([
      { label: "version", value: "2.0.0" },
      { label: "hits", value: "5000/week" },
      { label: "updated", value: "2024-06-01" },
      { label: "license", value: "MIT" },
    ]);
  });
});
