import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  Package as PackageIcon,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ASSET_PRICES_USD } from "@/config/site";
import type { Transaction, TransactionType } from "@/types";
import { cn, formatDate, formatNumber } from "@/lib/utils/format";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/badge";

export const TX_ICONS: Record<TransactionType, LucideIcon> = {
  Deposit: ArrowDownLeft,
  "Package Purchase": PackageIcon,
  "Referral Reward": Users,
  "ROI Reward": TrendingUp,
  Withdrawal: ArrowUpRight,
  "Token Credit": Coins,
};

export function TxIcon({ type }: { type: TransactionType }) {
  const Icon = TX_ICONS[type];
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line-2 bg-surface-3 text-primary">
      <Icon className="size-[18px]" aria-hidden />
    </span>
  );
}

export function formatTxAmount(tx: Transaction): { text: string; positive: boolean; usd: number } {
  const positive = tx.amount >= 0;
  return {
    text: `${positive ? "+" : "−"}${formatNumber(Math.abs(tx.amount))} ${tx.asset}`,
    positive,
    usd: Math.abs(tx.amount) * (ASSET_PRICES_USD[tx.asset] ?? 1),
  };
}

/** Compact list used on the dashboard and wallet pages. */
export function TransactionList({
  transactions,
  limit,
  viewAllHref,
}: {
  transactions: Transaction[];
  limit?: number;
  viewAllHref?: string;
}) {
  const rows = limit ? transactions.slice(0, limit) : transactions;
  if (rows.length === 0) {
    return <EmptyState title="No transactions yet" description="Deposits, purchases and rewards will show up here." />;
  }
  return (
    <div>
      <ul className="divide-y divide-line/70">
        {rows.map((tx) => {
          const amount = formatTxAmount(tx);
          return (
            <li key={tx.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <TxIcon type={tx.type} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg">{tx.type}</p>
                <p className="truncate text-xs text-secondary">
                  {tx.description} · {formatDate(tx.date)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={cn("num text-sm font-semibold", amount.positive ? "text-primary" : "text-fg")}>
                  {amount.text}
                </span>
                {tx.status !== "Completed" && <StatusBadge status={tx.status} />}
              </div>
            </li>
          );
        })}
      </ul>
      {viewAllHref && (
        <Link href={viewAllHref} className="mt-4 block text-center text-xs font-medium text-primary hover:underline">
          View all transactions
        </Link>
      )}
    </div>
  );
}
