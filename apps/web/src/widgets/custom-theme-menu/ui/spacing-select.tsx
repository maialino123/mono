"use client";

import { useCustomTheme } from "@/shared/providers/custom-theme-provider";
import { SliderWithInput } from "./slider-with-input";

export const SpacingSelect = () => {
  const { config, updateSpacing } = useCustomTheme();

  return (
    <div className="px-3">
      <SliderWithInput
        value={config.spacing}
        onChange={updateSpacing}
        min={0.15}
        max={0.35}
        step={0.01}
        unit="rem"
        label="Spacing"
      />
    </div>
  );
};
