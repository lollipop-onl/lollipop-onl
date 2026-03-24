export interface NpmPackageInfo {
  name: string;
  description: string;
  version: string;
  license: string;
  lastUpdate: string;
  weeklyDownloads: number;
}

export async function fetchNpmPackageInfo(
  packageName: string,
): Promise<NpmPackageInfo | null> {
  const registryRes = await fetch(
    `https://registry.npmjs.org/${packageName}`,
  );

  if (registryRes.status === 404) {
    console.warn(`[WARN] Package not found: ${packageName}`);
    return null;
  }

  if (!registryRes.ok) {
    throw new Error(
      `npm registry error for ${packageName}: ${registryRes.status}`,
    );
  }

  const registry = await registryRes.json();

  const latestVersion = registry["dist-tags"]?.latest ?? "unknown";
  const license =
    registry.license ?? registry.versions?.[latestVersion]?.license ?? "unknown";
  const lastUpdate = registry.time?.modified ?? "unknown";

  // Fetch weekly downloads
  const downloadsRes = await fetch(
    `https://api.npmjs.org/downloads/point/last-week/${packageName}`,
  );

  let weeklyDownloads = 0;
  if (downloadsRes.ok) {
    const downloadsData = await downloadsRes.json();
    weeklyDownloads = downloadsData.downloads ?? 0;
  }

  return {
    name: registry.name,
    description: registry.description ?? "",
    version: latestVersion,
    license: typeof license === "object" ? license.type ?? "unknown" : license,
    lastUpdate: lastUpdate.split("T")[0],
    weeklyDownloads,
  };
}
