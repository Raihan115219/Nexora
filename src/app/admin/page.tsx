"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Boxes, Coins, Landmark, UserCheck, Users } from "lucide-react";
import { getAdminStats } from "@/lib/calculations/admin";
import { getActivePackage, isUserActive } from "@/lib/packages";
import { formatDate, formatUsd } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { TransactionList } from "@/components/wallet/transaction-list";
import { useDb } from "@/store/hooks";

export default function AdminOverviewPage() {
  const db = useDb();
  const stats = useMemo(() => getAdminStats(db), [db]);
  const recentUsers = useMemo(
    () =>
      db.users
        .filter((u) => u.role === "user")
        .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt))
        .slice(0, 6),
    [db.users],
  );
  const recentTx = useMemo(
    () => [...db.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6),
    [db.transactions],
  );

  return (
    <>
      <PageHeader title="Admin Overview" description="Platform-wide activity across users, deposits and packages." />

      <section aria-label="Platform stats" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard icon={Users} label="Total Users" value={stats.totalUsers} highlight />
        <KpiCard icon={UserCheck} label="Active Users" value={stats.activeUsers} sub="Holding a package" />
        <KpiCard icon={Landmark} label="Total Deposits" value={formatUsd(stats.totalDeposits, { whole: true })} />
        <KpiCard icon={Boxes} label="Active Packages" value={stats.activePackages} />
        <KpiCard icon={Coins} label="Total Team Volume" value={formatUsd(stats.totalTeamVolume, { whole: true })} />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Newest members"
            action={
              <Link href="/admin/users" className="text-xs text-secondary transition-colors hover:text-primary">
                See All
              </Link>
            }
          />
          <ul className="divide-y divide-line/70">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <Avatar name={u.name} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-fg">{u.name}</p>
                  <p className="truncate text-xs text-secondary">Joined {formatDate(u.joinedAt)}</p>
                </div>
                <Badge tone={isUserActive(db, u.id) ? "success" : "neutral"} dot>
                  {getActivePackage(db, u.id)?.code ?? "No package"}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader
            title="Recent transactions"
            action={
              <Link href="/admin/transactions" className="text-xs text-secondary transition-colors hover:text-primary">
                See All
              </Link>
            }
          />
          <TransactionList transactions={recentTx} />
        </Card>
      </div>
    </>
  );
}
