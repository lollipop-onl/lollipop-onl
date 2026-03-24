import { describe, expect, it } from "bun:test";
import { fetchJsDelivrPackageInfo } from "../src/api.js";

describe("fetchJsDelivrPackageInfo", () => {
  it("fetches package info with jsDelivr hits", async () => {
    const info = await fetchJsDelivrPackageInfo("docsify-shiki");
    expect(info).not.toBeNull();
    expect(info!.name).toBe("docsify-shiki");
    expect(info!.description).toBeString();
    expect(info!.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(info!.monthlyHits).toBeNumber();
  });

  it("returns null for non-existent packages", async () => {
    const info = await fetchJsDelivrPackageInfo("@lollipop-onl/this-does-not-exist-99999");
    expect(info).toBeNull();
  });
});
