import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/card";
import { formatUsd } from "@/lib/utils/format";
import type { UserSummary } from "@/lib/calculations/summary";

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-secondary">{label}</span>
      <span className="num text-sm font-semibold text-fg">{value}</span>
    </div>
  );
}

export function ReferralSummary({ summary }: { summary: UserSummary }) {
  return (
    <Card>
      <CardHeader
        title="Referral Summary"
        action={
          <Link href="/dashboard/referrals" className="text-xs text-secondary transition-colors hover:text-primary">
            See All
          </Link>
        }
      />
      <div className="divide-y divide-line/70">
        <Row label="Direct referrals" value={summary.directReferrals} />
        <Row label="Active directs" value={summary.activeDirects} />
        <Row label="Total team" value={summary.totalTeam} />
        <Row label="Left leg / Right leg" value={`${summary.binaryCounts.left} / ${summary.binaryCounts.right}`} />
        <Row label="Team volume" value={formatUsd(summary.teamVolume, { whole: true })} />
      </div>
    </Card>
  );
}
