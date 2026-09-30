import { Award } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import type { UserSummary } from "@/lib/calculations/summary";

/**
 * Rank progression is intentionally a placeholder: thresholds are not defined
 * in the Phase 1 spec, so we show the founder tier and never invent criteria.
 */
export function RankProgress({ summary }: { summary: UserSummary }) {
  const { rank } = summary;
  return (
    <Card>
      <CardHeader title="Rank & Progress" />
      <div className="flex items-center gap-4">
        <span className="grid size-14 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary shadow-glow">
          <Award className="size-6" aria-hidden />
        </span>
        <div>
          <p className="text-xl font-semibold">{rank.label}</p>
          <p className="text-xs text-secondary">{rank.detail}</p>
        </div>
      </div>
      <div className="mt-5">
        <div className="mb-1.5 flex justify-between text-xs text-secondary">
          <span>Next rank</span>
          <span className="text-dim">Configured in Phase 2</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-label="Rank progress" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full w-0 rounded-full bg-primary/60" />
        </div>
      </div>
    </Card>
  );
}
