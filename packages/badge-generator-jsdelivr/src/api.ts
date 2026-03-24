export interface JsDelivrPackageInfo {
  name: string;
  description: string;
  version: string;
  license: string;
  lastUpdate: string;
  monthlyHits: number;
}

export async function fetchJsDelivrPackageInfo(
  packageName: string,
): Promise<JsDelivrPackageInfo | null> {
  // Fetch npm metadata
  const registryRes = await fetch(
    `https://registry.npmjs.org/${packageName}`,
  );

  if (registryRes.status === 404) {
    console.warn(`[WARN] Package not found: ${packageName}`);
    return null;
  }

  if (!registryRes.ok) {
    throw new Error(`npm registry error for ${packageName}: ${registryRes.status}`);
  }

  const registry = await registryRes.json();

  const latestVersion = registry["dist-tags"]?.latest ?? "unknown";
  const license = registry.license ?? registry.versions?.[latestVersion]?.license ?? "unknown";
  const lastUpdate = registry.time?.modified ?? "unknown";

  // Fetch jsDelivr monthly hits
  const statsRes = await fetch(
    `https://data.jsdelivr.com/v1/packages/npm/${packageName}/stats/date/month`,
  );

  let monthlyHits = 0;
  if (statsRes.ok) {
    const statsData = await statsRes.json();
    monthlyHits = statsData.total ?? 0;
  }

  return {
    name: registry.name,
    description: registry.description ?? "",
    version: latestVersion,
    license: typeof license === "object" ? license.type ?? "unknown" : license,
    lastUpdate: lastUpdate.split("T")[0],
    monthlyHits,
  };
}
