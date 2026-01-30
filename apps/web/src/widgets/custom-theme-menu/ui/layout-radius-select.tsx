"use client";

import { useCustomTheme } from "@/shared/providers/custom-theme-provider";
import { Slider } from "@/shared/shadcn/slider";

const MIN_RADIUS = 0;
const MAX_RADIUS = 32;
const STEP = 1;

export const LayoutRadiusSelect = () => {
  const { config, updateRadius } = useCustomTheme();

  return (
    <div className="space-y-3 px-3">
      <div className="px-1">
        <Slider
          value={[config.radius]}
          min={MIN_RADIUS}
          max={MAX_RADIUS}
          step={STEP}
          onValueChange={(value) => updateRadius(Array.isArray(value) ? value[0] : value)}
          className="w-full"
        />
      </div>
    </div>
  );
};
