import { describe, expect, it } from "bun:test";
import {
  BADGE_COLORS,
  colorScale,
  versionColor,
  downloadsColor,
  ageColor,
} from "../src/colors.js";

describe("colorScale", () => {
  const thresholds = [90, 80, 70, 60];
  const colors = ["A", "B", "C", "D", "E"];

  it("returns the first color when value exceeds highest threshold", () => {
    expect(colorScale(95, thresholds, colors)).toBe("A");
    expect(colorScale(90, thresholds, colors)).toBe("A");
  });

  it("returns intermediate colors", () => {
    expect(colorScale(85, thresholds, colors)).toBe("B");
    expect(colorScale(75, thresholds, colors)).toBe("C");
    expect(colorScale(65, thresholds, colors)).toBe("D");
  });

  it("returns the last color when value is below all thresholds", () => {
    expect(colorScale(50, thresholds, colors)).toBe("E");
  });
});

describe("versionColor", () => {
  it("returns blue for stable versions", () => {
    expect(versionColor("1.0.0")).toBe(BADGE_COLORS.blue);
    expect(versionColor("2.3.1")).toBe(BADGE_COLORS.blue);
  });

  it("returns orange for pre-release versions", () => {
    expect(versionColor("1.0.0-beta")).toBe(BADGE_COLORS.orange);
    expect(versionColor("2.0.0-rc.1")).toBe(BADGE_COLORS.orange);
  });

  it("returns orange for 0.x versions", () => {
    expect(versionColor("0.1.0")).toBe(BADGE_COLORS.orange);
    expect(versionColor("v0.2.3")).toBe(BADGE_COLORS.orange);
  });

  it("returns red for unknown", () => {
    expect(versionColor("unknown")).toBe(BADGE_COLORS.red);
  });
});

describe("downloadsColor", () => {
  it("returns brightgreen for >= 1M", () => {
    expect(downloadsColor(1_500_000)).toBe(BADGE_COLORS.brightgreen);
  });

  it("returns green for >= 100k", () => {
    expect(downloadsColor(200_000)).toBe(BADGE_COLORS.green);
  });

  it("returns yellowgreen for >= 10k", () => {
    expect(downloadsColor(50_000)).toBe(BADGE_COLORS.yellowgreen);
  });

  it("returns yellow for >= 1k", () => {
    expect(downloadsColor(5_000)).toBe(BADGE_COLORS.yellow);
  });

  it("returns orange for >= 100", () => {
    expect(downloadsColor(500)).toBe(BADGE_COLORS.orange);
  });

  it("returns red for < 100", () => {
    expect(downloadsColor(50)).toBe(BADGE_COLORS.red);
  });
});

describe("ageColor", () => {
  it("returns brightgreen for very recent dates", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(ageColor(yesterday.toISOString().split("T")[0])).toBe(BADGE_COLORS.brightgreen);
  });

  it("returns green for dates within a month", () => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    expect(ageColor(twoWeeksAgo.toISOString().split("T")[0])).toBe(BADGE_COLORS.green);
  });

  it("returns red for very old dates", () => {
    expect(ageColor("2020-01-01")).toBe(BADGE_COLORS.red);
  });

  it("returns red for invalid dates", () => {
    expect(ageColor("invalid")).toBe(BADGE_COLORS.red);
  });
});
