import type { BadgeData } from "@lollipop-onl/badge-generator";
import type { NpmPackageInfo } from "./api.js";
import { NPM_LOGO_SVG } from "./logo.js";

export function npmToBadgeData(info: NpmPackageInfo): BadgeData {
  return {
    name: info.name,
    description: info.description,
    logoSvg: NPM_LOGO_SVG,
    fields: [
      { label: "version", value: info.version },
      { label: "downloads", value: `${info.weeklyDownloads}/week` },
      { label: "updated", value: info.lastUpdate },
      { label: "license", value: info.license },
    ],
  };
}
