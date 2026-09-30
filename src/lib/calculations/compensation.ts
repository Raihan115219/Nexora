import type { Database } from "@/types";
import { getActivePackage } from "@/lib/packages";

/**
 * Extension points for the compensation plan (Phase 2+).
 *
 * The blueprint's ROI / commission / rank / staking / limit-cap rules are
 * intentionally NOT implemented: no formulas are invented here. Each engine
 * is an interface with a no-op default so real rules can be plugged in as
 * configurable data without rewriting UI or services.
 */
export type CompensationContext = { db: Database; userId: string };

export interface CompensationEngine<TResult = unknown> {
  readonly id: string;
  /** TODO(phase-2): implement once the plan rules are confirmed. */
  evaluate(ctx: CompensationContext): TResult | null;
}

export const compensationEngines = {
  directCommission: noopEngine("direct-commission"),
  levelCommission: noopEngine("level-commission"),
  binaryCommission: noopEngine("binary-commission"),
  dailyRoi: noopEngine("daily-roi"),
  limitPlan: noopEngine("limit-plan"),
  rankSalary: noopEngine("rank-salary"),
  stakingRewards: noopEngine("staking-rewards"),
} satisfies Record<string, CompensationEngine>;

function noopEngine(id: string): CompensationEngine {
  return { id, evaluate: () => null };
}

export type RankInfo = { label: string; detail: string; placeholder: boolean };

/**
 * TODO(phase-2): rank thresholds are not specified. Until they are, the
 * "rank" shown in the UI is simply the user's founder tier.
 */
export function getCurrentRank(db: Database, userId: string): RankInfo {
  const pkg = getActivePackage(db, userId);
  if (!pkg) return { label: "Unranked", detail: "Purchase a package to qualify", placeholder: true };
  return { label: `${pkg.code} Founder`, detail: "Rank tiers arrive in Phase 2", placeholder: true };
}
