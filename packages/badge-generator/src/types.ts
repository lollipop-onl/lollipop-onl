export type BadgeTheme = "dark" | "light";

export interface BadgeField {
  label: string;
  value: string;
  color?: string;
}

export interface BadgeData {
  name: string;
  description: string;
  logoSvg: string;
  inlineLogoSvg?: string;
  deprecated?: boolean;
  isNew?: boolean;
  fields: BadgeField[];
}
