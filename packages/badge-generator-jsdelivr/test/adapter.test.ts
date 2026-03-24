import { describe, expect, it } from "bun:test";
import { BADGE_COLORS } from "@lollipop-onl/badge-generator";
import { jsdelivrToBadgeData } from "../src/adapter.js";
import type { JsDelivrPackageInfo } from "../src/api.js";

describe("jsdelivrToBadgeData", () => {
  it("converts JsDelivrPackageInfo to BadgeData with dynamic colors", () => {
    const info: JsDelivrPackageInfo = {
      name: "docsify-shiki",
      description: "A docsify plugin",
      version: "2.0.0",
      license: "MIT",
      lastUpdate: "2024-06-01",
      monthlyHits: 5000,
      deprecated: false,
      createdAt: "2023-01-01",
    };
    const badge = jsdelivrToBadgeData(info);
    expect(badge.name).toBe("docsify-shiki");
    expect(badge.logoSvg).toContain("<svg");
    expect(badge.fields).toHaveLength(4);
    expect(badge.fields[0]).toEqual({ label: "version", value: "2.0.0", color: BADGE_COLORS.blue });
    expect(badge.fields[1]).toEqual({ label: "hits", value: "5000/month", color: BADGE_COLORS.yellow });
    expect(badge.fields[3]).toEqual({ label: "license", value: "MIT", color: BADGE_COLORS.blue });
  });
});
