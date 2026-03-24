export interface BadgeBlock {
  platform: string;
  packages: string[];
  raw: string;
}

const BADGE_BLOCK_RE = /```badges:(\w[\w-]*)\n([\s\S]*?)```/g;

export function parseTemplate(template: string): BadgeBlock[] {
  const blocks: BadgeBlock[] = [];

  for (const match of template.matchAll(BADGE_BLOCK_RE)) {
    const platform = match[1];
    const packages = match[2]
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    blocks.push({
      platform,
      packages,
      raw: match[0],
    });
  }

  return blocks;
}
