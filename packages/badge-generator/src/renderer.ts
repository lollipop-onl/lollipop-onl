// packages/badge-generator/src/renderer.ts
import satori from "satori";
import { loadFonts } from "./font.js";
import type { BadgeData, BadgeTheme } from "./types.js";

let fontsCache: Awaited<ReturnType<typeof loadFonts>> | null = null;

async function getFonts() {
  if (!fontsCache) {
    fontsCache = await loadFonts();
  }
  return fontsCache;
}

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

  const element = {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
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
                  {
                    type: "span",
                    props: {
                      style: { color: colors.secondary },
                      children: field.label,
                    },
                  },
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
