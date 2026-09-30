"use client";

import { useMemo } from "react";
import { Layers, UserCheck, UsersRound } from "lucide-react";
import { getBinaryPosition } from "@/lib/binary";
import { getActivePackage, isUserActive } from "@/lib/packages";
import { getReferralLevel, getTeamMembers, getUserById } from "@/lib/referrals";
import { formatDate } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { TableShell, Td, Th, Tr } from "@/components/ui/table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { useCurrentUser, useDb, useUserSummary } from "@/store/hooks";

export default function TeamPage() {
  const db = useDb();
  const user = useCurrentUser();
  const summary = useUserSummary();

  const team = useMemo(() => {
    if (!user) return [];
    return getTeamMembers(db.users, user.id)
      .map((member) => ({ member, level: getReferralLevel(db.users, user.id, member.id) }))
      .sort((a, b) => a.level - b.level || a.member.joinedAt.localeCompare(b.member.joinedAt));
  }, [db.users, user]);

  if (!user || !summary) return <PageSkeleton />;
  const deepest = team.reduce((max, t) => Math.max(max, t.level), 0);

  return (
    <>
      <PageHeader
        title="Team"
        description="Everyone in your sponsorship downline. Direct referrals are only level 1 — the team includes every level."
      />
      <section aria-label="Team stats" className="mb-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
        <KpiCard icon={UsersRound} label="Total Team" value={summary.totalTeam} highlight />
        <KpiCard icon={UserCheck} label="Direct Referrals" value={summary.directReferrals} sub="Level 1 only" />
        <KpiCard icon={Layers} label="Levels deep" value={deepest} />
      </section>

      {team.length === 0 ? (
        <Card>
          <EmptyState icon={UsersRound} title="No team members yet" description="Your downline will appear here as your referrals grow." />
        </Card>
      ) : (
        <TableShell>
          <thead>
            <tr>
              <Th>Member</Th>
              <Th>Level</Th>
              <Th>Sponsor</Th>
              <Th>Position</Th>
              <Th>Package</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
            </tr>
          </thead>
          <tbody>
            {team.map(({ member, level }) => {
              const sponsor = getUserById(db.users, member.referredBy);
              const pkg = getActivePackage(db, member.id);
              const active = isUserActive(db, member.id);
              const position = getBinaryPosition(db.users, member.id);
              return (
                <Tr key={member.id}>
                  <Td>
                    <span className="flex items-center gap-3">
                      <Avatar name={member.name} size={36} />
                      <span className="font-medium text-fg">{member.name}</span>
                    </span>
                  </Td>
                  <Td className="num text-fg">{level}</Td>
                  <Td>{sponsor?.id === user.id ? "You" : (sponsor?.name ?? "—")}</Td>
                  <Td className="capitalize">{position ?? "—"}</Td>
                  <Td className="text-fg">{pkg ? pkg.code : "—"}</Td>
                  <Td>
                    <Badge tone={active ? "success" : "neutral"} dot>
                      {active ? "Active" : "Inactive"}
                    </Badge>
                  </Td>
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
