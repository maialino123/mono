"use client";

import { Palette, RotateCcw, Save } from "lucide-react";
import { cn } from "@/shared/lib";
import { useCustomTheme } from "@/shared/providers/custom-theme-provider";
import { Button } from "@/shared/shadcn/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/shadcn/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/shadcn/tabs";
import { AppearanceSelect } from "./appearance-select";
import { ColorConfig } from "./color-config";
import { FontSelect } from "./font-select";
import { LayoutRadiusSelect } from "./layout-radius-select";
import { LetterSpacingSelect } from "./letter-spacing-select";
import { SpacingSelect } from "./spacing-select";

interface CustomThemeMenuProps {
  className?: string;
}

export const CustomThemeMenu = ({ className }: CustomThemeMenuProps) => {
  const { isOpen, toggle, resetToDefaults } = useCustomTheme();

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
          className="flex w-full flex-col gap-0 overflow-visible bg-white sm:max-w-[364px] dark:bg-[#171717]"
          side="right"
        >
          <SheetHeader className="px-6">
            <SheetTitle className="font-medium text-[16px] text-black leading-6 tracking-normal dark:text-slate-100">
              Theme Generator
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-1 flex-col overflow-hidden px-6 pb-6">
            <div className="mb-4">
              <p className="mb-2 font-medium text-slate-700 text-sm dark:text-slate-300">Mode</p>
              <AppearanceSelect />
            </div>

            <Tabs defaultValue="colors" className="flex flex-1 flex-col overflow-hidden">
              <TabsList className="mb-3 grid w-full grid-cols-3">
                <TabsTrigger value="colors" className="cursor-pointer">
                  Colors
                </TabsTrigger>
                <TabsTrigger value="typography" className="cursor-pointer">
                  Typography
                </TabsTrigger>
                <TabsTrigger value="other" className="cursor-pointer">
                  Other
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="colors" className="mt-0">
                  <ColorConfig />
                </TabsContent>

                <TabsContent value="typography" className="mt-0 space-y-4">
                  <FontSelect />
                  <LetterSpacingSelect />
                </TabsContent>

                <TabsContent value="other" className="mt-0 space-y-4">
                  <LayoutRadiusSelect />
                  <SpacingSelect />
                </TabsContent>
              </div>
            </Tabs>

            <div className="flex gap-3 border-slate-200 border-t pt-4 dark:border-slate-700">
              <Button
                variant="outline"
                className="flex-1 cursor-pointer gap-2"
                onClick={() => {
                  // Save is implicit (auto-persists), but provide visual feedback
                  toggle();
                }}
              >
                <Save className="h-4 w-4" />
                Save Theme
              </Button>
              <Button
                variant="outline"
                className="flex-1 cursor-pointer gap-2"
                onClick={resetToDefaults}
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
