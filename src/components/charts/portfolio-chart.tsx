"use client";

import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartPoint } from "@/types";
import { formatCompact, formatUsd } from "@/lib/utils/format";

type TooltipProps = { active?: boolean; payload?: Array<{ value: number }>; label?: string };

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line-2 bg-surface-2 px-3 py-2 shadow-xl">
      <p className="text-xs text-secondary">{label}</p>
      <p className="num text-sm font-semibold text-fg">{formatUsd(payload[0].value)}</p>
    </div>
  );
}

export function PortfolioChart({
  data,
  changePercent,
  height = 300,
}: {
  data: ChartPoint[];
  changePercent: number;
  height?: number;
}) {
  const last = data[data.length - 1]?.value ?? 0;
  const positive = changePercent >= 0;
  const pill = `${positive ? "+" : ""}${changePercent.toFixed(2)}%`;

  return (
    <div style={{ height }} className="w-full" role="img" aria-label={`Portfolio value chart, ${pill} over the selected range`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#39ff5a" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#39ff5a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1a3024" strokeOpacity={0.55} vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#5e6d64", fontSize: 11 }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            width={44}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#5e6d64", fontSize: 11 }}
            tickFormatter={(v: number) => `$${formatCompact(v)}`}
            domain={["dataMin - 300", "dataMax + 300"]}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#39ff5a", strokeOpacity: 0.25, strokeDasharray: "3 4" }} />
          <ReferenceLine
            y={last}
            stroke="#39ff5a"
            strokeOpacity={0.55}
            strokeDasharray="4 4"
            label={{
              value: pill,
              position: "insideTopRight",
              fill: positive ? "#39ff5a" : "#d85b62",
              fontSize: 12,
              fontWeight: 600,
            }}
          />
          <Area
            type="linear"
            dataKey="value"
            stroke="#39ff5a"
            strokeWidth={1.75}
            fill="url(#portfolioFill)"
            dot={false}
            activeDot={{ r: 4, fill: "#f2f7f3", stroke: "#39ff5a", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
