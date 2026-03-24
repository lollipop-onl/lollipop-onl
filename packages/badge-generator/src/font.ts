import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CACHE_DIR = join(
  import.meta.dirname,
  "..",
  "..",
  "..",
  "node_modules",
  ".cache",
  "badge-generator",
);

const FONT_URLS: Record<string, string> = {
  "NotoSansJP-Regular.ttf":
    "https://github.com/google/fonts/raw/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf",
};

export async function loadFonts(): Promise<
  Array<{ name: string; data: ArrayBuffer; weight: 400 | 700 }>
> {
  mkdirSync(CACHE_DIR, { recursive: true });

  const fontPath = join(CACHE_DIR, "NotoSansJP.ttf");

  if (!existsSync(fontPath)) {
    const res = await fetch(FONT_URLS["NotoSansJP-Regular.ttf"]);
    if (!res.ok) throw new Error(`Failed to fetch font: ${res.status}`);
    const buffer = await res.arrayBuffer();
    writeFileSync(fontPath, Buffer.from(buffer));
  }

  const fontData = readFileSync(fontPath);

  return [
    { name: "Noto Sans JP", data: fontData.buffer as ArrayBuffer, weight: 400 },
    { name: "Noto Sans JP", data: fontData.buffer as ArrayBuffer, weight: 700 },
  ];
}
