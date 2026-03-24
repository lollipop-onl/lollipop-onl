export type BadgeTheme = "dark" | "light";

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
