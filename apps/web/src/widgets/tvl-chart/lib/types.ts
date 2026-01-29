export type ChartPeriod = "LIVE" | "1D" | "7D" | "30D" | "180D" | "ALL";

export interface TVLDataPoint {
  date: string;
  tvl: number;
  timestamp: number;
}

export interface TVLChartData {
  currentValue: number;
  change24h: number;
  points: TVLDataPoint[];
  maxTicks: number;
}
