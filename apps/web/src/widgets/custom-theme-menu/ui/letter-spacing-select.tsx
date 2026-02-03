"use client";

import { useCustomTheme } from "@/shared/providers/custom-theme-provider";
import { SliderWithInput } from "./slider-with-input";

export const LetterSpacingSelect = () => {
  const { config, updateLetterSpacing } = useCustomTheme();

  return (
    <SliderWithInput
      value={config.letterSpacing}
      onChange={updateLetterSpacing}
      min={0.15}
      max={0.35}
      step={0.01}
      unit="em"
      label="Letter Spacing"
    />
  );
};
