"use client";

import { useTheme } from "next-themes";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  COLOR_KEY_TO_CSS_VAR,
  type ColorPalette,
  DEFAULT_THEME_CONFIG,
  STORAGE_KEY,
  type ThemeConfig,
} from "./theme-config";

interface CustomThemeContextValue {
  config: ThemeConfig;
  updateAppearance: (appearance: ThemeConfig["appearance"]) => void;
  updateFont: (font: string) => void;
  updateRadius: (radius: number) => void;
  updateLetterSpacing: (letterSpacing: number) => void;
  updateSpacing: (spacing: number) => void;
  updateColor: (
    mode: "light" | "dark",
    key: keyof ColorPalette,
    value: string,
  ) => void;
  resetToDefaults: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const CustomThemeContext = createContext<CustomThemeContextValue | undefined>(
  undefined,
);

function loadConfigFromStorage(): ThemeConfig {
  if (typeof window === "undefined") return DEFAULT_THEME_CONFIG;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<ThemeConfig>;
      if (parsed?.font && parsed.colors) {
        return { ...DEFAULT_THEME_CONFIG, ...parsed };
      }
    }
  } catch {
    // invalid data
  }
  return DEFAULT_THEME_CONFIG;
}

function persistConfig(config: ThemeConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // storage full or unavailable
  }
}

function injectGoogleFont(font: string) {
  const linkId = "custom-theme-google-font";
  let link = document.getElementById(linkId) as HTMLLinkElement | null;
  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;500;600;700&display=swap`;

  if (link) {
    if (link.href !== href) {
      link.href = href;
    }
    return;
  }

  link = document.createElement("link");
  link.id = linkId;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function applyThemeToDOM(config: ThemeConfig, resolvedMode: "light" | "dark") {
  const root = document.documentElement;
  const palette = config.colors[resolvedMode];

  for (const [key, cssVar] of Object.entries(COLOR_KEY_TO_CSS_VAR)) {
    const value = palette[key as keyof ColorPalette];
    if (value) {
      root.style.setProperty(cssVar, value);
    }
  }

  root.style.setProperty("--radius", `${config.radius / 16}rem`);
  root.style.setProperty("--letter-spacing", `${config.letterSpacing}em`);
  root.style.setProperty("--spacing", `${config.spacing}rem`);
  root.style.setProperty("--font-sans", `"${config.font}", sans-serif`);

  if (config.font !== "Inter") {
    injectGoogleFont(config.font);
  }
}

function removeThemeFromDOM() {
  const root = document.documentElement;
  for (const cssVar of Object.values(COLOR_KEY_TO_CSS_VAR)) {
    root.style.removeProperty(cssVar);
  }
  root.style.removeProperty("--radius");
  root.style.removeProperty("--letter-spacing");
  root.style.removeProperty("--spacing");
  root.style.removeProperty("--font-sans");

  const link = document.getElementById("custom-theme-google-font");
  if (link) link.remove();
}

interface CustomThemeProviderProps {
  children: ReactNode;
}

export const CustomThemeProvider = ({ children }: CustomThemeProviderProps) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [config, setConfig] = useState<ThemeConfig>(loadConfigFromStorage);
  const [isOpen, setIsOpen] = useState(false);
  const isInitialMount = useRef(true);

  const resolvedMode: "light" | "dark" =
    resolvedTheme === "dark" ? "dark" : "light";

  useLayoutEffect(() => {
    applyThemeToDOM(config, resolvedMode);
  }, [config, resolvedMode]);

  useLayoutEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (config.appearance !== DEFAULT_THEME_CONFIG.appearance) {
        setTheme(config.appearance);
      }
      return;
    }
  }, [setTheme, config.appearance]);

  const updateConfig = useCallback(
    (updater: (prev: ThemeConfig) => ThemeConfig) => {
      setConfig((prev) => {
        const next = updater(prev);
        persistConfig(next);
        return next;
      });
    },
    [],
  );

  const updateAppearance = useCallback(
    (appearance: ThemeConfig["appearance"]) => {
      setTheme(appearance);
      updateConfig((prev) => ({ ...prev, appearance }));
    },
    [setTheme, updateConfig],
  );

  const updateFont = useCallback(
    (font: string) => {
      updateConfig((prev) => ({ ...prev, font }));
    },
    [updateConfig],
  );

  const updateRadius = useCallback(
    (radius: number) => {
      updateConfig((prev) => ({ ...prev, radius }));
    },
    [updateConfig],
  );

  const updateLetterSpacing = useCallback(
    (letterSpacing: number) => {
      updateConfig((prev) => ({ ...prev, letterSpacing }));
    },
    [updateConfig],
  );

  const updateSpacing = useCallback(
    (spacing: number) => {
      updateConfig((prev) => ({ ...prev, spacing }));
    },
    [updateConfig],
  );

  const updateColor = useCallback(
    (mode: "light" | "dark", key: keyof ColorPalette, value: string) => {
      updateConfig((prev) => ({
        ...prev,
        colors: {
          ...prev.colors,
          [mode]: {
            ...prev.colors[mode],
            [key]: value,
          },
        },
      }));
    },
    [updateConfig],
  );

  const resetToDefaults = useCallback(() => {
    removeThemeFromDOM();
    setConfig(DEFAULT_THEME_CONFIG);
    setTheme(DEFAULT_THEME_CONFIG.appearance);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [setTheme]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const value: CustomThemeContextValue = {
    config,
    updateAppearance,
    updateFont,
    updateRadius,
    updateLetterSpacing,
    updateSpacing,
    updateColor,
    resetToDefaults,
    isOpen,
    open,
    close,
    toggle,
  };

  return (
    <CustomThemeContext.Provider value={value}>
      {children}
    </CustomThemeContext.Provider>
  );
};

export const useCustomTheme = (): CustomThemeContextValue => {
  const context = useContext(CustomThemeContext);
  if (context === undefined) {
    throw new Error("useCustomTheme must be used within a CustomThemeProvider");
  }
  return context;
};
