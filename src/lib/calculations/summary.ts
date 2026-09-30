import type { Database, Package, WalletSummary } from "@/types";
import { getTeamVolume, getBinaryCounts } from "@/lib/binary";
import { getActivePackage, getUserVolume } from "@/lib/packages";
import { countActiveDirects, countDirectReferrals, countTeamMembers } from "@/lib/referrals";
import { getAssetBalance, getTotalEarnings, getWallet, getWalletBalance } from "@/lib/wallet";
import { getCurrentRank, type RankInfo } from "./compensation";

export type UserSummary = {
  wallet: WalletSummary;
  totalEarnings: number;
  activePackage?: Package;
  personalVolume: number;
  directReferrals: number;
  activeDirects: number;
  totalTeam: number;
  teamVolume: number;
  binaryCounts: { left: number; right: number };
  rank: RankInfo;
  /** Locked (staked) token units across platform + earned tokens. */
  stakedTokens: number;
};

/** One call that gathers every headline number for a member's dashboard. */
export function getUserSummary(db: Database, userId: string): UserSummary {
  const wallet = getWallet(db, userId);
  const stakedTokens =
    (getAssetBalance(wallet, "PLT")?.locked ?? 0) + (getAssetBalance(wallet, "ERN")?.locked ?? 0);
  return {
    wallet: getWalletBalance(db, userId),
    totalEarnings: getTotalEarnings(db, userId),
    activePackage: getActivePackage(db, userId),
    personalVolume: getUserVolume(db, userId),
    directReferrals: countDirectReferrals(db.users, userId),
    activeDirects: countActiveDirects(db, userId),
    totalTeam: countTeamMembers(db.users, userId),
    teamVolume: getTeamVolume(db, userId),
    binaryCounts: getBinaryCounts(db.users, userId),
    rank: getCurrentRank(db, userId),
    stakedTokens,
  };
}
