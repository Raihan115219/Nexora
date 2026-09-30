"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Award, Coins, Gem, Layers, PiggyBank, Share2, TrendingUp, Wallet } from "lucide-react";
import { getUserTransactions, getWallet } from "@/lib/wallet";
import { formatUsd, formatNumber } from "@/lib/utils/format";
import { Card, CardHeader } from "@/components/ui/card";
import { PageSkeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PortfolioCard } from "@/components/dashboard/portfolio-card";
import { RankProgress } from "@/components/dashboard/rank-progress";
import { ReferralSummary } from "@/components/dashboard/referral-summary";
import { WalletHero } from "@/components/dashboard/wallet-hero";
import { AssetTile } from "@/components/wallet/asset-tile";
import { TransactionList } from "@/components/wallet/transaction-list";
import { useCurrentUser, useDb, useUserSummary } from "@/store/hooks";

export default function DashboardPage() {
  const db = useDb();
  const user = useCurrentUser();
  const summary = useUserSummary();
  const wallet = user ? getWallet(db, user.id) : undefined;
  const transactions = useMemo(() => (user ? getUserTransactions(db, user.id) : []), [db, user]);

  if (!user || !summary || !wallet) return <PageSkeleton />;

  const pkg = summary.activePackage;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0 space-y-6">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight sm:text-[32px]">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-secondary">Here&apos;s how your Nexora portfolio is performing.</p>
        </div>

        <section aria-label="Balances" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <KpiCard icon={Wallet} label="Total Balance" value={formatUsd(summary.wallet.totalValue)} sub="All assets" />
          <KpiCard icon={PiggyBank} label="Available Balance" value={formatUsd(summary.wallet.availableValue)} sub="Ready to use" highlight />
          <KpiCard icon={TrendingUp} label="Total Earnings" value={formatUsd(summary.totalEarnings)} sub="Referral + ROI rewards" />
          <KpiCard
            icon={Layers}
            label="Active Package"
            value={pkg ? `${pkg.code} — ${formatUsd(pkg.price, { whole: true })}` : "None"}
            sub={pkg ? `${pkg.name}` : <Link href="/dashboard/packages" className="text-primary hover:underline">Choose a package</Link>}
          />
        </section>

        <section aria-label="Network" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <KpiCard icon={Share2} label="Direct Referrals" value={summary.directReferrals} sub={`${summary.activeDirects} active`} />
          <KpiCard icon={Coins} label="Team Volume" value={formatUsd(summary.teamVolume, { whole: true })} sub={`${summary.totalTeam} team members`} />
          <KpiCard icon={Award} label="Current Rank" value={summary.rank.label} sub={summary.rank.detail} />
          <KpiCard icon={Gem} label="Staked Tokens" value={formatNumber(summary.stakedTokens, 0)} sub="PLT + ERN locked" />
        </section>

        <PortfolioCard totalValue={summary.wallet.totalValue} />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader
              title="Recent Transactions"
              action={
                <Link href="/dashboard/transactions" className="text-xs text-secondary transition-colors hover:text-primary">
                  See All
                </Link>
              }
            />
            <TransactionList transactions={transactions} limit={5} />
          </Card>
          <div className="space-y-6">
            <ReferralSummary summary={summary} />
            <RankProgress summary={summary} />
          </div>
        </div>
      </div>

      <aside aria-label="Wallet" className="surface-card h-fit space-y-8 p-5 sm:p-6 xl:sticky xl:top-24">
        <WalletHero userId={user.id} wallet={summary.wallet} earnings={summary.totalEarnings} />
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">My Assets</h2>
            <Link href="/dashboard/wallet" className="text-xs text-secondary transition-colors hover:text-primary">
              See All
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {wallet.balances.map((b) => (
              <AssetTile key={b.symbol} balance={b} />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
