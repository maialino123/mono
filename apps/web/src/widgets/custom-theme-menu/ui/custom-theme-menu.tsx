"use client";

import { Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/shared/lib";
import { useCustomTheme } from "@/shared/providers/custom-theme-provider";
import { Accordion } from "@/shared/shadcn/accordion";
import { Button } from "@/shared/shadcn/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/shadcn/sheet";
import { AppearanceSelect } from "./appearance-select";
import { ColorConfig, ColorSwatches } from "./color-config";
import { CustomAccordionItem } from "./custom-accordion";
import { FontSelect } from "./font-select";
import { LayoutRadiusSelect } from "./layout-radius-select";

interface CustomThemeMenuProps {
  className?: string;
}

export const CustomThemeMenu = ({ className }: CustomThemeMenuProps) => {
  const { theme } = useTheme();
  const { isOpen, toggle } = useCustomTheme();

  return (
    <div className={cn("absolute right-6 bottom-6 z-50", className)}>
      <Sheet open={isOpen} onOpenChange={toggle}>
        <SheetTrigger>
          <Button
            className="h-12 w-12 cursor-pointer rounded-full border-2 border-slate-400 bg-slate-200 hover:bg-slate-300 dark:border-slate-500 dark:bg-slate-700 dark:hover:bg-slate-600"
            size="icon"
            aria-label="Open custom theme menu"
          >
            <Palette className="h-6 w-6 text-black dark:text-white" />
          </Button>
        </SheetTrigger>
        <SheetContent
          className="w-full gap-0 overflow-visible bg-white sm:max-w-[364px] dark:bg-[#171717]"
          side="right"
        >
          <SheetHeader className="px-6">
            <SheetTitle className="font-medium text-[16px] text-black leading-6 tracking-normal dark:text-slate-100">
              Customize Your Brand
            </SheetTitle>
          </SheetHeader>
          <Accordion className="space-y-4 overflow-visible px-6 pb-6">
            <CustomAccordionItem value="appearance" themeValue={theme}>
              <AppearanceSelect />
            </CustomAccordionItem>
            <CustomAccordionItem value="font" themeValue={theme === "dark" ? "Inter" : "Inter"}>
              <FontSelect />
            </CustomAccordionItem>
            <CustomAccordionItem value="layout radius" themeValue={theme === "dark" ? "16px" : "16px"}>
              <LayoutRadiusSelect />
            </CustomAccordionItem>
            <CustomAccordionItem value="color" triggerSlot={<ColorSwatches />}>
              <ColorConfig />
            </CustomAccordionItem>
          </Accordion>
        </SheetContent>
      </Sheet>
    </div>
  );
};
