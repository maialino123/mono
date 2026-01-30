"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "@/shared/lib/utils";

function Slider({ className, defaultValue, ...props }: SliderPrimitive.Root.Props) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      className={cn("relative flex w-full touch-none select-none items-center data-disabled:opacity-50", className)}
      {...props}
    >
      <SliderPrimitive.Control data-slot="slider-control" className="flex w-full items-center py-2">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted"
        >
          <SliderPrimitive.Indicator data-slot="slider-indicator" className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          className="block size-4 shrink-0 rounded-full border border-primary bg-background shadow-sm transition-[color,box-shadow] hover:ring-4 hover:ring-ring/50 focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
        />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
