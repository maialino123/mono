"use client";

import { useTheme } from "next-themes";
import { cn } from "@/shared/lib";

export const AppearanceSelect = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "dark", label: "Dark" },
    { value: "light", label: "Light" },
    { value: "system", label: "System" },
  ] as const;

  const handleThemeChange = (theme: string) => {
    setTheme(theme);
  };

  return (
    <div className="flex items-center justify-between gap-2 px-3">
      {themes.map((themeOption) => {
        const isSelected = theme === themeOption.value;
        return (
          <label key={themeOption.value} className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="appearance"
              value={themeOption.value}
              checked={isSelected}
              onChange={() => handleThemeChange(themeOption.value)}
              className="sr-only"
            />
            <div
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors",
                isSelected ? "border-slate-900 dark:border-slate-100" : "border-slate-300 dark:border-slate-600",
              )}
            >
              {isSelected && <div className="h-2 w-2 rounded-full bg-slate-900 dark:bg-slate-100" />}
            </div>
            <span className="text-slate-700 text-sm dark:text-slate-300">{themeOption.label}</span>
          </label>
        );
      })}
    </div>
  );
};
