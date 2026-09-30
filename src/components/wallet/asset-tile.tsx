"use client";

import { useMemo } from "react";
import { Coins, Gem, CircleDollarSign, Lock } from "lucide-react";
import { ASSET_PRICES_USD } from "@/config/site";
import type { WalletBalance } from "@/types";
import { getSparkline } from "@/lib/calculations/portfolio";
import { formatNumber, formatUsd } from "@/lib/utils/format";
import { Sparkline } from "@/components/charts/sparkline";

const ICONS = { USDT: CircleDollarSign, PLT: Coins, ERN: Gem } as const;

function seedFor(symbol: string) {
  return symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

/** Asset tile modelled on the reference's "My Assets" cards. */
export function AssetTile({ balance }: { balance: WalletBalance }) {
  const Icon = ICONS[balance.symbol as keyof typeof ICONS] ?? Coins;
  const trendUp = balance.symbol !== "ERN";
  const data = useMemo(() => getSparkline(seedFor(balance.symbol), trendUp), [balance.symbol, trendUp]);
  return (
    <div className="surface-tile flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="grid size-10 place-items-center rounded-full border border-line-2 bg-surface-3 text-primary">
          <Icon className="size-[18px]" aria-hidden />
        </span>
        <div className="w-20 text-right">
          <Sparkline data={data} positive={trendUp} height={28} />
          <span className="text-[10px] text-dim">Last 7 Days</span>
        </div>
      </div>
      <div>
        <p className="num text-xl leading-tight font-semibold text-fg">
          {formatNumber(balance.balance)}
          <span className="ml-1.5 text-sm text-secondary/80">{balance.symbol}</span>
        </p>
        <p className="num mt-0.5 text-xs text-primary">
          {formatUsd(balance.usdValue)}
          <span className="ml-1 text-dim">@ {formatUsd(ASSET_PRICES_USD[balance.symbol] ?? 0)}</span>
        </p>
      </div>
      {balance.locked > 0 && (
        <p className="flex items-center gap-1 text-[11px] text-secondary">
          <Lock className="size-3 text-warn" aria-hidden />
          {formatNumber(balance.locked)} locked
        </p>
      )}
    </div>
  );
}
