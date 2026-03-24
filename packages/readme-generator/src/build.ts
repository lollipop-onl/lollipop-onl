import type { BadgeBlock } from "./parse.js";

export function toSvgFilename(packageName: string): string {
  return packageName.replace(/^@/, "").replace(/\//g, "-") + ".svg";
}

export function replaceBlocks(
  template: string,
  blocks: BadgeBlock[],
): string {
  let result = template;

  for (const block of blocks) {
    const imgTags = block.packages
      .map((pkg) => {
        const filename = toSvgFilename(pkg);
        return `<img src="./assets/badges/${filename}" alt="${pkg}" width="800">`;
      })
      .join("\n");

    result = result.replace(block.raw, imgTags);
  }

  return result;
}
