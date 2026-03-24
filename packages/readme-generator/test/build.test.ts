import { describe, expect, it } from "bun:test";
import { replaceBlocks, toSvgFilename } from "../src/build.js";
import type { BadgeBlock } from "../src/parse.js";

describe("toSvgFilename", () => {
  it("converts a simple package name", () => {
    expect(toSvgFilename("copylen")).toBe("copylen.svg");
  });

  it("converts a scoped package name", () => {
    expect(toSvgFilename("@lollipop-onl/myzod-to-zod")).toBe(
      "lollipop-onl-myzod-to-zod.svg",
    );
  });
});

describe("replaceBlocks", () => {
  it("replaces badge blocks with img tags", () => {
    const template = `# Hello

\`\`\`badges:npm
@lollipop-onl/myzod-to-zod
copylen
\`\`\`

Footer.`;

    const block: BadgeBlock = {
      platform: "npm",
      packages: ["@lollipop-onl/myzod-to-zod", "copylen"],
      raw: "```badges:npm\n@lollipop-onl/myzod-to-zod\ncopylen\n```",
    };

    const result = replaceBlocks(template, [block]);

    expect(result).toContain(
      '<img src="./assets/badges/lollipop-onl-myzod-to-zod.svg" alt="@lollipop-onl/myzod-to-zod" width="800">',
    );
    expect(result).toContain(
      '<img src="./assets/badges/copylen.svg" alt="copylen" width="800">',
    );
    expect(result).toContain("# Hello");
    expect(result).toContain("Footer.");
    expect(result).not.toContain("```badges:npm");
  });
});
