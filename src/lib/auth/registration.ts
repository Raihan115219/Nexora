import { DEMO_STARTING_DEPOSIT_USDT } from "@/config/site";
import type { Database, Result, User } from "@/types";
import { placeUser } from "@/lib/binary";
import { createReferralRelationship, findUserByEmail, findUserByReferralCode } from "@/lib/referrals";
import { generateId, generateReferralCode } from "@/lib/utils/ids";
import { applyDeposit, createWallet } from "@/lib/wallet";

export type RegistrationInput = {
  name: string;
  email: string;
  phone?: string;
  referralCode: string;
  passwordHash: string;
  passwordSalt: string;
};

/** Validates a referral code against the current user base. */
export function validateReferralCode(db: Database, code: string): Result<User> {
  if (!code.trim()) return { ok: false, error: "Referral code is required." };
  const sponsor = findUserByReferralCode(db.users, code);
  if (!sponsor) return { ok: false, error: "Referral code not recognised." };
  if (sponsor.status !== "active") return { ok: false, error: "This referral code is not active." };
  return { ok: true, data: sponsor };
}

/**
 * Pure registration pipeline:
 * referral check → user → sponsor link → binary placement → wallet → demo deposit.
 */
export function applyRegistration(
  db: Database,
  input: RegistrationInput,
): Result<{ db: Database; user: User }> {
  if (findUserByEmail(db.users, input.email)) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const sponsorResult = validateReferralCode(db, input.referralCode);
  if (!sponsorResult.ok) return sponsorResult;
  const sponsor = sponsorResult.data;

  const user: User = {
    id: generateId("usr"),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || undefined,
    role: "user",
    status: "active",
    referralCode: generateReferralCode(new Set(db.users.map((u) => u.referralCode))),
    directReferralCount: 0,
    joinedAt: new Date().toISOString(),
    passwordHash: input.passwordHash,
    passwordSalt: input.passwordSalt,
  };

  let users = [...db.users, user];

  const referral = createReferralRelationship(users, user.id, sponsor.id);
  if (!referral.ok) return referral;
  users = referral.data;

  const placed = placeUser(users, user.id, sponsor.id);
  if (!placed.ok) return placed;
  users = placed.data.users;

  let next: Database = { ...db, users, wallets: [...db.wallets, createWallet(user.id)] };
  if (DEMO_STARTING_DEPOSIT_USDT > 0) {
    next = applyDeposit(next, user.id, DEMO_STARTING_DEPOSIT_USDT, "Demo starting deposit");
  }
  return { ok: true, data: { db: next, user: users.find((u) => u.id === user.id)! } };
}
