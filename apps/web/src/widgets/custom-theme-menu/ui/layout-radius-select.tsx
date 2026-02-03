"use client";

import { useCustomTheme } from "@/shared/providers/custom-theme-provider";
import { SliderWithInput } from "./slider-with-input";

export const LayoutRadiusSelect = () => {
  const { config, updateRadius } = useCustomTheme();

  return (
    <SliderWithInput
      value={config.radius}
      onChange={updateRadius}
      min={0}
      max={32}
      step={1}
      unit="px"
      label="Radius"
    />
  );
};
