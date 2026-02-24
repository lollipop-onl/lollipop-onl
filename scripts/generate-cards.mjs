// @ts-check
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "assets", "generated");

// ─── Data Definitions ───────────────────────────────────────────────

const NPM_PACKAGES = [
  { name: "@lollipop-onl/myzod-to-zod", desc: "myzod → Zod v3 Codemod" },
  { name: "@passport-mrz/builder", desc: "パスポート MRZ 文字列を生成" },
  { name: "@passport-mrz/renderer", desc: "パスポート MRZ を画像で生成" },
  { name: "copylen", desc: "文字数ごとに分割コピー CLI" },
  { name: "docsify-serve", desc: "Docsify Live Server 拡張" },
  {
    name: "@lollipop-onl/vuex-typesafe-helper",
    desc: "Vuex 型安全ヘルパー",
  },
  {
    name: "@lollipop-onl/vue-typed-reactive",
    desc: "型安全 Vue.set/delete",
  },
  { name: "@lollipop-onl/axios-logger", desc: "Axios 通信ログ表示" },
];

const DOCSIFY_PLUGINS = [
  {
    name: "docsify-shiki",
    desc: "Shiki ハイライター",
    jsdelivr: true,
  },
  {
    name: "docsify-plugin-github-footer",
    desc: "GitHub 編集リンクフッター",
    jsdelivr: true,
  },
  {
    name: "docsify-plugin-page-history",
    desc: "ページ変更履歴",
    jsdelivr: true,
  },
  {
    name: "docsify-plugin-ga",
    desc: "GA4 プラグイン",
    jsdelivr: true,
  },
];

const EXTENSIONS = [
  {
    name: "Backlog Pull Request Plus",
    chrome: "cpafengiapnopbnidfckgambaieonckn",
    firefox: "backlog-pull-request-plus",
  },
  {
    name: "File Icons for Backlog Git",
    chrome: "aeejnngbcaakhmbcllihmpfijmgaecia",
    firefox: "file-icons-for-backlog-git",
  },
  {
    name: "Backlog Notification",
    chrome: "gmmfbpjchelnedibjoidghghnigggebn",
    firefox: "backlog-notification-extension",
  },
  {
    name: "283 PiP",
    chrome: "gjpjhdmdbkiabejljimbnjdpmfdonpjb",
    firefox: null,
  },
  {
    name: "X2B",
    chrome: "caofchgmaapaimkghakiclhlbefjjfbk",
    firefox: "x2b",
  },
];

// ─── API Fetchers ───────────────────────────────────────────────────

async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getNpmInfo(pkg) {
  const [meta, downloads] = await Promise.all([
    fetchJSON(`https://registry.npmjs.org/${pkg}/latest`),
    fetchJSON(
      `https://api.npmjs.org/downloads/point/last-week/${pkg}`
    ),
  ]);
  return {
    version: meta?.version ?? "?",
    weeklyDownloads: downloads?.downloads ?? 0,
  };
}

async function getChromeInfo(id) {
  // Use shields.io endpoint as a proxy for Chrome Web Store data
  const [versionData, usersData] = await Promise.all([
    fetchJSON(
      `https://img.shields.io/chrome-web-store/v/${id}.json`
    ),
    fetchJSON(
      `https://img.shields.io/chrome-web-store/users/${id}.json`
    ),
  ]);
  return {
    version: versionData?.value ?? "?",
    users: usersData?.value ?? "?",
  };
}

async function getFirefoxInfo(slug) {
  const data = await fetchJSON(
    `https://addons.mozilla.org/api/v5/addons/addon/${slug}/`
  );
  return {
    version: data?.current_version?.version ?? "?",
    users: data?.average_daily_users != null ? String(data.average_daily_users) : "?",
  };
}

async function getJsDelivrHits(pkg) {
  const data = await fetchJSON(
    `https://img.shields.io/jsdelivr/npm/hw/${pkg}.json`
  );
  return data?.value ?? "?";
}

// ─── SVG Rendering Helpers ──────────────────────────────────────────

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatNumber(n) {
  if (typeof n !== "number") return String(n);
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

// ─── Color Palette ──────────────────────────────────────────────────

const COLORS = {
  bg: "#0d1117",
  cardBg: "#161b22",
  border: "#30363d",
  text: "#e6edf3",
  textMuted: "#8b949e",
  accent: "#58a6ff",
  accentGreen: "#3fb950",
  accentOrange: "#d29922",
  accentRed: "#f85149",
  accentPurple: "#bc8cff",
  npm: "#cb3837",
  chrome: "#4285f4",
  firefox: "#ff7139",
};

// ─── SVG Card: npm Packages ─────────────────────────────────────────

function renderNpmCard(packages) {
  const rowH = 52;
  const headerH = 56;
  const padY = 16;
  const cardW = 840;
  const cardH = headerH + packages.length * rowH + padY;

  const rows = packages
    .map((pkg, i) => {
      const y = headerH + i * rowH;
      const isEven = i % 2 === 0;
      return `
    <g transform="translate(0, ${y})">
      ${isEven ? `<rect x="0" y="0" width="${cardW}" height="${rowH}" rx="0" fill="${COLORS.cardBg}" opacity="0.5"/>` : ""}
      <text x="24" y="22" fill="${COLORS.accent}" font-size="13" font-weight="600" font-family="'Segoe UI','Helvetica Neue',Arial,sans-serif">${escapeXml(pkg.name)}</text>
      <text x="24" y="40" fill="${COLORS.textMuted}" font-size="11" font-family="'Segoe UI','Helvetica Neue',Arial,sans-serif">${escapeXml(pkg.desc)}</text>
      <g transform="translate(${cardW - 240}, 10)">
        <rect x="0" y="0" width="72" height="24" rx="12" fill="${COLORS.npm}" opacity="0.15"/>
        <text x="36" y="16" fill="${COLORS.npm}" font-size="11" font-weight="600" text-anchor="middle" font-family="'Segoe UI','Helvetica Neue',Arial,sans-serif">v${escapeXml(pkg.version)}</text>
      </g>
      <g transform="translate(${cardW - 154}, 10)">
        <rect x="0" y="0" width="130" height="24" rx="12" fill="${COLORS.accentGreen}" opacity="0.1"/>
        <text x="65" y="16" fill="${COLORS.accentGreen}" font-size="11" text-anchor="middle" font-family="'Segoe UI','Helvetica Neue',Arial,sans-serif">⬇ ${escapeXml(formatNumber(pkg.weeklyDownloads))}/week</text>
      </g>
    </g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${cardW}" height="${cardH}" viewBox="0 0 ${cardW} ${cardH}">
  <defs>
    <linearGradient id="npm-header" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${COLORS.npm}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${COLORS.accentPurple}" stop-opacity="0.1"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${cardW}" height="${cardH}" rx="12" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>

  <!-- Header -->
  <rect x="0.5" y="0.5" width="${cardW - 1}" height="${headerH}" rx="12" fill="url(#npm-header)"/>
  <rect x="0.5" y="24" width="${cardW - 1}" height="${headerH - 24}" fill="url(#npm-header)"/>
  <line x1="0" y1="${headerH}" x2="${cardW}" y2="${headerH}" stroke="${COLORS.border}" stroke-width="0.5"/>
  <text x="24" y="36" fill="${COLORS.text}" font-size="16" font-weight="700" font-family="'Segoe UI','Helvetica Neue',Arial,sans-serif">📦  npm Packages</text>

  ${rows}
</svg>`;
}

// ─── SVG Card: Docsify Plugins ──────────────────────────────────────

function renderDocsifyCard(plugins) {
  const rowH = 52;
  const headerH = 56;
  const padY = 16;
  const cardW = 840;
  const cardH = headerH + plugins.length * rowH + padY;

  const rows = plugins
    .map((pkg, i) => {
      const y = headerH + i * rowH;
      const isEven = i % 2 === 0;
      return `
    <g transform="translate(0, ${y})">
      ${isEven ? `<rect x="0" y="0" width="${cardW}" height="${rowH}" rx="0" fill="${COLORS.cardBg}" opacity="0.5"/>` : ""}
      <text x="24" y="22" fill="${COLORS.accentPurple}" font-size="13" font-weight="600" font-family="'Segoe UI','Helvetica Neue',Arial,sans-serif">${escapeXml(pkg.name)}</text>
      <text x="24" y="40" fill="${COLORS.textMuted}" font-size="11" font-family="'Segoe UI','Helvetica Neue',Arial,sans-serif">${escapeXml(pkg.desc)}</text>
      <g transform="translate(${cardW - 240}, 10)">
        <rect x="0" y="0" width="72" height="24" rx="12" fill="${COLORS.npm}" opacity="0.15"/>
        <text x="36" y="16" fill="${COLORS.npm}" font-size="11" font-weight="600" text-anchor="middle" font-family="'Segoe UI','Helvetica Neue',Arial,sans-serif">v${escapeXml(pkg.version)}</text>
      </g>
      <g transform="translate(${cardW - 154}, 10)">
        <rect x="0" y="0" width="130" height="24" rx="12" fill="${COLORS.accentOrange}" opacity="0.1"/>
        <text x="65" y="16" fill="${COLORS.accentOrange}" font-size="11" text-anchor="middle" font-family="'Segoe UI','Helvetica Neue',Arial,sans-serif">cdn ${escapeXml(pkg.jsdelivrHits)}</text>
      </g>
    </g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${cardW}" height="${cardH}" viewBox="0 0 ${cardW} ${cardH}">
  <defs>
    <linearGradient id="doc-header" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${COLORS.accentPurple}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${COLORS.accent}" stop-opacity="0.1"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${cardW}" height="${cardH}" rx="12" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>

  <rect x="0.5" y="0.5" width="${cardW - 1}" height="${headerH}" rx="12" fill="url(#doc-header)"/>
  <rect x="0.5" y="24" width="${cardW - 1}" height="${headerH - 24}" fill="url(#doc-header)"/>
  <line x1="0" y1="${headerH}" x2="${cardW}" y2="${headerH}" stroke="${COLORS.border}" stroke-width="0.5"/>
  <text x="24" y="36" fill="${COLORS.text}" font-size="16" font-weight="700" font-family="'Segoe UI','Helvetica Neue',Arial,sans-serif">🔌  Docsify Plugins</text>

  ${rows}
</svg>`;
}

// ─── SVG Card: Browser Extensions ───────────────────────────────────

function renderExtensionsCard(extensions) {
  const rowH = 62;
  const headerH = 56;
  const padY = 16;
  const cardW = 840;
  const cardH = headerH + extensions.length * rowH + padY;

  const rows = extensions
    .map((ext, i) => {
      const y = headerH + i * rowH;
      const isEven = i % 2 === 0;

      const firefoxBadge = ext.firefox
        ? `<g transform="translate(${cardW - 154}, 10)">
        <rect x="0" y="0" width="130" height="24" rx="12" fill="${COLORS.firefox}" opacity="0.12"/>
        <text x="65" y="16" fill="${COLORS.firefox}" font-size="11" text-anchor="middle" font-family="'Segoe UI','Helvetica Neue',Arial,sans-serif">🦊 v${escapeXml(ext.firefoxVersion)} · ${escapeXml(ext.firefoxUsers)}</text>
      </g>`
        : "";

      return `
    <g transform="translate(0, ${y})">
      ${isEven ? `<rect x="0" y="0" width="${cardW}" height="${rowH}" rx="0" fill="${COLORS.cardBg}" opacity="0.5"/>` : ""}
      <text x="24" y="24" fill="${COLORS.accent}" font-size="13" font-weight="600" font-family="'Segoe UI','Helvetica Neue',Arial,sans-serif">${escapeXml(ext.name)}</text>
      <g transform="translate(${cardW - 440}, 10)">
        <rect x="0" y="0" width="272" height="24" rx="12" fill="${COLORS.chrome}" opacity="0.1"/>
        <text x="136" y="16" fill="${COLORS.chrome}" font-size="11" text-anchor="middle" font-family="'Segoe UI','Helvetica Neue',Arial,sans-serif">Chrome v${escapeXml(ext.chromeVersion)} · ${escapeXml(ext.chromeUsers)} users</text>
      </g>
      ${firefoxBadge}
      ${ext.isNew ? `<text x="24" y="46" fill="${COLORS.accentGreen}" font-size="10" font-weight="600" font-family="'Segoe UI','Helvetica Neue',Arial,sans-serif">NEW</text>` : ""}
    </g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${cardW}" height="${cardH}" viewBox="0 0 ${cardW} ${cardH}">
  <defs>
    <linearGradient id="ext-header" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${COLORS.chrome}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${COLORS.firefox}" stop-opacity="0.1"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${cardW}" height="${cardH}" rx="12" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>

  <rect x="0.5" y="0.5" width="${cardW - 1}" height="${headerH}" rx="12" fill="url(#ext-header)"/>
  <rect x="0.5" y="24" width="${cardW - 1}" height="${headerH - 24}" fill="url(#ext-header)"/>
  <line x1="0" y1="${headerH}" x2="${cardW}" y2="${headerH}" stroke="${COLORS.border}" stroke-width="0.5"/>
  <text x="24" y="36" fill="${COLORS.text}" font-size="16" font-weight="700" font-family="'Segoe UI','Helvetica Neue',Arial,sans-serif">🧩  Browser Extensions</text>

  ${rows}
</svg>`;
}

// ─── Main ───────────────────────────────────────────────────────────

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  console.log("Fetching npm package data...");
  const npmData = await Promise.all(
    NPM_PACKAGES.map(async (pkg) => {
      const info = await getNpmInfo(pkg.name);
      console.log(`  ${pkg.name}: v${info.version}, ${info.weeklyDownloads}/week`);
      return { ...pkg, ...info };
    })
  );

  console.log("Fetching docsify plugin data...");
  const docsifyData = await Promise.all(
    DOCSIFY_PLUGINS.map(async (pkg) => {
      const [npmInfo, jsdelivrHits] = await Promise.all([
        getNpmInfo(pkg.name),
        pkg.jsdelivr ? getJsDelivrHits(pkg.name) : Promise.resolve("?"),
      ]);
      console.log(`  ${pkg.name}: v${npmInfo.version}, cdn ${jsdelivrHits}`);
      return { ...pkg, ...npmInfo, jsdelivrHits };
    })
  );

  console.log("Fetching browser extension data...");
  const extData = await Promise.all(
    EXTENSIONS.map(async (ext) => {
      const [chrome, firefox] = await Promise.all([
        getChromeInfo(ext.chrome),
        ext.firefox ? getFirefoxInfo(ext.firefox) : Promise.resolve(null),
      ]);
      const isNew = ext.name === "Backlog Pull Request Plus" || ext.name === "File Icons for Backlog Git";
      console.log(`  ${ext.name}: Chrome v${chrome.version}, ${chrome.users} users`);
      return {
        ...ext,
        chromeVersion: chrome.version,
        chromeUsers: chrome.users,
        firefoxVersion: firefox?.version ?? null,
        firefoxUsers: firefox?.users ?? null,
        isNew,
      };
    })
  );

  // Render SVGs
  console.log("Generating SVG cards...");

  const npmSvg = renderNpmCard(npmData);
  writeFileSync(join(OUT_DIR, "npm-packages.svg"), npmSvg);
  console.log("  -> npm-packages.svg");

  const docsifySvg = renderDocsifyCard(docsifyData);
  writeFileSync(join(OUT_DIR, "docsify-plugins.svg"), docsifySvg);
  console.log("  -> docsify-plugins.svg");

  const extSvg = renderExtensionsCard(extData);
  writeFileSync(join(OUT_DIR, "browser-extensions.svg"), extSvg);
  console.log("  -> browser-extensions.svg");

  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
