"use client";

import { useMemo } from "react";
import { UserCheck, Users, UsersRound } from "lucide-react";
import { siteConfig } from "@/config/site";
import { getActivePackage, isUserActive } from "@/lib/packages";
import { buildReferralLink, getDirectReferrals } from "@/lib/referrals";
import { formatDate } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { TableShell, Td, Th, Tr } from "@/components/ui/table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { useCurrentUser, useDb, useUserSummary } from "@/store/hooks";

export default function ReferralsPage() {
  const db = useDb();
  const user = useCurrentUser();
  const summary = useUserSummary();
  const directs = useMemo(() => (user ? getDirectReferrals(db.users, user.id) : []), [db.users, user]);

  if (!user || !summary) return <PageSkeleton />;
  const link = buildReferralLink(siteConfig.baseUrl, user.referralCode);

  return (
    <>
      <PageHeader title="Referrals" description="Invite members and track the people you personally sponsor." />

      <Card className="mb-6">
        <p className="text-xs font-medium tracking-wider text-dim uppercase">Your Referral Link</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="num min-w-0 flex-1 truncate rounded-full border border-line-2 bg-bg-2/80 px-5 py-3 text-sm text-fg">
            {link}
          </div>
          <CopyButton value={link} toastMessage="Referral link copied" />
        </div>
        <p className="mt-3 text-xs text-secondary">
          Referral code: <span className="num font-medium text-primary">{user.referralCode}</span>
        </p>
      </Card>

      <section aria-label="Referral stats" className="mb-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
        <KpiCard icon={Users} label="Direct Referrals" value={summary.directReferrals} sub="People you sponsored" highlight />
        <KpiCard icon={UserCheck} label="Active Directs" value={summary.activeDirects} sub="Holding an active package" />
        <KpiCard icon={UsersRound} label="Total Team" value={summary.totalTeam} sub="All levels below you" />
      </section>

      <h2 className="mb-4 text-base font-semibold">Direct referrals</h2>
      {directs.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No referrals yet"
            description="Share your link — new members who register with your code appear here instantly."
          />
        </Card>
      ) : (
        <TableShell>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Status</Th>
              <Th>Package</Th>
              <Th>Joined</Th>
            </tr>
          </thead>
          <tbody>
            {directs.map((member) => {
              const pkg = getActivePackage(db, member.id);
              const active = isUserActive(db, member.id);
              return (
                <Tr key={member.id}>
                  <Td>
                    <span className="flex items-center gap-3">
                      <Avatar name={member.name} size={36} />
                      <span>
                        <span className="block font-medium text-fg">{member.name}</span>
                        <span className="block text-xs text-dim">{member.email}</span>
                      </span>
                    </span>
                  </Td>
                  <Td>
                    <Badge tone={active ? "success" : "neutral"} dot>
                      {active ? "Active" : "Inactive"}
                    </Badge>
                  </Td>
                  <Td className="text-fg">{pkg ? pkg.code : "—"}</Td>
                  <Td>{formatDate(member.joinedAt)}</Td>
                </Tr>
              );
            })}
          </tbody>
        </TableShell>
      )}
    </>
  );
}
