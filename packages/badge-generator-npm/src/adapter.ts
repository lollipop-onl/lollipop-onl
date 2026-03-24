import type { BadgeData } from "@lollipop-onl/badge-generator";
import type { NpmPackageInfo } from "./api.js";
import { NPM_LOGO_SVG } from "./logo.js";

function isWithinOneYear(dateStr: string): boolean {
  const created = new Date(dateStr);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  return created > oneYearAgo;
}

export function npmToBadgeData(info: NpmPackageInfo): BadgeData {
  return {
    name: info.name,
    description: info.description,
    logoSvg: NPM_LOGO_SVG,
    deprecated: info.deprecated,
    isNew: isWithinOneYear(info.createdAt),
    fields: [
      { label: "version", value: info.version },
      { label: "downloads", value: `${info.weeklyDownloads}/week` },
      { label: "updated", value: info.lastUpdate },
      { label: "license", value: info.license },
    ],
  };
}
