"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { MOCK_TVL_DATA } from "../lib/mock-data";
import type { ChartPeriod } from "../lib/types";
import { ChartHeader } from "./chart-header";
import { PeriodToggle } from "./period-toggle";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.[0]) return null;

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-semibold text-sm">
        $
        {payload[0].value.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
    </div>
  );
}

export function TVLChart() {
  const [period, setPeriod] = useState<ChartPeriod>("7D");
  const data = MOCK_TVL_DATA[period];
  const tickInterval = Math.max(
    Math.floor(data.points.length / data.maxTicks) - 1,
    0,
  );

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <ChartHeader
          currentValue={data.currentValue}
          change24h={data.change24h}
        />
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>

      <div
        className="relative w-full shrink-0 [&_.recharts-cartesian-grid>rect]:hidden [&_svg]:outline-none"
        style={{ height: 360, minHeight: 360 }}
      >
        <ResponsiveContainer width="100%" height={360}>
          <AreaChart
            data={data.points}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="75%" stopColor="#22c55e" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              interval={tickInterval}
              dy={8}
            />
            <YAxis
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              tickFormatter={(value: number) =>
                `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              }
              domain={["dataMin - 5", "dataMax + 5"]}
              dx={8}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="tvl"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#tvlGradient)"
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
