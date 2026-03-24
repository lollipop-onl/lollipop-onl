/** Named color palette (Shields.io compatible) */
export const BADGE_COLORS = {
  brightgreen: "#4c1",
  green: "#97ca00",
  yellowgreen: "#a4a61d",
  yellow: "#dfb317",
  orange: "#fe7d37",
  red: "#e05d44",
  blue: "#007ec6",
} as const;

/**
 * Returns a color based on where `value` falls in the threshold scale.
 * Thresholds must be in descending order.
 * Colors array must have exactly one more element than thresholds.
 *
 * Example: colorScale(85, [90, 80, 70, 60], ['brightgreen', 'green', 'yellowgreen', 'yellow', 'orange', 'red'])
 *   → 85 >= 80 → 'green' (index 1)
 */
export function colorScale(
  value: number,
  thresholds: number[],
  colors: string[],
): string {
  for (let i = 0; i < thresholds.length; i++) {
    if (value >= thresholds[i]) {
      return colors[i];
    }
  }
  return colors[colors.length - 1];
}

/** Color for version strings (semver-aware) */
export function versionColor(version: string): string {
  if (version === "unknown") return BADGE_COLORS.red;
  if (version.includes("-")) return BADGE_COLORS.orange;
  if (/^v?0\./.test(version)) return BADGE_COLORS.orange;
  return BADGE_COLORS.blue;
}

/** Color for download/hit counts */
export function downloadsColor(count: number): string {
  return colorScale(
    count,
    [1_000_000, 100_000, 10_000, 1_000, 100],
    [
      BADGE_COLORS.brightgreen,
      BADGE_COLORS.green,
      BADGE_COLORS.yellowgreen,
      BADGE_COLORS.yellow,
      BADGE_COLORS.orange,
      BADGE_COLORS.red,
    ],
  );
}

/** Color based on how recently something was updated */
export function ageColor(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return BADGE_COLORS.red;

  const days = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  return colorScale(
    -days,
    [-7, -30, -180, -365, -730],
    [
      BADGE_COLORS.brightgreen,
      BADGE_COLORS.green,
      BADGE_COLORS.yellowgreen,
      BADGE_COLORS.yellow,
      BADGE_COLORS.orange,
      BADGE_COLORS.red,
    ],
  );
}
