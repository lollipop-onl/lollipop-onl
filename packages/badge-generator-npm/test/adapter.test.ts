import { describe, expect, it } from "bun:test";
import { npmToBadgeData } from "../src/adapter.js";
import type { NpmPackageInfo } from "../src/api.js";

describe("npmToBadgeData", () => {
  it("converts NpmPackageInfo to BadgeData", () => {
    const info: NpmPackageInfo = {
      name: "@lollipop-onl/myzod-to-zod",
      description: "Codemod for migrating myzod to zod",
      version: "1.2.3",
      license: "MIT",
      lastUpdate: "2024-01-15",
      weeklyDownloads: 120,
    };

    const badge = npmToBadgeData(info);

    expect(badge.name).toBe("@lollipop-onl/myzod-to-zod");
    expect(badge.description).toBe("Codemod for migrating myzod to zod");
    expect(badge.logoSvg).toContain("<svg");
    expect(badge.fields).toEqual([
      { label: "version", value: "1.2.3" },
      { label: "downloads", value: "120/week" },
      { label: "updated", value: "2024-01-15" },
      { label: "license", value: "MIT" },
    ]);
  });
});
