import { ASSET_META, ASSET_PRICES_USD } from "@/config/site";
import type {
  Database,
  Transaction,
  TransactionStatus,
  TransactionType,
  Wallet,
  WalletBalance,
  WalletSummary,
} from "@/types";
import { generateId, generateWalletAddress } from "@/lib/utils/ids";

export function buildBalance(asset: string, balance: number, locked = 0): WalletBalance {
  const price = ASSET_PRICES_USD[asset] ?? 0;
  return {
    asset: ASSET_META[asset]?.name ?? asset,
    symbol: asset,
    balance,
    available: Math.max(balance - locked, 0),
    locked,
    usdValue: round2(balance * price),
  };
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Creates an empty multi-asset wallet. */
export function createWallet(userId: string, address = generateWalletAddress()): Wallet {
  return {
    userId,
    address,
    totalDeposited: 0,
    balances: ["USDT", "PLT", "ERN"].map((symbol) => buildBalance(symbol, 0)),
  };
}

export function getWallet(db: Database, userId: string): Wallet | undefined {
  return db.wallets.find((wallet) => wallet.userId === userId);
}

export function getWalletBalance(db: Database, userId: string): WalletSummary {
  const wallet = getWallet(db, userId);
  if (!wallet) return { totalValue: 0, availableValue: 0, lockedValue: 0, depositedValue: 0 };
  let totalValue = 0;
  let availableValue = 0;
  let lockedValue = 0;
  for (const b of wallet.balances) {
    const price = ASSET_PRICES_USD[b.symbol] ?? 0;
    totalValue += b.usdValue;
    availableValue += b.available * price;
    lockedValue += b.locked * price;
  }
  return {
    totalValue: round2(totalValue),
    availableValue: round2(availableValue),
    lockedValue: round2(lockedValue),
    depositedValue: round2(wallet.totalDeposited),
  };
}

export function getAssetBalance(wallet: Wallet | undefined, symbol: string): WalletBalance | undefined {
  return wallet?.balances.find((b) => b.symbol === symbol);
}

/** Pure: returns a wallet with `delta` applied to an asset's available balance. */
export function adjustWallet(wallet: Wallet, symbol: string, delta: number): Wallet {
  const exists = wallet.balances.some((b) => b.symbol === symbol);
  const base = exists ? wallet.balances : [...wallet.balances, buildBalance(symbol, 0)];
  return {
    ...wallet,
    balances: base.map((b) => {
      if (b.symbol !== symbol) return b;
      return buildBalance(symbol, round2(b.balance + delta), b.locked);
    }),
  };
}

export type CreateTransactionInput = {
  userId: string;
  type: TransactionType;
  asset: string;
  amount: number;
  status?: TransactionStatus;
  date?: string;
  description: string;
};

export function createTransaction(input: CreateTransactionInput): Transaction {
  return {
    id: generateId("tx"),
    userId: input.userId,
    type: input.type,
    asset: input.asset,
    amount: input.amount,
    status: input.status ?? "Completed",
    date: input.date ?? new Date().toISOString(),
    description: input.description,
  };
}

export function getUserTransactions(db: Database, userId: string): Transaction[] {
  return db.transactions
    .filter((tx) => tx.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Sum of completed reward transactions credited to the user, in USD. */
export function getTotalEarnings(db: Database, userId: string): number {
  return round2(
    db.transactions
      .filter(
        (tx) =>
          tx.userId === userId &&
          tx.status === "Completed" &&
          (tx.type === "Referral Reward" || tx.type === "ROI Reward"),
      )
      .reduce((sum, tx) => sum + tx.amount * (ASSET_PRICES_USD[tx.asset] ?? 1), 0),
  );
}

/** Mock deposit: credits USDT and records a Deposit transaction. */
export function applyDeposit(
  db: Database,
  userId: string,
  amount: number,
  description = "Deposit",
): Database {
  const wallet = getWallet(db, userId);
  if (!wallet) return db;
  const credited = adjustWallet(wallet, "USDT", amount);
  const updated: Wallet = { ...credited, totalDeposited: round2(wallet.totalDeposited + amount) };
  return {
    ...db,
    wallets: db.wallets.map((w) => (w.userId === userId ? updated : w)),
    transactions: [
      createTransaction({ userId, type: "Deposit", asset: "USDT", amount, description }),
      ...db.transactions,
    ],
  };
}
