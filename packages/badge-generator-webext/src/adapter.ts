import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  type BadgeData,
  type BadgeField,
  versionColor,
  downloadsColor,
  ageColor,
} from "@lollipop-onl/badge-generator";
import type { WebExtInfo } from "./api.js";

const ICONS_DIR = join(
  import.meta.dirname, "..", "..", "..", "node_modules", "@tabler", "icons", "icons", "outline",
);

const PUZZLE_ICON = readFileSync(join(ICONS_DIR, "puzzle.svg"), "utf-8")
  .replace(/stroke="currentColor"/g, 'stroke="#656d76"');

export function webExtToBadgeData(info: WebExtInfo, hasFirefox: boolean): BadgeData {
  const fields: BadgeField[] = [
    { label: "version", value: info.version, color: versionColor(info.version) },
    { label: "chrome", value: String(info.chromeUsers), color: downloadsColor(info.chromeUsers) },
  ];

  if (hasFirefox && info.firefoxUsers !== undefined) {
    fields.push({ label: "firefox", value: String(info.firefoxUsers), color: downloadsColor(info.firefoxUsers) });
  }

  if (info.lastUpdate !== "unknown") {
    fields.push({ label: "updated", value: info.lastUpdate, color: ageColor(info.lastUpdate) });
  }

  return {
    name: info.name,
    description: info.description,
    logoSvg: info.iconUrl ?? PUZZLE_ICON,
    deprecated: info.deprecated,
    fields,
  };
}
