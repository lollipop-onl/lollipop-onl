import { describe, expect, it } from "bun:test";
import { parseTemplate } from "../src/parse.js";

const TEMPLATE = `# Hello

Some text.

\`\`\`badges:npm
@lollipop-onl/myzod-to-zod
@passport-mrz/builder
\`\`\`

More text.

\`\`\`badges:npm
copylen
\`\`\`

Footer.`;

describe("parseTemplate", () => {
  it("extracts all badge blocks with platform and package names", () => {
    const blocks = parseTemplate(TEMPLATE);

    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toEqual({
      platform: "npm",
      packages: ["@lollipop-onl/myzod-to-zod", "@passport-mrz/builder"],
      options: {},
      raw: "```badges:npm\n@lollipop-onl/myzod-to-zod\n@passport-mrz/builder\n```",
    });
    expect(blocks[1]).toEqual({
      platform: "npm",
      packages: ["copylen"],
      options: {},
      raw: "```badges:npm\ncopylen\n```",
    });
  });

  it("parses options from the header line", () => {
    const template = `\`\`\`badges:jsdelivr logo=docsify
docsify-shiki
\`\`\``;
    const blocks = parseTemplate(template);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].platform).toBe("jsdelivr");
    expect(blocks[0].options).toEqual({ logo: "docsify" });
    expect(blocks[0].packages).toEqual(["docsify-shiki"]);
  });

  it("returns empty array when no badge blocks exist", () => {
    const blocks = parseTemplate("# Just a normal README");
    expect(blocks).toEqual([]);
  });
});
