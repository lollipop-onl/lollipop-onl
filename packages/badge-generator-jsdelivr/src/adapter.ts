import type { BadgeData } from "@lollipop-onl/badge-generator";
import type { JsDelivrPackageInfo } from "./api.js";
import { JSDELIVR_LOGO_SVG } from "./logo.js";

function isWithinOneYear(dateStr: string): boolean {
  const created = new Date(dateStr);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  return created > oneYearAgo;
}

export function jsdelivrToBadgeData(info: JsDelivrPackageInfo): BadgeData {
  return {
    name: info.name,
    description: info.description,
    logoSvg: JSDELIVR_LOGO_SVG,
    deprecated: info.deprecated,
    isNew: isWithinOneYear(info.createdAt),
    fields: [
      { label: "version", value: info.version },
      { label: "hits", value: `${info.monthlyHits}/month` },
      { label: "updated", value: info.lastUpdate },
      { label: "license", value: info.license },
    ],
  };
}
