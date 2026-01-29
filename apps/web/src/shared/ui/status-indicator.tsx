import { cn } from "@/shared/lib/utils";

interface StatusIndicatorProps {
  className?: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
}

export function StatusIndicator({ className, size = 12, color = "#FACC15", strokeWidth = 2 }: StatusIndicatorProps) {
  return (
    <svg
      className={cn(className)}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Status indicator"
    >
      <circle cx={size / 2} cy={size / 2} r={size / 2 - 1} stroke={color} strokeWidth={strokeWidth} />
    </svg>
  );
}
