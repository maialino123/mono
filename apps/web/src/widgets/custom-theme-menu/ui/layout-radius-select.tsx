"use client";

import { useTheme } from "next-themes";
import { Slider } from "@/shared/shadcn/slider";

const MIN_RADIUS = 0;
const MAX_RADIUS = 32;
const STEP = 1;

export const LayoutRadiusSelect = () => {
  const { theme } = useTheme();

  const currentRadius = Number.parseInt(theme === "dark" ? "16" : "16", 10);

  return (
    <div className="space-y-3 px-3">
      <div className="px-1">
        <Slider
          value={[currentRadius]}
          min={MIN_RADIUS}
          max={MAX_RADIUS}
          step={STEP}
          className="w-full"
        />
      </div>
    </div>
  );
};
