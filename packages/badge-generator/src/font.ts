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
    "https://fonts.gstatic.com/s/notosansjp/v56/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75s.ttf",
  "NotoSansJP-Bold.ttf":
    "https://fonts.gstatic.com/s/notosansjp/v56/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFPYk75s.ttf",
};

async function fetchFont(fileName: string, url: string): Promise<void> {
  const fontPath = join(CACHE_DIR, fileName);

  if (existsSync(fontPath)) return;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch font ${fileName}: ${res.status}`);
  const buffer = await res.arrayBuffer();
  writeFileSync(fontPath, Buffer.from(buffer));
}

export async function loadFonts(): Promise<
  Array<{ name: string; data: ArrayBuffer; weight: 400 | 700 }>
> {
  mkdirSync(CACHE_DIR, { recursive: true });

  await Promise.all(
    Object.entries(FONT_URLS).map(([fileName, url]) => fetchFont(fileName, url)),
  );

  const regularData = readFileSync(join(CACHE_DIR, "NotoSansJP-Regular.ttf"));
  const boldData = readFileSync(join(CACHE_DIR, "NotoSansJP-Bold.ttf"));

  return [
    { name: "Noto Sans JP", data: regularData.buffer as ArrayBuffer, weight: 400 },
    { name: "Noto Sans JP", data: boldData.buffer as ArrayBuffer, weight: 700 },
  ];
}
