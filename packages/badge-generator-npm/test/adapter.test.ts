import { describe, expect, it } from "bun:test";
import { BADGE_COLORS } from "@lollipop-onl/badge-generator";
import { npmToBadgeData } from "../src/adapter.js";
import type { NpmPackageInfo } from "../src/api.js";

describe("npmToBadgeData", () => {
  it("converts NpmPackageInfo to BadgeData with dynamic colors", () => {
    const info: NpmPackageInfo = {
      name: "@lollipop-onl/myzod-to-zod",
      description: "Codemod for migrating myzod to zod",
      version: "1.2.3",
      license: "MIT",
      lastUpdate: "2024-01-15",
      weeklyDownloads: 120,
      deprecated: false,
      createdAt: "2023-01-01",
    };

    const badge = npmToBadgeData(info);

    expect(badge.name).toBe("@lollipop-onl/myzod-to-zod");
    expect(badge.description).toBe("Codemod for migrating myzod to zod");
    expect(badge.logoSvg).toContain("<svg");
    expect(badge.fields).toHaveLength(4);
    expect(badge.fields[0]).toEqual({ label: "version", value: "1.2.3", color: BADGE_COLORS.blue });
    expect(badge.fields[1]).toEqual({ label: "downloads", value: "120/week", color: BADGE_COLORS.orange });
    expect(badge.fields[3]).toEqual({ label: "license", value: "MIT", color: BADGE_COLORS.blue });
  });

  it("uses orange for pre-release versions", () => {
    const info: NpmPackageInfo = {
      name: "test",
      description: "test",
      version: "1.0.0-beta.1",
      license: "MIT",
      lastUpdate: "2024-01-15",
      weeklyDownloads: 0,
      deprecated: false,
      createdAt: "2023-01-01",
    };

    const badge = npmToBadgeData(info);
    expect(badge.fields[0].color).toBe(BADGE_COLORS.orange);
  });
});
