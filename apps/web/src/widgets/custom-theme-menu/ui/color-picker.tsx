"use client";

import { Input } from "@/shared/shadcn/input";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const ColorPicker = ({ value, onChange, placeholder = "#000000", className }: ColorPickerProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (/^#[0-9A-Fa-f]{0,6}$/.test(newValue) || newValue === "") {
      onChange(newValue);
    }
  };

  return (
    <Input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      maxLength={7}
    />
  );
};
