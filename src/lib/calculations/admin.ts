import type { Database } from "@/types";
import { isUserActive } from "@/lib/packages";
import { round2 } from "@/lib/wallet";

export type AdminStats = {
  totalUsers: number;
  activeUsers: number;
  totalDeposits: number;
  activePackages: number;
  totalTeamVolume: number;
};

/** Platform-wide headline numbers for the admin overview. Admin accounts are excluded from user counts. */
export function getAdminStats(db: Database): AdminStats {
  const members = db.users.filter((u) => u.role === "user");
  return {
    totalUsers: members.length,
    activeUsers: members.filter((u) => u.status === "active" && isUserActive(db, u.id)).length,
    totalDeposits: round2(
      db.transactions
        .filter((t) => t.type === "Deposit" && t.status === "Completed")
        .reduce((sum, t) => sum + t.amount, 0),
    ),
    activePackages: db.userPackages.filter((up) => up.status === "active").length,
    totalTeamVolume: round2(
      db.userPackages.filter((up) => up.status === "active").reduce((sum, up) => sum + up.pricePaid, 0),
    ),
  };
}

/**
 * Future admin actions. Phase 1 only implements "view"; the rest are declared
 * so the UI and services have a stable extension point.
 */
export const ADMIN_USER_ACTIONS = [
  { id: "view", label: "View", enabled: true },
  { id: "suspend", label: "Suspend", enabled: false },
  { id: "activate", label: "Activate", enabled: false },
  { id: "edit", label: "Edit", enabled: false },
  { id: "reset-password", label: "Reset password", enabled: false },
] as const;
