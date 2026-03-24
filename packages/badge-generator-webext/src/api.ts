import { ChromeWebStore } from "webextension-store-meta/lib/chrome-web-store/index.js";

export interface WebExtLine {
  repo: string;
  chromeId: string;
  firefoxSlug?: string;
}

export interface WebExtInfo {
  name: string;
  description: string;
  version: string;
  chromeUsers: number;
  firefoxUsers?: number;
  lastUpdate: string;
  deprecated: boolean;
  createdAt: string;
}

export function parseWebExtLine(line: string): WebExtLine {
  const parts = line.trim().split(/\s+/);
  const repo = parts[0];
  let chromeId = "";
  let firefoxSlug: string | undefined;

  for (const part of parts.slice(1)) {
    if (part.startsWith("chrome=")) chromeId = part.slice(7);
    else if (part.startsWith("firefox=")) firefoxSlug = part.slice(8);
  }

  return { repo, chromeId, firefoxSlug };
}

export async function fetchWebExtInfo(ext: WebExtLine): Promise<WebExtInfo | null> {
  // Fetch Chrome Web Store data
  let name = ext.repo.split("/").pop() ?? ext.repo;
  let description = "";
  let version = "unknown";
  let chromeUsers = 0;
  let lastUpdate = "unknown";

  if (ext.chromeId) {
    try {
      const chrome = await ChromeWebStore.load({ id: ext.chromeId });
      name = chrome.name() ?? name;
      description = chrome.description() ?? "";
      version = chrome.version() ?? "unknown";
      const usersStr = chrome.users();
      chromeUsers = usersStr ? parseInt(usersStr.replace(/,/g, ""), 10) || 0 : 0;
      const lastUpdated = chrome.lastUpdated();
      if (lastUpdated) {
        lastUpdate = lastUpdated;
      }
    } catch (e) {
      console.warn(`[WARN] Failed to fetch Chrome Web Store data for ${ext.chromeId}: ${e}`);
    }
  }

  // Fetch Firefox AMO data
  let firefoxUsers: number | undefined;

  if (ext.firefoxSlug) {
    try {
      const amoRes = await fetch(
        `https://addons.mozilla.org/api/v5/addons/addon/${ext.firefoxSlug}/`,
      );
      if (amoRes.ok) {
        const amo = await amoRes.json();
        firefoxUsers = amo.average_daily_users ?? 0;
        // Use AMO data as fallback if Chrome didn't provide
        if (!description && amo.summary) {
          const summary = typeof amo.summary === "object" ? amo.summary.en || amo.summary["en-US"] || Object.values(amo.summary)[0] : amo.summary;
          description = (summary as string) ?? "";
        }
        if (version === "unknown" && amo.current_version?.version) {
          version = amo.current_version.version;
        }
        if (amo.last_updated) {
          lastUpdate = amo.last_updated.split("T")[0];
        }
      }
    } catch (e) {
      console.warn(`[WARN] Failed to fetch AMO data for ${ext.firefoxSlug}: ${e}`);
    }
  }

  return {
    name,
    description,
    version,
    chromeUsers,
    firefoxUsers,
    lastUpdate,
    deprecated: false,
    createdAt: "2000-01-01", // Extensions don't have a simple created date
  };
}
