"use client";

import { useCustomTheme } from "@/shared/providers/custom-theme-provider";
import { SliderWithInput } from "./slider-with-input";

export const LetterSpacingSelect = () => {
  const { config, updateLetterSpacing } = useCustomTheme();

  return (
    <SliderWithInput
      value={config.letterSpacing}
      onChange={updateLetterSpacing}
      min={-0.25}
      max={0.25}
      step={0.025}
      unit="em"
      label="Letter Spacing"
    />
  );
};
