"use client";

import { useEffect, useState } from "react";
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

export const SliderWithInput = ({ value, onChange, min, max, step = 1, unit = "px", label }: SliderWithInputProps) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleSliderChange = (values: number[]) => {
    const newValue = values[0];
    setLocalValue(newValue);
    onChange(newValue);
  };

  const sliderId = `slider-${label.replace(/\s+/g, "-").toLowerCase()}`;
  const inputId = `input-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="mb-3">
      <div className="mb-1.5 flex items-center justify-between">
        <Label htmlFor={sliderId} className="font-medium text-slate-700 text-sm dark:text-slate-300">
          {label}
        </Label>
        <div className="flex items-center gap-1">
          <Input
            id={inputId}
            type="number"
            value={localValue}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            className="h-6 w-18 px-2 text-xs"
          />
          <span className="text-slate-500 text-xs dark:text-slate-400">{unit}</span>
        </div>
      </div>
      <Slider
        id={sliderId}
        value={[localValue]}
        min={min}
        max={max}
        step={step}
        onValueChange={handleSliderChange}
        className="w-full py-1"
      />
    </div>
  );
};
