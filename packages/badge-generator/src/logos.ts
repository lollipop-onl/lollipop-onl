import { readFileSync } from "node:fs";
import { join } from "node:path";

const BRANDS_DIR = join(import.meta.dirname, "..", "..", "..", "assets", "brands");

function loadSvg(filename: string): string {
  return readFileSync(join(BRANDS_DIR, filename), "utf-8");
}

export const LOGOS: Record<string, string> = {
  docsify: loadSvg("docsify-simple.svg"),
};
