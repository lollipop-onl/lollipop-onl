import {
  type BadgeData,
  BADGE_COLORS,
  versionColor,
  downloadsColor,
  ageColor,
} from "@lollipop-onl/badge-generator";
import type { JsDelivrPackageInfo } from "./api.js";
import { JSDELIVR_LOGO_SVG } from "./logo.js";

function isRecent(dateStr: string): boolean {
  const created = new Date(dateStr);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return created > threeMonthsAgo;
}

export function jsdelivrToBadgeData(info: JsDelivrPackageInfo): BadgeData {
  return {
    name: info.name,
    description: info.description,
    logoSvg: JSDELIVR_LOGO_SVG,
    deprecated: info.deprecated,
    isNew: isRecent(info.createdAt),
    fields: [
      { label: "version", value: info.version, color: versionColor(info.version) },
      { label: "hits", value: `${info.monthlyHits}/month`, color: downloadsColor(info.monthlyHits) },
      { label: "updated", value: info.lastUpdate, color: ageColor(info.lastUpdate) },
      { label: "license", value: info.license, color: BADGE_COLORS.blue },
    ],
  };
}
