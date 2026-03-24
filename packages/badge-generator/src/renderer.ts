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
