"use client";

import { useMemo, useState } from "react";
import type { PortfolioRange } from "@/types";
import { getPortfolioHistory, getRangeChange } from "@/lib/calculations/portfolio";
import { formatUsd } from "@/lib/utils/format";
import { Delta } from "@/components/ui/amount";
import { Card } from "@/components/ui/card";
import { SegmentedTabs } from "@/components/ui/tabs";
import { PortfolioChart } from "@/components/charts/portfolio-chart";

const RANGES: readonly PortfolioRange[] = ["1D", "1W", "1M", "6M", "1Y"];

export function PortfolioCard({ totalValue }: { totalValue: number }) {
  const [range, setRange] = useState<PortfolioRange>("1W");
  const data = useMemo(() => getPortfolioHistory(totalValue, range), [totalValue, range]);
  const change = useMemo(() => getRangeChange(data), [data]);

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Portfolio Performance</h2>
          <p className="mt-0.5 flex items-center gap-2 text-xs text-secondary">
            <span className="num text-fg">{formatUsd(totalValue)}</span>
            <Delta value={change.percent} suffix={`${change.percent >= 0 ? "+" : ""}${change.percent.toFixed(2)}%`} />
          </p>
        </div>
        <SegmentedTabs label="Chart range" options={RANGES} value={range} onChange={setRange} />
      </div>
      <PortfolioChart data={data} changePercent={change.percent} />
      <p className="mt-2 text-[11px] text-dim">Demo data — history is simulated for the Phase 1 preview.</p>
    </Card>
  );
}
