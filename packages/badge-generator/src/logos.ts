import { readFileSync } from "node:fs";
import { join } from "node:path";

const ASSETS_DIR = join(import.meta.dirname, "..", "..", "..", "assets");

function loadSvg(filename: string): string {
  return readFileSync(join(ASSETS_DIR, filename), "utf-8");
}

export const LOGOS: Record<string, string> = {
  docsify: loadSvg("docsify.svg"),
};
