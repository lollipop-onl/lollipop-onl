import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { renderBadge, LOGOS } from "@lollipop-onl/badge-generator";
import {
  fetchNpmPackageInfo,
  npmToBadgeData,
} from "@lollipop-onl/badge-generator-npm";
import {
  fetchJsDelivrPackageInfo,
  jsdelivrToBadgeData,
} from "@lollipop-onl/badge-generator-jsdelivr";
import { parseTemplate } from "./parse.js";
import { replaceBlocks, toSvgFilename } from "./build.js";

const ROOT = join(import.meta.dirname, "..", "..", "..");
const TEMPLATE_PATH = join(ROOT, "src", "README.md");
const OUTPUT_PATH = join(ROOT, "README.md");
const BADGES_BASE_DIR = join(ROOT, "assets", "badges");

async function main() {
  const template = readFileSync(TEMPLATE_PATH, "utf-8");
  const blocks = parseTemplate(template);

  for (const block of blocks) {
    const badgesDir = join(BADGES_BASE_DIR, block.platform);
    mkdirSync(badgesDir, { recursive: true });

    for (const pkg of block.packages) {
      console.log(`Fetching: ${pkg}`);

      let badgeData;
      if (block.platform === "npm") {
        const info = await fetchNpmPackageInfo(pkg);
        if (!info) continue;
        badgeData = npmToBadgeData(info);
      } else if (block.platform === "jsdelivr") {
        const info = await fetchJsDelivrPackageInfo(pkg);
        if (!info) continue;
        badgeData = jsdelivrToBadgeData(info);
      } else {
        console.warn(`[WARN] Unknown platform: ${block.platform}, skipping`);
        continue;
      }

      if (block.options.logo && LOGOS[block.options.logo]) {
        badgeData = {
          ...badgeData,
          inlineLogoSvg: badgeData.logoSvg,
          logoSvg: LOGOS[block.options.logo],
        };
      }

      for (const theme of ["dark", "light"] as const) {
        const svg = await renderBadge(badgeData, theme);
        const filename = toSvgFilename(pkg, theme);
        writeFileSync(join(badgesDir, filename), svg);
        console.log(`Generated: ${block.platform}/${filename}`);
      }
    }
  }

  const readme = replaceBlocks(template, blocks);
  writeFileSync(OUTPUT_PATH, readme);
  console.log("README.md generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
