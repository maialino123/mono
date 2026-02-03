"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/shared/lib";
import { useCustomTheme } from "@/shared/providers/custom-theme-provider";
import { Button } from "@/shared/shadcn/button";

export const AppearanceSelect = () => {
  const { config, updateAppearance } = useCustomTheme();
  const { resolvedTheme } = useTheme();

  const modes = [
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "dark" as const, label: "Dark", icon: Moon },
  ];

  return (
    <div className="flex gap-2">
      {modes.map((mode) => {
        // When appearance is "system", check resolvedTheme. Otherwise, check config.appearance
        const isSelected =
          config.appearance === "system"
            ? resolvedTheme === mode.value
            : config.appearance === mode.value;
        return (
          <Button
            key={mode.value}
            variant={isSelected ? "default" : "outline"}
            size="default"
            onClick={() => updateAppearance(mode.value)}
            className={cn(
              "flex flex-1 rounded-lg px-3 py-2",
              isSelected
                ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                : "border-slate-200 bg-transparent text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800",
            )}
          >
            <mode.icon className="h-4 w-4" />
            {mode.label}
          </Button>
        );
      })}
    </div>
  );
};
