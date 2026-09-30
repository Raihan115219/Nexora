import type { BinaryNode, BinarySide, Database, Result, User } from "@/types";
import { getUserVolume } from "@/lib/packages";
import { getUserById, toPublicUser } from "@/lib/referrals";

export type OpenSlot = { parentId: string; side: BinarySide };

/**
 * A placement strategy picks the open binary slot for a new member.
 * The default is breadth-first "first open slot, left before right" beneath
 * the sponsor. Swap this for a different rule without touching callers.
 */
export type PlacementStrategy = (
  users: User[],
  sponsorId: string,
  preferredSide?: BinarySide,
) => OpenSlot | undefined;

export const breadthFirstPlacement: PlacementStrategy = (users, sponsorId, preferredSide) => {
  const sponsor = getUserById(users, sponsorId);
  if (!sponsor) return undefined;

  // Honour a preferred side for the sponsor's own direct slot if it is open.
  if (preferredSide) {
    const child = preferredSide === "left" ? sponsor.leftChildId : sponsor.rightChildId;
    if (!child) return { parentId: sponsor.id, side: preferredSide };
  }

  const queue: User[] = [sponsor];
  while (queue.length) {
    const node = queue.shift()!;
    if (!node.leftChildId) return { parentId: node.id, side: "left" };
    if (!node.rightChildId) return { parentId: node.id, side: "right" };
    const left = getUserById(users, node.leftChildId);
    const right = getUserById(users, node.rightChildId);
    if (left) queue.push(left);
    if (right) queue.push(right);
  }
  return undefined;
};

/** Places `userId` in the binary structure beneath `sponsorId`. */
export function placeUser(
  users: User[],
  userId: string,
  sponsorId: string,
  opts: { preferredSide?: BinarySide; strategy?: PlacementStrategy } = {},
): Result<{ users: User[]; slot: OpenSlot }> {
  const member = getUserById(users, userId);
  if (!member) return { ok: false, error: "User not found." };
  if (member.binaryParentId) return { ok: false, error: "User is already placed." };
  const strategy = opts.strategy ?? breadthFirstPlacement;
  const slot = strategy(users, sponsorId, opts.preferredSide);
  if (!slot) return { ok: false, error: "No open binary position available." };

  const next = users.map((u) => {
    if (u.id === userId) return { ...u, binaryParentId: slot.parentId, binarySide: slot.side };
    if (u.id === slot.parentId) {
      return slot.side === "left" ? { ...u, leftChildId: userId } : { ...u, rightChildId: userId };
    }
    return u;
  });
  return { ok: true, data: { users: next, slot } };
}

export function getBinaryPosition(users: User[], userId: string): BinarySide | undefined {
  return getUserById(users, userId)?.binarySide;
}

/** Ids of every user beneath `rootId` (exclusive) in the binary structure. */
export function getBinaryDownlineIds(users: User[], rootId: string): string[] {
  const out: string[] = [];
  const stack: string[] = [];
  const root = getUserById(users, rootId);
  if (!root) return out;
  if (root.leftChildId) stack.push(root.leftChildId);
  if (root.rightChildId) stack.push(root.rightChildId);
  while (stack.length) {
    const id = stack.pop()!;
    out.push(id);
    const node = getUserById(users, id);
    if (node?.leftChildId) stack.push(node.leftChildId);
    if (node?.rightChildId) stack.push(node.rightChildId);
  }
  return out;
}

export function getBranchIds(users: User[], rootId: string, side: BinarySide): string[] {
  const root = getUserById(users, rootId);
  const childId = side === "left" ? root?.leftChildId : root?.rightChildId;
  if (!childId) return [];
  return [childId, ...getBinaryDownlineIds(users, childId)];
}

export function getBinaryTree(users: User[], rootId: string, maxDepth = Infinity): BinaryNode | undefined {
  const root = getUserById(users, rootId);
  if (!root) return undefined;
  const build = (user: User, depth: number): BinaryNode => {
    const node: BinaryNode = { user: toPublicUser(user) };
    if (depth >= maxDepth) return node;
    const left = getUserById(users, user.leftChildId);
    const right = getUserById(users, user.rightChildId);
    if (left) node.left = build(left, depth + 1);
    if (right) node.right = build(right, depth + 1);
    return node;
  };
  return build(root, 0);
}

function branchVolume(db: Database, rootId: string, side: BinarySide): number {
  return getBranchIds(db.users, rootId, side).reduce((sum, id) => sum + getUserVolume(db, id), 0);
}

/** Total active package volume (USD) in the left binary leg. */
export const getLeftVolume = (db: Database, userId: string): number => branchVolume(db, userId, "left");
/** Total active package volume (USD) in the right binary leg. */
export const getRightVolume = (db: Database, userId: string): number => branchVolume(db, userId, "right");

export function getTeamVolume(db: Database, userId: string): number {
  return getLeftVolume(db, userId) + getRightVolume(db, userId);
}

export function getBinaryCounts(users: User[], userId: string): { left: number; right: number } {
  return {
    left: getBranchIds(users, userId, "left").length,
    right: getBranchIds(users, userId, "right").length,
  };
}
