export interface BadgeBlock {
  platform: string;
  packages: string[];
  options: Record<string, string>;
  raw: string;
}

const BADGE_BLOCK_RE = /```badges:(\w[\w-]*)([ \t]+[^\n]*)?\n([\s\S]*?)```/g;

export function parseTemplate(template: string): BadgeBlock[] {
  const blocks: BadgeBlock[] = [];

  for (const match of template.matchAll(BADGE_BLOCK_RE)) {
    const platform = match[1];
    const optionsStr = match[2]?.trim() ?? "";
    const packages = match[3]
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const options: Record<string, string> = {};
    for (const opt of optionsStr.split(/\s+/).filter(Boolean)) {
      const [key, value] = opt.split("=");
      if (key && value) {
        options[key] = value;
      }
    }

    blocks.push({
      platform,
      packages,
      options,
      raw: match[0],
    });
  }

  return blocks;
}
