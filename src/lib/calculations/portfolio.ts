import type { ChartPoint, PortfolioRange } from "@/types";

/**
 * MOCK portfolio history. Produces a deterministic series that ends exactly
 * at `currentValue`, so the chart is stable between renders. Replace with a
 * real balance-snapshot API later; the chart component only sees ChartPoint[].
 */
const RANGE_CONFIG: Record<PortfolioRange, { points: number; labels: (i: number, n: number) => string; swing: number }> = {
  "1D": { points: 24, labels: (i) => `${String(i).padStart(2, "0")}:00`, swing: 0.012 },
  "1W": {
    points: 7,
    labels: (i) => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i] ?? "",
    swing: 0.04,
  },
  "1M": { points: 30, labels: (i) => `${i + 1}`, swing: 0.09 },
  "6M": {
    points: 26,
    labels: (i) => `W${i + 1}`,
    swing: 0.22,
  },
  "1Y": {
    points: 12,
    labels: (i) => ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"][i] ?? "",
    swing: 0.38,
  },
};

function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function getPortfolioHistory(currentValue: number, range: PortfolioRange, seed = 7): ChartPoint[] {
  const cfg = RANGE_CONFIG[range];
  const rand = seeded(seed + cfg.points * 31);
  const raw: number[] = [];
  let level = 1;
  // Walk backwards-biased upward drift so the series trends toward "now".
  for (let i = 0; i < cfg.points; i++) {
    const trend = (i / (cfg.points - 1)) * cfg.swing * 0.9;
    level = 1 - cfg.swing + trend + (rand() - 0.5) * cfg.swing * 0.55;
    raw.push(level);
  }
  const last = raw[raw.length - 1];
  return raw.map((factor, i) => ({
    label: cfg.labels(i, cfg.points),
    value: Math.round(((factor / last) * currentValue + Number.EPSILON) * 100) / 100,
  }));
}

export function getRangeChange(points: ChartPoint[]): { amount: number; percent: number } {
  if (points.length < 2) return { amount: 0, percent: 0 };
  const first = points[0].value;
  const last = points[points.length - 1].value;
  return { amount: last - first, percent: first ? ((last - first) / first) * 100 : 0 };
}

/** Tiny deterministic sparkline for asset tiles. */
export function getSparkline(seed: number, trendUp = true, length = 14): { i: number; v: number }[] {
  const rand = seeded(seed);
  let v = 50;
  return Array.from({ length }, (_, i) => {
    v += (rand() - (trendUp ? 0.42 : 0.58)) * 14;
    return { i, v };
  });
}
