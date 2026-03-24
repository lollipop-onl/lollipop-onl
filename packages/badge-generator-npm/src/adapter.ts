import {
  type BadgeData,
  BADGE_COLORS,
  versionColor,
  downloadsColor,
  ageColor,
} from "@lollipop-onl/badge-generator";
import type { NpmPackageInfo } from "./api.js";
import { NPM_LOGO_SVG } from "./logo.js";

function isRecent(dateStr: string): boolean {
  const created = new Date(dateStr);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return created > threeMonthsAgo;
}

export function npmToBadgeData(info: NpmPackageInfo): BadgeData {
  return {
    name: info.name,
    description: info.description,
    logoSvg: NPM_LOGO_SVG,
    deprecated: info.deprecated,
    isNew: isRecent(info.createdAt),
    fields: [
      { label: "version", value: info.version, color: versionColor(info.version) },
      { label: "downloads", value: `${info.weeklyDownloads}/week`, color: downloadsColor(info.weeklyDownloads) },
      { label: "updated", value: info.lastUpdate, color: ageColor(info.lastUpdate) },
      { label: "license", value: info.license, color: BADGE_COLORS.blue },
    ],
  };
}
