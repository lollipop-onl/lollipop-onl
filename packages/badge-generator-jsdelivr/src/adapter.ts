import type { BadgeData } from "@lollipop-onl/badge-generator";
import type { JsDelivrPackageInfo } from "./api.js";
import { JSDELIVR_LOGO_SVG } from "./logo.js";

export function jsdelivrToBadgeData(info: JsDelivrPackageInfo): BadgeData {
  return {
    name: info.name,
    description: info.description,
    logoSvg: JSDELIVR_LOGO_SVG,
    fields: [
      { label: "version", value: info.version },
      { label: "hits", value: `${info.monthlyHits}/month` },
      { label: "updated", value: info.lastUpdate },
      { label: "license", value: info.license },
    ],
  };
}
