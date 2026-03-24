# Badge Banner Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** README のバッジ管理を自動化する。`src/README.md` の独自コードブロック記法からバナー SVG を生成し、README.md を自動ビルドする。

**Architecture:** bun workspace monorepo。`badge-generator`（抽象レイヤー + satori レンダリング）、`badge-generator-npm`（npm API adapter）、`readme-generator`（テンプレート解析 + orchestration）の3パッケージ構成。

**Tech Stack:** bun, TypeScript, satori, Noto Sans JP

**Spec:** `docs/superpowers/specs/2026-03-24-badge-banner-generator-design.md`

---

## File Structure

```
package.json                              # ワークスペースルート
bunfig.toml                               # bun 設定
tsconfig.json                             # ルート tsconfig (共通設定)
packages/
  badge-generator/
    package.json
    tsconfig.json
    src/
      types.ts                            # BadgeData, BadgeField 型定義
      renderer.ts                         # satori で SVG レンダリング
      font.ts                             # フォント取得・キャッシュ
      index.ts                            # public API エクスポート
    test/
      renderer.test.ts
  badge-generator-npm/
    package.json
    tsconfig.json
    src/
      api.ts                              # npm registry API クライアント
      adapter.ts                          # npm データ → BadgeData 変換
      logo.ts                             # npm ロゴ SVG 定数
      index.ts
    test/
      api.test.ts
      adapter.test.ts
  readme-generator/
    package.json
    tsconfig.json
    src/
      parse.ts                            # コードブロック解析
      build.ts                            # テンプレート → README 生成
      cli.ts                              # CLI エントリポイント
      index.ts
    test/
      parse.test.ts
      build.test.ts
src/
  README.md                               # テンプレート（メンテ対象）
assets/
  badges/                                 # 生成 SVG 出力先
.github/
  workflows/
    generate-readme.yml                   # cron ワークフロー
README.md                                 # 生成物
```

---

### Task 1: Monorepo Scaffolding

**Files:**
- Create: `package.json`
- Create: `bunfig.toml`
- Create: `tsconfig.json`
- Create: `packages/badge-generator/package.json`
- Create: `packages/badge-generator/tsconfig.json`
- Create: `packages/badge-generator-npm/package.json`
- Create: `packages/badge-generator-npm/tsconfig.json`
- Create: `packages/readme-generator/package.json`
- Create: `packages/readme-generator/tsconfig.json`

- [ ] **Step 1: Create root `package.json`**

```json
{
  "name": "lollipop-onl",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "generate": "bun run packages/readme-generator/src/cli.ts"
  }
}
```

- [ ] **Step 2: Create `bunfig.toml`**

```toml
[install]
peer = false
```

- [ ] **Step 3: Create root `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["bun-types"]
  }
}
```

- [ ] **Step 4: Create `packages/badge-generator/package.json`**

```json
{
  "name": "@lollipop-onl/badge-generator",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "satori": "^0.12.0"
  }
}
```

- [ ] **Step 5: Create `packages/badge-generator/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Create `packages/badge-generator-npm/package.json`**

```json
{
  "name": "@lollipop-onl/badge-generator-npm",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@lollipop-onl/badge-generator": "workspace:*"
  }
}
```

- [ ] **Step 7: Create `packages/badge-generator-npm/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 8: Create `packages/readme-generator/package.json`**

```json
{
  "name": "@lollipop-onl/readme-generator",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@lollipop-onl/badge-generator": "workspace:*",
    "@lollipop-onl/badge-generator-npm": "workspace:*"
  }
}
```

- [ ] **Step 9: Create `packages/readme-generator/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 10: Install dependencies**

Run: `bun install`
Expected: lockfile 生成、node_modules にワークスペースリンク作成

- [ ] **Step 11: Create `.gitignore`**

```
node_modules/
dist/
```

- [ ] **Step 12: Commit**

```bash
git add package.json bunfig.toml tsconfig.json .gitignore packages/*/package.json packages/*/tsconfig.json bun.lock
git commit -m "chore: scaffold bun monorepo with 3 packages"
```

---

### Task 2: `badge-generator` — Types and Font Loading

**Files:**
- Create: `packages/badge-generator/src/types.ts`
- Create: `packages/badge-generator/src/font.ts`
- Create: `packages/badge-generator/src/index.ts`

- [ ] **Step 1: Create `packages/badge-generator/src/types.ts`**

```typescript
export interface BadgeField {
  label: string;
  value: string;
}

export interface BadgeData {
  name: string;
  description: string;
  logoSvg: string;
  fields: BadgeField[];
}
```

- [ ] **Step 2: Create `packages/badge-generator/src/font.ts`**

Noto Sans JP の Regular (400) と Bold (700) を Google Fonts API から取得し、`node_modules/.cache/badge-generator/` にキャッシュ。

```typescript
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CACHE_DIR = join(
  import.meta.dirname,
  "..",
  "..",
  "..",
  "node_modules",
  ".cache",
  "badge-generator",
);

const FONT_URLS: Record<string, string> = {
  "NotoSansJP-Regular.ttf":
    "https://github.com/google/fonts/raw/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf",
};

export async function loadFonts(): Promise<
  Array<{ name: string; data: ArrayBuffer; weight: 400 | 700 }>
> {
  mkdirSync(CACHE_DIR, { recursive: true });

  const fontPath = join(CACHE_DIR, "NotoSansJP.ttf");

  if (!existsSync(fontPath)) {
    const res = await fetch(FONT_URLS["NotoSansJP-Regular.ttf"]);
    if (!res.ok) throw new Error(`Failed to fetch font: ${res.status}`);
    const buffer = await res.arrayBuffer();
    writeFileSync(fontPath, Buffer.from(buffer));
  }

  const fontData = readFileSync(fontPath);

  return [
    { name: "Noto Sans JP", data: fontData.buffer as ArrayBuffer, weight: 400 },
    { name: "Noto Sans JP", data: fontData.buffer as ArrayBuffer, weight: 700 },
  ];
}
```

Note: Noto Sans JP の variable font は weight 100-900 を含むため、1ファイルで Regular/Bold 両方に対応できる。

- [ ] **Step 3: Create `packages/badge-generator/src/index.ts`**

```typescript
export { type BadgeData, type BadgeField } from "./types.js";
export { renderBadge } from "./renderer.js";
```

（`renderer.ts` は次の Task で作成）

- [ ] **Step 4: Commit**

```bash
git add packages/badge-generator/src/
git commit -m "feat(badge-generator): add types and font loading"
```

---

### Task 3: `badge-generator` — SVG Renderer

**Files:**
- Create: `packages/badge-generator/src/renderer.ts`
- Create: `packages/badge-generator/test/renderer.test.ts`

- [ ] **Step 1: Write failing test for `renderBadge`**

```typescript
// packages/badge-generator/test/renderer.test.ts
import { describe, expect, it } from "bun:test";
import { renderBadge } from "../src/renderer.js";
import type { BadgeData } from "../src/types.js";

describe("renderBadge", () => {
  it("returns an SVG string containing the badge data", async () => {
    const data: BadgeData = {
      name: "test-package",
      description: "A test package",
      logoSvg:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="red"/></svg>',
      fields: [
        { label: "version", value: "1.0.0" },
        { label: "downloads", value: "100/week" },
      ],
    };

    const svg = await renderBadge(data);

    expect(svg).toStartWith("<svg");
    expect(svg).toContain("test-package");
    expect(svg).toContain("A test package");
    expect(svg).toContain("1.0.0");
    expect(svg).toContain("100/week");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test packages/badge-generator/test/renderer.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `renderBadge`**

```typescript
// packages/badge-generator/src/renderer.ts
import satori from "satori";
import { loadFonts } from "./font.js";
import type { BadgeData } from "./types.js";

let fontsCache: Awaited<ReturnType<typeof loadFonts>> | null = null;

async function getFonts() {
  if (!fontsCache) {
    fontsCache = await loadFonts();
  }
  return fontsCache;
}

export async function renderBadge(data: BadgeData): Promise<string> {
  const fonts = await getFonts();

  const element = {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        padding: "16px 20px",
        backgroundColor: "#0d1117",
        borderRadius: "8px",
        border: "1px solid #30363d",
        color: "#e6edf3",
        fontFamily: "Noto Sans JP",
        fontSize: "14px",
      },
      children: [
        // Header: logo + name
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "12px",
            },
            children: [
              {
                type: "img",
                props: {
                  src: `data:image/svg+xml,${encodeURIComponent(data.logoSvg)}`,
                  width: 28,
                  height: 28,
                  style: { borderRadius: "4px" },
                },
              },
              {
                type: "span",
                props: {
                  style: { fontWeight: 700, fontSize: "16px" },
                  children: data.name,
                },
              },
            ],
          },
        },
        // Description
        {
          type: "div",
          props: {
            style: {
              marginTop: "4px",
              marginLeft: "40px",
              color: "#8b949e",
              fontSize: "13px",
            },
            children: data.description,
          },
        },
        // Fields
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              gap: "16px",
              marginTop: "10px",
              marginLeft: "40px",
              fontSize: "12px",
            },
            children: data.fields.map((field) => ({
              type: "div",
              props: {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "2px 8px",
                  backgroundColor: "#161b22",
                  borderRadius: "12px",
                  border: "1px solid #30363d",
                },
                children: [
                  {
                    type: "span",
                    props: {
                      style: { color: "#8b949e" },
                      children: field.label,
                    },
                  },
                  {
                    type: "span",
                    props: {
                      style: { color: "#e6edf3", fontWeight: 700 },
                      children: field.value,
                    },
                  },
                ],
              },
            })),
          },
        },
      ],
    },
  };

  return satori(element as any, {
    width: 800,
    height: 120,
    fonts: fonts.map((f) => ({
      name: f.name,
      data: f.data,
      weight: f.weight,
    })),
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test packages/badge-generator/test/renderer.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/badge-generator/src/renderer.ts packages/badge-generator/test/
git commit -m "feat(badge-generator): implement satori SVG renderer"
```

---

### Task 4: `badge-generator-npm` — API Client

**Files:**
- Create: `packages/badge-generator-npm/src/api.ts`
- Create: `packages/badge-generator-npm/test/api.test.ts`

- [ ] **Step 1: Write failing test for npm API client**

```typescript
// packages/badge-generator-npm/test/api.test.ts
import { describe, expect, it } from "bun:test";
import { fetchNpmPackageInfo } from "../src/api.js";

describe("fetchNpmPackageInfo", () => {
  it("fetches package info from npm registry", async () => {
    const info = await fetchNpmPackageInfo("satori");

    expect(info.name).toBe("satori");
    expect(info.description).toBeString();
    expect(info.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(info.license).toBeString();
    expect(info.lastUpdate).toBeString();
    expect(info.weeklyDownloads).toBeNumber();
  });

  it("returns null for non-existent packages", async () => {
    const info = await fetchNpmPackageInfo(
      "@lollipop-onl/this-package-does-not-exist-12345",
    );
    expect(info).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test packages/badge-generator-npm/test/api.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `fetchNpmPackageInfo`**

```typescript
// packages/badge-generator-npm/src/api.ts
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
  const license = registry.license ?? registry.versions?.[latestVersion]?.license ?? "unknown";
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test packages/badge-generator-npm/test/api.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/badge-generator-npm/src/api.ts packages/badge-generator-npm/test/
git commit -m "feat(badge-generator-npm): implement npm registry API client"
```

---

### Task 5: `badge-generator-npm` — Adapter and Logo

**Files:**
- Create: `packages/badge-generator-npm/src/logo.ts`
- Create: `packages/badge-generator-npm/src/adapter.ts`
- Create: `packages/badge-generator-npm/src/index.ts`
- Create: `packages/badge-generator-npm/test/adapter.test.ts`

- [ ] **Step 1: Create `packages/badge-generator-npm/src/logo.ts`**

npm ロゴの SVG 文字列を定数としてエクスポート。

```typescript
// packages/badge-generator-npm/src/logo.ts
// npm logo (simplified, red background)
export const NPM_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="#c53635" rx="8"/><path d="M48 48h160v160H48z" fill="#c53635"/><path d="M64 64h128v128H152V96h-32v96H64z" fill="#fff"/></svg>`;
```

- [ ] **Step 2: Write failing test for adapter**

```typescript
// packages/badge-generator-npm/test/adapter.test.ts
import { describe, expect, it } from "bun:test";
import { npmToBadgeData } from "../src/adapter.js";
import type { NpmPackageInfo } from "../src/api.js";

describe("npmToBadgeData", () => {
  it("converts NpmPackageInfo to BadgeData", () => {
    const info: NpmPackageInfo = {
      name: "@lollipop-onl/myzod-to-zod",
      description: "Codemod for migrating myzod to zod",
      version: "1.2.3",
      license: "MIT",
      lastUpdate: "2024-01-15",
      weeklyDownloads: 120,
    };

    const badge = npmToBadgeData(info);

    expect(badge.name).toBe("@lollipop-onl/myzod-to-zod");
    expect(badge.description).toBe("Codemod for migrating myzod to zod");
    expect(badge.logoSvg).toContain("<svg");
    expect(badge.fields).toEqual([
      { label: "version", value: "1.2.3" },
      { label: "downloads", value: "120/week" },
      { label: "updated", value: "2024-01-15" },
      { label: "license", value: "MIT" },
    ]);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `bun test packages/badge-generator-npm/test/adapter.test.ts`
Expected: FAIL

- [ ] **Step 4: Implement adapter**

```typescript
// packages/badge-generator-npm/src/adapter.ts
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
```

- [ ] **Step 5: Create `packages/badge-generator-npm/src/index.ts`**

```typescript
export { fetchNpmPackageInfo, type NpmPackageInfo } from "./api.js";
export { npmToBadgeData } from "./adapter.js";
```

- [ ] **Step 6: Run all tests in badge-generator-npm**

Run: `bun test packages/badge-generator-npm/test/`
Expected: ALL PASS

- [ ] **Step 7: Commit**

```bash
git add packages/badge-generator-npm/src/ packages/badge-generator-npm/test/adapter.test.ts
git commit -m "feat(badge-generator-npm): add adapter and npm logo"
```

---

### Task 6: `readme-generator` — Template Parser

**Files:**
- Create: `packages/readme-generator/src/parse.ts`
- Create: `packages/readme-generator/test/parse.test.ts`

- [ ] **Step 1: Write failing test for parser**

```typescript
// packages/readme-generator/test/parse.test.ts
import { describe, expect, it } from "bun:test";
import { parseTemplate } from "../src/parse.js";

const TEMPLATE = `# Hello

Some text.

\`\`\`badges:npm
@lollipop-onl/myzod-to-zod
@passport-mrz/builder
\`\`\`

More text.

\`\`\`badges:npm
copylen
\`\`\`

Footer.`;

describe("parseTemplate", () => {
  it("extracts all badge blocks with platform and package names", () => {
    const blocks = parseTemplate(TEMPLATE);

    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toEqual({
      platform: "npm",
      packages: ["@lollipop-onl/myzod-to-zod", "@passport-mrz/builder"],
      raw: "```badges:npm\n@lollipop-onl/myzod-to-zod\n@passport-mrz/builder\n```",
    });
    expect(blocks[1]).toEqual({
      platform: "npm",
      packages: ["copylen"],
      raw: "```badges:npm\ncopylen\n```",
    });
  });

  it("returns empty array when no badge blocks exist", () => {
    const blocks = parseTemplate("# Just a normal README");
    expect(blocks).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test packages/readme-generator/test/parse.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement parser**

```typescript
// packages/readme-generator/src/parse.ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test packages/readme-generator/test/parse.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/readme-generator/src/parse.ts packages/readme-generator/test/
git commit -m "feat(readme-generator): implement template parser"
```

---

### Task 7: `readme-generator` — Build Logic

**Files:**
- Create: `packages/readme-generator/src/build.ts`
- Create: `packages/readme-generator/test/build.test.ts`

- [ ] **Step 1: Write failing tests for `toSvgFilename` and `replaceBlocks`**

```typescript
// packages/readme-generator/test/build.test.ts
import { describe, expect, it } from "bun:test";
import { replaceBlocks, toSvgFilename } from "../src/build.js";
import type { BadgeBlock } from "../src/parse.js";

describe("toSvgFilename", () => {
  it("converts a simple package name", () => {
    expect(toSvgFilename("copylen")).toBe("copylen.svg");
  });

  it("converts a scoped package name", () => {
    expect(toSvgFilename("@lollipop-onl/myzod-to-zod")).toBe(
      "lollipop-onl-myzod-to-zod.svg",
    );
  });
});

describe("replaceBlocks", () => {
  it("replaces badge blocks with img tags", () => {
    const template = `# Hello

\`\`\`badges:npm
@lollipop-onl/myzod-to-zod
copylen
\`\`\`

Footer.`;

    const block: BadgeBlock = {
      platform: "npm",
      packages: ["@lollipop-onl/myzod-to-zod", "copylen"],
      raw: "```badges:npm\n@lollipop-onl/myzod-to-zod\ncopylen\n```",
    };

    const result = replaceBlocks(template, [block]);

    expect(result).toContain(
      '<img src="./assets/badges/lollipop-onl-myzod-to-zod.svg" alt="@lollipop-onl/myzod-to-zod" width="800">',
    );
    expect(result).toContain(
      '<img src="./assets/badges/copylen.svg" alt="copylen" width="800">',
    );
    expect(result).toContain("# Hello");
    expect(result).toContain("Footer.");
    expect(result).not.toContain("```badges:npm");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test packages/readme-generator/test/build.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `replaceBlocks` and `toSvgFilename`**

```typescript
// packages/readme-generator/src/build.ts
import type { BadgeBlock } from "./parse.js";

export function toSvgFilename(packageName: string): string {
  return packageName.replace(/^@/, "").replace(/\//g, "-") + ".svg";
}

export function replaceBlocks(
  template: string,
  blocks: BadgeBlock[],
): string {
  let result = template;

  for (const block of blocks) {
    const imgTags = block.packages
      .map((pkg) => {
        const filename = toSvgFilename(pkg);
        return `<img src="./assets/badges/${filename}" alt="${pkg}" width="800">`;
      })
      .join("\n");

    result = result.replace(block.raw, imgTags);
  }

  return result;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test packages/readme-generator/test/build.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/readme-generator/src/build.ts packages/readme-generator/test/build.test.ts
git commit -m "feat(readme-generator): implement block replacement logic"
```

---

### Task 8: `readme-generator` — CLI Entry Point

**Files:**
- Create: `packages/readme-generator/src/cli.ts`
- Create: `packages/readme-generator/src/index.ts`

- [ ] **Step 1: Implement CLI**

```typescript
// packages/readme-generator/src/cli.ts
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { renderBadge } from "@lollipop-onl/badge-generator";
import {
  fetchNpmPackageInfo,
  npmToBadgeData,
} from "@lollipop-onl/badge-generator-npm";
import { parseTemplate } from "./parse.js";
import { replaceBlocks, toSvgFilename } from "./build.js";

const ROOT = join(import.meta.dirname, "..", "..", "..");
const TEMPLATE_PATH = join(ROOT, "src", "README.md");
const OUTPUT_PATH = join(ROOT, "README.md");
const BADGES_DIR = join(ROOT, "assets", "badges");

async function main() {
  const template = readFileSync(TEMPLATE_PATH, "utf-8");
  const blocks = parseTemplate(template);

  mkdirSync(BADGES_DIR, { recursive: true });

  for (const block of blocks) {
    if (block.platform !== "npm") {
      console.warn(`[WARN] Unknown platform: ${block.platform}, skipping`);
      continue;
    }

    for (const pkg of block.packages) {
      console.log(`Fetching: ${pkg}`);
      const info = await fetchNpmPackageInfo(pkg);
      if (!info) continue;

      const badgeData = npmToBadgeData(info);
      const svg = await renderBadge(badgeData);
      const filename = toSvgFilename(pkg);
      writeFileSync(join(BADGES_DIR, filename), svg);
      console.log(`Generated: ${filename}`);
    }
  }

  const readme = replaceBlocks(template, blocks);
  writeFileSync(OUTPUT_PATH, readme);
  console.log("README.md generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Create `packages/readme-generator/src/index.ts`**

```typescript
export { parseTemplate, type BadgeBlock } from "./parse.js";
export { replaceBlocks, toSvgFilename } from "./build.js";
```

- [ ] **Step 3: Commit**

```bash
git add packages/readme-generator/src/cli.ts packages/readme-generator/src/index.ts
git commit -m "feat(readme-generator): add CLI entry point"
```

---

### Task 9: Template と動作確認

**Files:**
- Create: `src/README.md`
- Create: `assets/badges/.gitkeep`

- [ ] **Step 1: Create `src/README.md`**

現在の `README.md` をコピーし、npm Packages セクションのバッジ部分を独自記法に置換する。リスト項目（`* [パッケージ名](URL) ... 説明`）は残し、その下のシールドバッジ行を `badges:npm` ブロックに集約する。

例: npm Packages セクションの現在のバッジ行群を以下に置き換える:

````markdown
```badges:npm
@lollipop-onl/myzod-to-zod
@passport-mrz/builder
@passport-mrz/renderer
copylen
docsify-serve
@lollipop-onl/vuex-typesafe-helper
@lollipop-onl/vue-typed-reactive
@lollipop-onl/axios-logger
```
````

- [ ] **Step 2: Create `assets/badges/.gitkeep`**

```bash
mkdir -p assets/badges && touch assets/badges/.gitkeep
```

- [ ] **Step 3: Run generate**

Run: `bun run generate`
Expected: 各パッケージの SVG が `assets/badges/` に生成され、`README.md` がビルドされる

- [ ] **Step 4: 生成された SVG と README.md を目視確認**

- `assets/badges/` に 8 個の SVG ファイルがある
- `README.md` にコードブロックが残っておらず `<img>` タグに置換されている
- SVG をブラウザで開いてレイアウトを確認

- [ ] **Step 5: Commit**

```bash
git add src/README.md assets/badges/ README.md
git commit -m "feat: add template and generate initial badge SVGs"
```

---

### Task 10: GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/generate-readme.yml`

- [ ] **Step 1: Create workflow file**

```yaml
# .github/workflows/generate-readme.yml
name: Generate README

on:
  schedule:
    - cron: "0 0 * * 1"
  workflow_dispatch:

permissions:
  contents: write

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - run: bun install --frozen-lockfile

      - run: bun run generate

      - name: Commit and push if changed
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add assets/badges/ README.md
          git diff --staged --quiet || (git commit -m "chore: update badge banners" && git push)
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/generate-readme.yml
git commit -m "ci: add weekly README generation workflow"
```

---

### Task 11: 全テスト実行と最終確認

- [ ] **Step 1: 全テスト実行**

Run: `bun test`
Expected: ALL PASS

- [ ] **Step 2: 型チェック**

Run: `bunx tsc --noEmit`
Expected: エラーなし

- [ ] **Step 3: 最終確認と生成再実行**

Run: `bun run generate`
Expected: 正常終了、`README.md` と SVG が最新
