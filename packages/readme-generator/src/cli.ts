import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { renderBadge } from "@lollipop-onl/badge-generator";
import {
  fetchNpmPackageInfo,
  npmToBadgeData,
} from "@lollipop-onl/badge-generator-npm";
import { parseTemplate } from "./parse.js";
import { replaceBlocks, toSvgFilename } from "./build.js";

const ROOT = join(import.meta.dirname, "..", "..", "..");
const TEMPLATE_PATH = join(ROOT, "src", "README.md");
const OUTPUT_PATH = join(ROOT, "README.md");
const BADGES_DIR = join(ROOT, "assets", "badges");

async function main() {
  const template = readFileSync(TEMPLATE_PATH, "utf-8");
  const blocks = parseTemplate(template);

  mkdirSync(BADGES_DIR, { recursive: true });

  for (const block of blocks) {
    if (block.platform !== "npm") {
      console.warn(`[WARN] Unknown platform: ${block.platform}, skipping`);
      continue;
    }

    for (const pkg of block.packages) {
      console.log(`Fetching: ${pkg}`);
      const info = await fetchNpmPackageInfo(pkg);
      if (!info) continue;

      const badgeData = npmToBadgeData(info);

      for (const theme of ["dark", "light"] as const) {
        const svg = await renderBadge(badgeData, theme);
        const filename = toSvgFilename(pkg, theme);
        writeFileSync(join(BADGES_DIR, filename), svg);
        console.log(`Generated: ${filename}`);
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
