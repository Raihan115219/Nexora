import type { Database, Package, Result, Transaction, UserPackage } from "@/types";
import { generateId } from "@/lib/utils/ids";
import { adjustWallet, createTransaction, getAssetBalance, getWallet } from "@/lib/wallet";

export const PAYMENT_ASSET = "USDT";

export function getPackages(db: Database, opts: { onlyActive?: boolean } = {}): Package[] {
  const list = opts.onlyActive ? db.packages.filter((p) => p.active) : db.packages;
  return [...list].sort((a, b) => a.price - b.price);
}

export function getPackageById(db: Database, packageId: string): Package | undefined {
  return db.packages.find((p) => p.id === packageId);
}

export function getUserPackages(db: Database, userId: string): UserPackage[] {
  return db.userPackages
    .filter((up) => up.userId === userId && up.status === "active")
    .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt));
}

/**
 * The user's "active package" is the highest-priced active purchase.
 * NOTE: stacking / upgrade rules are not yet specified — TODO(phase-2).
 */
export function getActivePackage(db: Database, userId: string): Package | undefined {
  let best: Package | undefined;
  for (const up of getUserPackages(db, userId)) {
    const pkg = getPackageById(db, up.packageId);
    if (pkg && (!best || pkg.price > best.price)) best = pkg;
  }
  return best;
}

export function isUserActive(db: Database, userId: string): boolean {
  return getUserPackages(db, userId).length > 0;
}

export function countPackageHolders(db: Database, packageId: string): number {
  return new Set(
    db.userPackages
      .filter((up) => up.packageId === packageId && up.status === "active")
      .map((up) => up.userId),
  ).size;
}

/** Sum of the USD price of all of a user's active packages. */
export function getUserVolume(db: Database, userId: string): number {
  return getUserPackages(db, userId).reduce((sum, up) => sum + up.pricePaid, 0);
}

export type PurchaseQuote = {
  package: Package;
  paymentAsset: string;
  price: number;
  availableBalance: number;
  remainingBalance: number;
  canAfford: boolean;
  alreadyOwned: boolean;
};

export function getPurchaseQuote(db: Database, userId: string, packageId: string): PurchaseQuote | undefined {
  const pkg = getPackageById(db, packageId);
  if (!pkg) return undefined;
  const available = getAssetBalance(getWallet(db, userId), PAYMENT_ASSET)?.available ?? 0;
  return {
    package: pkg,
    paymentAsset: PAYMENT_ASSET,
    price: pkg.price,
    availableBalance: available,
    remainingBalance: available - pkg.price,
    canAfford: available >= pkg.price,
    alreadyOwned: getUserPackages(db, userId).some((up) => up.packageId === packageId),
  };
}

export type PurchaseOutcome = {
  db: Database;
  userPackage: UserPackage;
  transaction: Transaction;
};

/**
 * Pure purchase: validates, deducts the wallet, activates the package and
 * records a transaction. Returns the next database snapshot.
 */
export function applyPackagePurchase(
  db: Database,
  userId: string,
  packageId: string,
): Result<PurchaseOutcome> {
  const quote = getPurchaseQuote(db, userId, packageId);
  if (!quote) return { ok: false, error: "Package not found." };
  if (!quote.package.active) return { ok: false, error: "This package is not currently available." };
  if (quote.alreadyOwned) return { ok: false, error: "You already own this package." };
  if (!quote.canAfford) return { ok: false, error: "Insufficient available balance." };

  const wallet = getWallet(db, userId);
  if (!wallet) return { ok: false, error: "Wallet not found." };

  const now = new Date().toISOString();
  const userPackage: UserPackage = {
    id: generateId("up"),
    userId,
    packageId,
    pricePaid: quote.price,
    status: "active",
    purchasedAt: now,
  };
  const transaction = createTransaction({
    userId,
    type: "Package Purchase",
    asset: PAYMENT_ASSET,
    amount: -quote.price,
    date: now,
    description: `${quote.package.code} ${quote.package.name} purchase`,
  });
  const nextWallet = adjustWallet(wallet, PAYMENT_ASSET, -quote.price);

  return {
    ok: true,
    data: {
      userPackage,
      transaction,
      db: {
        ...db,
        wallets: db.wallets.map((w) => (w.userId === userId ? nextWallet : w)),
        userPackages: [userPackage, ...db.userPackages],
        transactions: [transaction, ...db.transactions],
      },
    },
  };
}
