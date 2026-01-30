"use client";

import { useTheme } from "next-themes";
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (/^#[0-9A-Fa-f]{0,6}$/.test(newValue) || newValue === "") {
      onChange(newValue);
    }
  };

  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div
        className="h-6 w-6 shrink-0 rounded border border-slate-300 dark:border-slate-600"
        style={{ backgroundColor: value || "#000000" }}
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
        onChange={handleChange}
        placeholder="#000000"
        className="h-8 w-24 border-slate-300 bg-white font-mono text-xs dark:border-gray-600 dark:bg-gray-800"
        maxLength={7}
      />
    </div>
  );
};

interface ColorSectionProps {
  title: string;
  colors: Array<{ key: string; label: string }>;
  colorScheme: string;
  onColorChange: (key: string, value: string) => void;
}

const ColorSection = ({
  title,
  colors,
  colorScheme,
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
              value={colorScheme === "dark" ? "dark" : "light"}
              onChange={(value) => onColorChange(key, value)}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export const ColorSwatches = () => {
  const previewColors = [
    "primary",
    "secondary",
    "appBackground",
    "cardBackground",
    "success",
    "error",
    "warning",
    "info",
  ].filter(Boolean) as string[];

  return (
    <div className="flex h-full items-center">
      {previewColors.slice(0, 6).map((color) => (
        <div
          key={color}
          className="h-4 w-4"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
};

export const ColorConfig = () => {
  const { resolvedTheme } = useTheme();

  const currentMode = resolvedTheme === "dark" ? "dark" : "light";

  const handleColorChange = (_key: string, _value: string) => {
    //
  };

  const colorSections = [
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
        { key: "appBackground", label: "App Background" },
        { key: "cardBackground", label: "Card Background" },
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

  return (
    <div className="space-y-3 px-3">
      {/* Nested Accordion for Color Sections */}
      <Accordion className="w-full">
        {colorSections.map((section) => (
          <ColorSection
            key={section.title}
            title={section.title}
            colors={section.colors}
            colorScheme={currentMode}
            onColorChange={handleColorChange}
          />
        ))}
      </Accordion>
    </div>
  );
};
