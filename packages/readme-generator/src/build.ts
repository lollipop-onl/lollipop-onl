import type { BadgeTheme } from "@lollipop-onl/badge-generator";
import type { BadgeBlock } from "./parse.js";

export function toSvgFilename(packageName: string, theme?: BadgeTheme): string {
  const name = packageName.split(/\s/)[0]; // Take first token
  const base = name.replace(/^@/, "").replace(/\//g, "-");
  if (theme) {
    return `${base}@${theme}.svg`;
  }
  return `${base}.svg`;
}

const PLATFORM_URLS: Record<string, (pkg: string) => string> = {
  npm: (pkg) => `https://www.npmjs.com/package/${pkg}`,
  jsdelivr: (pkg) => `https://www.jsdelivr.com/package/npm/${pkg}`,
  webext: (pkg) => `https://github.com/${pkg.split(/\s/)[0]}`,
};

export function replaceBlocks(
  template: string,
  blocks: BadgeBlock[],
  altTexts: Record<string, string>,
): string {
  let result = template;

  for (const block of blocks) {
    const pictures = block.packages
      .map((pkg) => {
        const pkgId = pkg.split(/\s/)[0];
        const darkFile = toSvgFilename(pkg, "dark");
        const lightFile = toSvgFilename(pkg, "light");
        const url = PLATFORM_URLS[block.platform]?.(pkg) ?? "#";
        const alt = altTexts[pkgId] ?? pkgId;
        return `<a href="${url}">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/badges/${block.platform}/${darkFile}">
    <source media="(prefers-color-scheme: light)" srcset="./assets/badges/${block.platform}/${lightFile}">
    <img alt="${alt}" src="./assets/badges/${block.platform}/${darkFile}" width="800">
  </picture>
</a>`;
      })
      .join("\n");

    result = result.replace(block.raw, pictures);
  }

  return result;
}
