// packages/badge-generator/src/renderer.ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import { loadFonts } from "./font.js";
import type { BadgeData, BadgeTheme } from "./types.js";

const ICONS_DIR = join(
  import.meta.dirname,
  "..",
  "..",
  "..",
  "node_modules",
  "@tabler",
  "icons",
  "icons",
  "outline",
);

const FIELD_ICONS: Record<string, string> = {
  version: readFileSync(join(ICONS_DIR, "tag.svg"), "utf-8"),
  downloads: readFileSync(join(ICONS_DIR, "download.svg"), "utf-8"),
  hits: readFileSync(join(ICONS_DIR, "download.svg"), "utf-8"),
  updated: readFileSync(join(ICONS_DIR, "calendar.svg"), "utf-8"),
  license: readFileSync(join(ICONS_DIR, "license.svg"), "utf-8"),
};

function iconSvgWithColor(svgStr: string, color: string): string {
  return svgStr
    .replace(/class="[^"]*"/g, "")
    .replace(/stroke="currentColor"/g, `stroke="${color}"`);
}

let fontsCache: Awaited<ReturnType<typeof loadFonts>> | null = null;

async function getFonts() {
  if (!fontsCache) {
    fontsCache = await loadFonts();
  }
  return fontsCache;
}

const DEPRECATED_ICON = readFileSync(join(ICONS_DIR, "alert-triangle.svg"), "utf-8");

const themeColors = {
  dark: {
    bg: "#0d1117",
    border: "#30363d",
    text: "#e6edf3",
    secondary: "#8b949e",
    fieldBg: "#161b22",
    fieldBorder: "#30363d",
  },
  light: {
    bg: "#ffffff",
    border: "#d1d9e0",
    text: "#1f2328",
    secondary: "#656d76",
    fieldBg: "#f6f8fa",
    fieldBorder: "#d1d9e0",
  },
} as const;

export async function renderBadge(
  data: BadgeData,
  theme: BadgeTheme = "dark",
): Promise<string> {
  const fonts = await getFonts();
  const colors = themeColors[theme];

  const headerChildren: any[] = [
    {
      type: "img",
      props: {
        src: `data:image/svg+xml,${encodeURIComponent(data.logoSvg)}`,
        width: 28,
        height: 28,
        style: { borderRadius: "4px", objectFit: "contain" },
      },
    },
    {
      type: "span",
      props: {
        style: { fontWeight: 700, fontSize: "16px" },
        children: data.name,
      },
    },
  ];

  if (data.inlineLogoSvg) {
    headerChildren.push({
      type: "img",
      props: {
        src: `data:image/svg+xml,${encodeURIComponent(data.inlineLogoSvg)}`,
        width: 72,
        height: 20,
      },
    });
  }

  if (data.deprecated) {
    headerChildren.push({
      type: "div",
      props: {
        style: {
          display: "flex",
          alignItems: "center",
          gap: "3px",
          padding: "2px 8px",
          backgroundColor: "#da3633",
          borderRadius: "12px",
          fontSize: "11px",
          color: "#ffffff",
          fontWeight: 700,
        },
        children: [
          {
            type: "img",
            props: {
              src: `data:image/svg+xml,${encodeURIComponent(iconSvgWithColor(DEPRECATED_ICON, "#ffffff"))}`,
              width: 12,
              height: 12,
            },
          },
          "DEPRECATED",
        ],
      },
    });
  }

  const newRibbon = data.isNew
    ? {
        type: "div",
        props: {
          style: {
            position: "absolute" as const,
            top: "12px",
            right: "-40px",
            display: "flex",
            width: "140px",
            padding: "4px 0",
            backgroundColor: "#2da44e",
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: 700,
            transform: "rotate(45deg)",
            letterSpacing: "1px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
          },
          children: [
            {
              type: "span",
              props: {
                style: { margin: "0 auto" },
                children: "NEW",
              },
            },
          ],
        },
      }
    : null;

  const element = {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        position: "relative" as const,
        width: "100%",
        padding: "16px 20px",
        backgroundColor: colors.bg,
        borderRadius: "8px",
        border: `1px solid ${colors.border}`,
        color: colors.text,
        fontFamily: "Noto Sans JP",
        fontSize: "14px",
      },
      children: [
        ...(newRibbon ? [newRibbon] : []),
        // Header: logo + name
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "12px",
            },
            children: headerChildren,
          },
        },
        // Description
        {
          type: "div",
          props: {
            style: {
              marginTop: "4px",
              marginLeft: "40px",
              color: colors.secondary,
              fontSize: "13px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
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
                  backgroundColor: colors.fieldBg,
                  borderRadius: "12px",
                  border: `1px solid ${colors.fieldBorder}`,
                },
                children: [
                  ...(FIELD_ICONS[field.label]
                    ? [
                        {
                          type: "img",
                          props: {
                            src: `data:image/svg+xml,${encodeURIComponent(iconSvgWithColor(FIELD_ICONS[field.label], colors.secondary))}`,
                            width: 14,
                            height: 14,
                          },
                        },
                      ]
                    : [
                        {
                          type: "span",
                          props: {
                            style: { color: colors.secondary },
                            children: field.label,
                          },
                        },
                      ]),
                  {
                    type: "span",
                    props: {
                      style: { color: colors.text, fontWeight: 700 },
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
