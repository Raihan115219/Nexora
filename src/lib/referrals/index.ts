import type { Database, PublicUser, ReferralNode, Result, User } from "@/types";
import { isUserActive } from "@/lib/packages";

export function toPublicUser(user: User): PublicUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, passwordSalt, ...rest } = user;
  return rest;
}

export function getUserById<T extends { id: string }>(users: T[], id: string | undefined): T | undefined {
  return id ? users.find((u) => u.id === id) : undefined;
}

export function findUserByReferralCode(users: User[], code: string): User | undefined {
  const normalised = code.trim().toUpperCase();
  return users.find((u) => u.referralCode.toUpperCase() === normalised);
}

export function findUserByEmail(users: User[], email: string): User | undefined {
  const normalised = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalised);
}

/** Users personally sponsored by `userId`. */
export function getDirectReferrals(users: User[], userId: string): User[] {
  return users
    .filter((u) => u.referredBy === userId)
    .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
}

/** Direct Referral Count — sponsored users only. NOT the same as team size. */
export function countDirectReferrals(users: User[], userId: string): number {
  return getDirectReferrals(users, userId).length;
}

/** Directs that currently hold an active package. */
export function countActiveDirects(db: Database, userId: string): number {
  return getDirectReferrals(db.users, userId).filter((u) => isUserActive(db, u.id)).length;
}

/** calculateDirectReferrals alias kept for the spec's service naming. */
export const calculateDirectReferrals = countDirectReferrals;

/**
 * Total Team — every user in the sponsorship (referral) downline, at any depth.
 * Distinct from the binary placement downline, see `lib/binary`.
 */
export function getTeamMembers(users: User[], userId: string): User[] {
  const byParent = new Map<string, User[]>();
  for (const u of users) {
    if (!u.referredBy) continue;
    const list = byParent.get(u.referredBy) ?? [];
    list.push(u);
    byParent.set(u.referredBy, list);
  }
  const out: User[] = [];
  const queue = [...(byParent.get(userId) ?? [])];
  const seen = new Set<string>([userId]);
  while (queue.length) {
    const next = queue.shift()!;
    if (seen.has(next.id)) continue;
    seen.add(next.id);
    out.push(next);
    queue.push(...(byParent.get(next.id) ?? []));
  }
  return out;
}

export function countTeamMembers(users: User[], userId: string): number {
  return getTeamMembers(users, userId).length;
}

/** Sponsorship depth of `member` below `rootId` (1 = direct). */
export function getReferralLevel(users: User[], rootId: string, memberId: string): number {
  let level = 0;
  let cursor = getUserById(users, memberId);
  while (cursor && cursor.id !== rootId) {
    level += 1;
    cursor = getUserById(users, cursor.referredBy);
    if (level > users.length) return 0;
  }
  return cursor ? level : 0;
}

export function getReferralTree(users: User[], rootId: string, maxDepth = Infinity): ReferralNode | undefined {
  const root = getUserById(users, rootId);
  if (!root) return undefined;
  const build = (user: User, depth: number): ReferralNode => ({
    user: toPublicUser(user),
    children:
      depth >= maxDepth ? [] : getDirectReferrals(users, user.id).map((child) => build(child, depth + 1)),
  });
  return build(root, 0);
}

/**
 * Records the sponsor relationship for a new user and keeps the sponsor's
 * denormalised direct-referral counter in sync.
 */
export function createReferralRelationship(
  users: User[],
  newUserId: string,
  sponsorId: string,
): Result<User[]> {
  const sponsor = getUserById(users, sponsorId);
  const member = getUserById(users, newUserId);
  if (!sponsor) return { ok: false, error: "Sponsor not found." };
  if (!member) return { ok: false, error: "User not found." };
  if (member.referredBy) return { ok: false, error: "User already has a sponsor." };
  const next = users.map((u) => {
    if (u.id === newUserId) return { ...u, referredBy: sponsorId };
    return u;
  });
  const withCounts = next.map((u) =>
    u.id === sponsorId ? { ...u, directReferralCount: countDirectReferrals(next, sponsorId) } : u,
  );
  return { ok: true, data: withCounts };
}

export function buildReferralLink(baseUrl: string, code: string): string {
  return `${baseUrl}/register?ref=${encodeURIComponent(code)}`;
}
