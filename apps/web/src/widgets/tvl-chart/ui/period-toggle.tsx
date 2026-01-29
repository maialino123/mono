"use client";

import { cn } from "@/shared/lib/utils";
import type { ChartPeriod } from "../lib/types";

const PERIODS: ChartPeriod[] = ["LIVE", "1D", "7D", "30D", "180D", "ALL"];

interface PeriodToggleProps {
  value: ChartPeriod;
  onChange: (period: ChartPeriod) => void;
}

export function PeriodToggle({ value, onChange }: PeriodToggleProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {PERIODS.map((period) => (
        <button
          key={period}
          type="button"
          onClick={() => onChange(period)}
          className={cn(
            "shrink-0 cursor-pointer rounded-md px-2.5 py-1 font-medium text-xs transition-colors duration-200",
            value === period ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {period === "LIVE" && <span className="mr-1 inline-block size-1.5 rounded-full bg-green-500" />}
          {period === "ALL" ? "All Time" : period}
        </button>
      ))}
    </div>
  );
}
