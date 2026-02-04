"use client";

import { Input } from "@/shared/shadcn/input";
import { Label } from "@/shared/shadcn/label";
import { Slider } from "@/shared/shadcn/slider";

interface SliderWithInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  label: string;
}

export const SliderWithInput = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "px",
  label,
}: SliderWithInputProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === "" || inputValue === "-") {
      const fallbackValue = min;
      onChange(fallbackValue);
      return;
    }
    const newValue = Number(inputValue);
    if (!Number.isNaN(newValue)) {
      const clampedValue = Math.max(min, Math.min(max, newValue));
      onChange(clampedValue);
    }
  };

  return (
    <div className="mb-3">
      <div className="mb-1.5 flex items-center justify-between">
        <Label className="font-medium text-slate-700 text-sm dark:text-slate-300">
          {label}
        </Label>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            className="h-6 w-18 px-2 text-xs"
          />
          <span className="text-slate-500 text-xs dark:text-slate-400">
            {unit}
          </span>
        </div>
      </div>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={(value) => onChange(value as number)}
        className="w-full py-1"
      />
    </div>
  );
};
