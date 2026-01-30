"use client";

import { useTheme } from "next-themes";
import { useRef } from "react";
import { useCustomTheme } from "@/shared/providers/custom-theme-provider";
import type { ColorPalette } from "@/shared/providers/theme-config";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/shadcn/accordion";
import { Input } from "@/shared/shadcn/input";

interface ColorInputProps {
  label: string;
  colorKey: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorInput = ({ label, colorKey, value, onChange }: ColorInputProps) => {
  const inputId = `color-input-${colorKey}`;
  const nativePickerRef = useRef<HTMLInputElement>(null);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (/^#[0-9A-Fa-f]{0,6}$/.test(newValue) || newValue === "") {
      onChange(newValue);
    }
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <button
        type="button"
        className="h-6 w-6 shrink-0 cursor-pointer rounded border border-slate-300 dark:border-slate-600"
        style={{ backgroundColor: value || "#000000" }}
        onClick={() => nativePickerRef.current?.click()}
        aria-label={`Pick color for ${label}`}
      />
      <label
        htmlFor={inputId}
        className="flex-1 font-medium text-slate-700 text-sm dark:text-slate-300"
      >
        {label}
      </label>
      <Input
        id={inputId}
        type="text"
        value={value}
        onChange={handleHexChange}
        placeholder="#000000"
        className="h-8 w-24 border-slate-300 bg-white font-mono text-xs dark:border-gray-600 dark:bg-gray-800"
        maxLength={7}
      />
      <input
        ref={nativePickerRef}
        type="color"
        value={value || "#000000"}
        onChange={handleNativeChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
};

interface ColorSectionProps {
  title: string;
  colors: Array<{ key: keyof ColorPalette; label: string }>;
  palette: ColorPalette;
  onColorChange: (key: keyof ColorPalette, value: string) => void;
}

const ColorSection = ({
  title,
  colors,
  palette,
  onColorChange,
}: ColorSectionProps) => {
  return (
    <AccordionItem
      value={title.toLowerCase().replace(/\s+/g, "-")}
      className="border-0 border-slate-200 border-b last:border-b-0 dark:border-gray-700"
    >
      <AccordionTrigger className="px-3 py-2.5 hover:no-underline focus:no-underline">
        <span className="font-medium text-slate-600 text-sm dark:text-slate-300">
          {title}
        </span>
      </AccordionTrigger>
      <AccordionContent className="pt-1 pb-2">
        <div className="space-y-0">
          {colors.map(({ key, label }) => (
            <ColorInput
              key={key}
              label={label}
              colorKey={key}
              value={palette[key]}
              onChange={(value) => onColorChange(key, value)}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const PREVIEW_COLOR_KEYS: (keyof ColorPalette)[] = [
  "primary",
  "secondary",
  "background",
  "card",
  "success",
  "error",
];

export const ColorSwatches = () => {
  const { config } = useCustomTheme();
  const { resolvedTheme } = useTheme();
  const currentMode: "light" | "dark" = resolvedTheme === "dark" ? "dark" : "light";
  const palette = config.colors[currentMode];

  return (
    <div className="flex h-full items-center">
      {PREVIEW_COLOR_KEYS.map((key) => (
        <div
          key={key}
          className="h-4 w-4"
          style={{ backgroundColor: palette[key] }}
        />
      ))}
    </div>
  );
};

const COLOR_SECTIONS: Array<{
  title: string;
  colors: Array<{ key: keyof ColorPalette; label: string }>;
}> = [
  {
    title: "Core Brand Colors",
    colors: [
      { key: "primary", label: "Primary" },
      { key: "secondary", label: "Secondary" },
    ],
  },
  {
    title: "Neutral / Layout Colors",
    colors: [
      { key: "background", label: "App Background" },
      { key: "card", label: "Card Background" },
      { key: "secondaryCard", label: "Secondary Card" },
    ],
  },
  {
    title: "Text Colors",
    colors: [
      { key: "primaryText", label: "Primary Text" },
      { key: "secondaryText", label: "Secondary Text" },
      { key: "mutedText", label: "Muted / Hint" },
      { key: "inverseText", label: "Inverse Text" },
    ],
  },
  {
    title: "Status Colors",
    colors: [
      { key: "success", label: "Success" },
      { key: "warning", label: "Warning" },
      { key: "error", label: "Error" },
      { key: "info", label: "Info" },
    ],
  },
];

export const ColorConfig = () => {
  const { config, updateColor } = useCustomTheme();
  const { resolvedTheme } = useTheme();
  const currentMode: "light" | "dark" = resolvedTheme === "dark" ? "dark" : "light";
  const palette = config.colors[currentMode];

  const handleColorChange = (key: keyof ColorPalette, value: string) => {
    updateColor(currentMode, key, value);
  };

  return (
    <div className="space-y-3 px-3">
      <Accordion className="w-full">
        {COLOR_SECTIONS.map((section) => (
          <ColorSection
            key={section.title}
            title={section.title}
            colors={section.colors}
            palette={palette}
            onColorChange={handleColorChange}
          />
        ))}
      </Accordion>
    </div>
  );
};
