import { describe, expect, it } from "bun:test";
import { replaceBlocks, toSvgFilename } from "../src/build.js";
import type { BadgeBlock } from "../src/parse.js";

describe("toSvgFilename", () => {
  it("converts a simple package name without theme", () => {
    expect(toSvgFilename("copylen")).toBe("copylen.svg");
  });

  it("converts a scoped package name without theme", () => {
    expect(toSvgFilename("@lollipop-onl/myzod-to-zod")).toBe(
      "lollipop-onl-myzod-to-zod.svg",
    );
  });

  it("appends @dark suffix", () => {
    expect(toSvgFilename("copylen", "dark")).toBe("copylen@dark.svg");
  });

  it("appends @light suffix for scoped package", () => {
    expect(toSvgFilename("@lollipop-onl/myzod-to-zod", "light")).toBe(
      "lollipop-onl-myzod-to-zod@light.svg",
    );
  });
});

describe("replaceBlocks", () => {
  it("replaces badge blocks with picture elements", () => {
    const template = `# Hello

\`\`\`badges:npm
@lollipop-onl/myzod-to-zod
copylen
\`\`\`

Footer.`;

    const block: BadgeBlock = {
      platform: "npm",
      packages: ["@lollipop-onl/myzod-to-zod", "copylen"],
      options: {},
      raw: "```badges:npm\n@lollipop-onl/myzod-to-zod\ncopylen\n```",
    };

    const altTexts: Record<string, string> = {
      "@lollipop-onl/myzod-to-zod": "@lollipop-onl/myzod-to-zod - A codemod (version: 1.0.0)",
      "copylen": "copylen - Copy by length (version: 2.0.0)",
    };
    const result = replaceBlocks(template, [block], altTexts);

    expect(result).toContain('<a href="https://www.npmjs.com/package/@lollipop-onl/myzod-to-zod">');
    expect(result).toContain('<a href="https://www.npmjs.com/package/copylen">');
    expect(result).toContain("<picture>");
    expect(result).toContain('media="(prefers-color-scheme: dark)"');
    expect(result).toContain(
      'srcset="./assets/badges/npm/lollipop-onl-myzod-to-zod@dark.svg"',
    );
    expect(result).toContain(
      'srcset="./assets/badges/npm/lollipop-onl-myzod-to-zod@light.svg"',
    );
    expect(result).toContain(
      'srcset="./assets/badges/npm/copylen@dark.svg"',
    );
    expect(result).toContain(
      'srcset="./assets/badges/npm/copylen@light.svg"',
    );
    expect(result).toContain('alt="@lollipop-onl/myzod-to-zod - A codemod (version: 1.0.0)"');
    expect(result).toContain("# Hello");
    expect(result).toContain("Footer.");
    expect(result).not.toContain("```badges:npm");
  });
});
