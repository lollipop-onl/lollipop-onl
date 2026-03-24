import { readFileSync } from "node:fs";
import { join } from "node:path";

const BRANDS_DIR = join(import.meta.dirname, "..", "..", "..", "assets", "brands");

export const JSDELIVR_LOGO_SVG = readFileSync(join(BRANDS_DIR, "jsdelivr-icon.svg"), "utf-8");
