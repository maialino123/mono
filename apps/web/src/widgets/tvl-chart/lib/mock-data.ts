import type { ChartPeriod, TVLChartData } from "./types";

interface PeriodConfig {
  days: number;
  points: number;
  maxTicks: number;
  baseValue: number;
  volatility: number;
  dateFormat: Intl.DateTimeFormatOptions;
}

const PERIOD_CONFIG: Record<ChartPeriod, PeriodConfig> = {
  LIVE: {
    days: 0.04,
    points: 60,
    maxTicks: 6,
    baseValue: 393,
    volatility: 0.5,
    dateFormat: { hour: "2-digit", minute: "2-digit", hour12: false },
  },
  "1D": {
    days: 1,
    points: 48,
    maxTicks: 12,
    baseValue: 390,
    volatility: 2,
    dateFormat: { hour: "2-digit", minute: "2-digit", hour12: false },
  },
  "7D": {
    days: 7,
    points: 56,
    maxTicks: 7,
    baseValue: 385,
    volatility: 5,
    dateFormat: { weekday: "short", day: "numeric" },
  },
  "30D": {
    days: 30,
    points: 60,
    maxTicks: 6,
    baseValue: 370,
    volatility: 8,
    dateFormat: { month: "short", day: "numeric" },
  },
  "180D": {
    days: 180,
    points: 90,
    maxTicks: 6,
    baseValue: 340,
    volatility: 15,
    dateFormat: { month: "short", year: "2-digit" },
  },
  ALL: {
    days: 365,
    points: 120,
    maxTicks: 6,
    baseValue: 300,
    volatility: 20,
    dateFormat: { month: "short", year: "2-digit" },
  },
};

function generatePoints(config: PeriodConfig) {
  const { days, points: count, baseValue, volatility, dateFormat } = config;
  const result = [];
  const now = Date.now();
  const interval = (days * 24 * 60 * 60 * 1000) / count;
  let value = baseValue;

  for (let i = 0; i <= count; i++) {
    const timestamp = now - (count - i) * interval;
    const date = new Date(timestamp);
    const change = (Math.random() - 0.48) * volatility;
    value = Math.max(value + change, baseValue * 0.85);
    value = Math.min(value, baseValue * 1.15);

    result.push({
      date: date.toLocaleString("en-US", dateFormat),
      tvl: Number.parseFloat(value.toFixed(2)),
      timestamp,
    });
  }

  return result;
}

function buildChartData(period: ChartPeriod): TVLChartData {
  const config = PERIOD_CONFIG[period];
  return {
    currentValue: 393.28,
    change24h: 1.47,
    points: generatePoints(config),
    maxTicks: config.maxTicks,
  };
}

export const MOCK_TVL_DATA: Record<ChartPeriod, TVLChartData> = {
  LIVE: buildChartData("LIVE"),
  "1D": buildChartData("1D"),
  "7D": buildChartData("7D"),
  "30D": buildChartData("30D"),
  "180D": buildChartData("180D"),
  ALL: buildChartData("ALL"),
};
