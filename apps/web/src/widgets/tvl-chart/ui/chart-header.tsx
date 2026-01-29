import { cn } from "@/shared/lib/utils";

interface ChartHeaderProps {
  currentValue: number;
  change24h: number;
}

export function ChartHeader({ currentValue, change24h }: ChartHeaderProps) {
  const isPositive = change24h >= 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-full bg-green-600 font-bold text-white text-xs">
          C
        </div>
        <span className="font-medium text-muted-foreground text-sm">TVL</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-bold text-3xl tracking-tight">
          ${currentValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className={cn("font-medium text-sm", isPositive ? "text-green-600" : "text-red-500")}>
          {isPositive ? "↗" : "↘"}
          {Math.abs(change24h).toFixed(2)}% (24H)
        </span>
      </div>
    </div>
  );
}
