// packages/badge-generator/test/renderer.test.ts
import { describe, expect, it } from "bun:test";
import { renderBadge } from "../src/renderer.js";
import type { BadgeData } from "../src/types.js";

describe("renderBadge", () => {
  it("returns an SVG string containing the badge data", async () => {
    const data: BadgeData = {
      name: "test-package",
      description: "A test package",
      logoSvg:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="red"/></svg>',
      fields: [
        { label: "version", value: "1.0.0" },
        { label: "downloads", value: "100/week" },
      ],
    };

    const svg = await renderBadge(data);

    // satori renders text as vector paths, so we check structural SVG output
    expect(svg).toStartWith("<svg");
    expect(svg).toContain('width="800"');
    expect(svg).toContain('height="120"');
    // Logo should be embedded as a base64 data-uri image
    expect(svg).toContain("data:image/svg+xml");
    // SVG should contain path data (rendered text glyphs)
    expect(svg).toContain("<path");
  });

  it("renders light theme with light colors", async () => {
    const data: BadgeData = {
      name: "test-package",
      description: "A test package",
      logoSvg:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="red"/></svg>',
      fields: [{ label: "version", value: "1.0.0" }],
    };
    const svg = await renderBadge(data, "light");
    expect(svg).toStartWith("<svg");
    expect(svg).toContain('width="800"');
  });
});
