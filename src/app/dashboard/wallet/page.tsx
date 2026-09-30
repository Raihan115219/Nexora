"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDownToLine, Landmark, Lock, PiggyBank, Wallet } from "lucide-react";
import { ASSET_PRICES_USD } from "@/config/site";
import { getUserTransactions, getWallet, getWalletBalance } from "@/lib/wallet";
import { formatNumber, formatUsd } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { TableShell, Td, Th, Tr } from "@/components/ui/table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { AssetTile } from "@/components/wallet/asset-tile";
import { DepositModal } from "@/components/wallet/deposit-modal";
import { TransactionList } from "@/components/wallet/transaction-list";
import { useCurrentUser, useDb } from "@/store/hooks";

export default function WalletPage() {
  const db = useDb();
  const user = useCurrentUser();
  const [depositOpen, setDepositOpen] = useState(false);
  const wallet = user ? getWallet(db, user.id) : undefined;
  const summary = useMemo(() => (user ? getWalletBalance(db, user.id) : null), [db, user]);
  const transactions = useMemo(() => (user ? getUserTransactions(db, user.id) : []), [db, user]);

  if (!user || !wallet || !summary) return <PageSkeleton />;

  return (
    <>
      <PageHeader
        title="Wallet"
        description="Your balances across every asset on the platform."
        actions={
          <Button onClick={() => setDepositOpen(true)}>
            <ArrowDownToLine className="size-4" aria-hidden /> Deposit
          </Button>
        }
      />

      <section aria-label="Balance summary" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard icon={Wallet} label="Total portfolio value" value={formatUsd(summary.totalValue)} highlight />
        <KpiCard icon={PiggyBank} label="Available balance" value={formatUsd(summary.availableValue)} />
        <KpiCard icon={Lock} label="Locked balance" value={formatUsd(summary.lockedValue)} sub="Staked tokens" />
        <KpiCard icon={Landmark} label="Total deposited" value={formatUsd(summary.depositedValue)} />
      </section>

      <section aria-label="Assets" className="mt-6">
        <h2 className="mb-4 text-base font-semibold">Assets</h2>
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {wallet.balances.map((b) => (
            <AssetTile key={b.symbol} balance={b} />
          ))}
        </div>
        <TableShell>
          <thead>
            <tr>
              <Th>Asset</Th>
              <Th className="text-right">Balance</Th>
              <Th className="text-right">Available</Th>
              <Th className="text-right">Locked</Th>
              <Th className="text-right">Price</Th>
              <Th className="text-right">USD value</Th>
            </tr>
          </thead>
          <tbody>
            {wallet.balances.map((b) => (
              <Tr key={b.symbol}>
                <Td className="text-fg">
                  <span className="font-medium">{b.asset}</span> <span className="text-dim">{b.symbol}</span>
                </Td>
                <Td className="num text-right text-fg">{formatNumber(b.balance)}</Td>
                <Td className="num text-right">{formatNumber(b.available)}</Td>
                <Td className="num text-right">{formatNumber(b.locked)}</Td>
                <Td className="num text-right">{formatUsd(ASSET_PRICES_USD[b.symbol] ?? 0)}</Td>
                <Td className="num text-right font-semibold text-primary">{formatUsd(b.usdValue)}</Td>
              </Tr>
            ))}
          </tbody>
        </TableShell>
        <p className="mt-2 text-[11px] text-dim">Token prices are mock values for the Phase 1 demo.</p>
      </section>

      <Card className="mt-6">
        <CardHeader
          title="Recent Transactions"
          action={
            <Link href="/dashboard/transactions" className="text-xs text-secondary transition-colors hover:text-primary">
              See All
            </Link>
          }
        />
        <TransactionList transactions={transactions} limit={6} />
      </Card>

      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} userId={user.id} />
    </>
  );
}
