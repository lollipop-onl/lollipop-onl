import { describe, expect, it } from "bun:test";
import { fetchNpmPackageInfo } from "../src/api.js";

describe("fetchNpmPackageInfo", () => {
  it("fetches package info from npm registry", async () => {
    const info = await fetchNpmPackageInfo("satori");

    expect(info.name).toBe("satori");
    expect(info.description).toBeString();
    expect(info.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(info.license).toBeString();
    expect(info.lastUpdate).toBeString();
    expect(info.weeklyDownloads).toBeNumber();
  });

  it("returns null for non-existent packages", async () => {
    const info = await fetchNpmPackageInfo(
      "@lollipop-onl/this-package-does-not-exist-12345",
    );
    expect(info).toBeNull();
  });
});
