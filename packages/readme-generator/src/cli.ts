import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { renderBadge, LOGOS, type BadgeData } from "@lollipop-onl/badge-generator";
import {
  fetchNpmPackageInfo,
  npmToBadgeData,
} from "@lollipop-onl/badge-generator-npm";
import {
  fetchJsDelivrPackageInfo,
  jsdelivrToBadgeData,
} from "@lollipop-onl/badge-generator-jsdelivr";
import {
  parseWebExtLine,
  fetchWebExtInfo,
  webExtToBadgeData,
} from "@lollipop-onl/badge-generator-webext";
import { parseTemplate } from "./parse.js";
import { replaceBlocks, toSvgFilename } from "./build.js";

function buildAltText(data: BadgeData): string {
  let text = data.name;
  if (data.description) text += ` - ${data.description}`;
  const fields = data.fields.map((f) => `${f.label}: ${f.value}`).join(", ");
  if (fields) text += ` (${fields})`;
  if (data.deprecated) text += " [DEPRECATED]";
  return text;
}

const ROOT = join(import.meta.dirname, "..", "..", "..");
const TEMPLATE_PATH = join(ROOT, "src", "README.md");
const OUTPUT_PATH = join(ROOT, "README.md");
const BADGES_BASE_DIR = join(ROOT, "assets", "badges");

async function main() {
  const template = readFileSync(TEMPLATE_PATH, "utf-8");
  const blocks = parseTemplate(template);
  const altTexts: Record<string, string> = {};

  for (const block of blocks) {
    const badgesDir = join(BADGES_BASE_DIR, block.platform);
    mkdirSync(badgesDir, { recursive: true });

    for (const pkg of block.packages) {
      let badgeData;
      let pkgName = pkg; // Default: use full line as package name

      if (block.platform === "npm") {
        console.log(`Fetching: ${pkg}`);
        const info = await fetchNpmPackageInfo(pkg);
        if (!info) continue;
        badgeData = npmToBadgeData(info);
      } else if (block.platform === "jsdelivr") {
        console.log(`Fetching: ${pkg}`);
        const info = await fetchJsDelivrPackageInfo(pkg);
        if (!info) continue;
        badgeData = jsdelivrToBadgeData(info);
      } else if (block.platform === "webext") {
        const ext = parseWebExtLine(pkg);
        pkgName = ext.repo; // Use repo name for filenames
        console.log(`Fetching: ${ext.repo}`);
        const info = await fetchWebExtInfo(ext);
        if (!info) continue;
        badgeData = webExtToBadgeData(info, !!ext.firefoxSlug);
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

      altTexts[pkgName] = buildAltText(badgeData);

      for (const theme of ["dark", "light"] as const) {
        const svg = await renderBadge(badgeData, theme);
        const filename = toSvgFilename(pkgName, theme);
        writeFileSync(join(badgesDir, filename), svg);
        console.log(`Generated: ${block.platform}/${filename}`);
      }
    }
  }

  const readme = replaceBlocks(template, blocks, altTexts);
  writeFileSync(OUTPUT_PATH, readme);
  console.log("README.md generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
