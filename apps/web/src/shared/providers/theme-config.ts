export interface ColorPalette {
  primary: string;
  secondary: string;
  background: string;
  card: string;
  secondaryCard: string;
  primaryText: string;
  secondaryText: string;
  mutedText: string;
  inverseText: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeConfig {
  appearance: "light" | "dark" | "system";
  font: string;
  radius: number;
  letterSpacing: number;
  spacing: number;
  colors: {
    light: ColorPalette;
    dark: ColorPalette;
  };
}

export const STORAGE_KEY = "custom-theme";

export const COLOR_KEY_TO_CSS_VAR: Record<keyof ColorPalette, string> = {
  primary: "--primary",
  secondary: "--secondary",
  background: "--background",
  card: "--card",
  secondaryCard: "--muted",
  primaryText: "--foreground",
  secondaryText: "--muted-foreground",
  mutedText: "--accent",
  inverseText: "--primary-foreground",
  success: "--chart-1",
  warning: "--chart-2",
  error: "--destructive",
  info: "--chart-3",
};

export const DEFAULT_LIGHT_PALETTE: ColorPalette = {
  primary: "#0d0d0d",
  secondary: "#f5f5f5",
  background: "#ffffff",
  card: "#ffffff",
  secondaryCard: "#f5f5f5",
  primaryText: "#0d0d0d",
  secondaryText: "#737373",
  mutedText: "#f5f5f5",
  inverseText: "#fafafa",
  success: "#5b9cf5",
  warning: "#4d7cf2",
  error: "#e54d4d",
  info: "#3d65d9",
};

export const DEFAULT_DARK_PALETTE: ColorPalette = {
  primary: "#dedede",
  secondary: "#303030",
  background: "#171717",
  card: "#1f1f1f",
  secondaryCard: "#303030",
  primaryText: "#fafafa",
  secondaryText: "#a3a3a3",
  mutedText: "#404040",
  inverseText: "#1f1f1f",
  success: "#5b9cf5",
  warning: "#4d7cf2",
  error: "#f87171",
  info: "#3d65d9",
};

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  appearance: "system",
  font: "Inter",
  radius: 10,
  letterSpacing: 0,
  spacing: 0.25,
  colors: {
    light: DEFAULT_LIGHT_PALETTE,
    dark: DEFAULT_DARK_PALETTE,
  },
};
