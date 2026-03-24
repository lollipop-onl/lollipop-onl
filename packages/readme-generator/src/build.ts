import type { BadgeTheme } from "@lollipop-onl/badge-generator";
import type { BadgeBlock } from "./parse.js";

export function toSvgFilename(packageName: string, theme?: BadgeTheme): string {
  const base = packageName.replace(/^@/, "").replace(/\//g, "-");
  if (theme) {
    return `${base}@${theme}.svg`;
  }
  return `${base}.svg`;
}

export function replaceBlocks(
  template: string,
  blocks: BadgeBlock[],
): string {
  let result = template;

  for (const block of blocks) {
    const pictures = block.packages
      .map((pkg) => {
        const darkFile = toSvgFilename(pkg, "dark");
        const lightFile = toSvgFilename(pkg, "light");
        return `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/badges/${block.platform}/${darkFile}">
  <source media="(prefers-color-scheme: light)" srcset="./assets/badges/${block.platform}/${lightFile}">
  <img alt="${pkg}" src="./assets/badges/${block.platform}/${darkFile}" width="800">
</picture>`;
      })
      .join("\n");

    result = result.replace(block.raw, pictures);
  }

  return result;
}
