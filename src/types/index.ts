/**
 * Domain types for the Nexora Phase-1 demo.
 *
 * Every entity is a plain serialisable object keyed by id so the mock
 * data layer can later be swapped for a real API / database without
 * touching UI code.
 */

export type Role = "user" | "admin";
export type AccountStatus = "active" | "suspended";
export type BinarySide = "left" | "right";

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  status: AccountStatus;
  referralCode: string;
  /** Sponsor (the user whose referral code was used). */
  referredBy?: string;
  /** Binary placement — may differ from the sponsor (spillover). */
  binaryParentId?: string;
  binarySide?: BinarySide;
  leftChildId?: string;
  rightChildId?: string;
  /** Denormalised counter; kept in sync by the referral engine. */
  directReferralCount: number;
  joinedAt: string;
  /** Mock credentials — hashed, never plaintext. */
  passwordHash: string;
  passwordSalt: string;
};

/** A user without credential fields; safe to hand to the UI. */
export type PublicUser = Omit<User, "passwordHash" | "passwordSalt">;

export type PackageCategory = "founder" | "limit";

export type Package = {
  id: string;
  code: "F1" | "F2" | "F3" | (string & {});
  name: string;
  tagline: string;
  price: number;
  currency: string;
  category: PackageCategory;
  active: boolean;
  benefits: string[];
  createdAt: string;
};

export type UserPackage = {
  id: string;
  userId: string;
  packageId: string;
  pricePaid: number;
  status: "active" | "expired";
  purchasedAt: string;
};

export type WalletBalance = {
  asset: string;
  symbol: string;
  balance: number;
  available: number;
  locked: number;
  usdValue: number;
};

export type Wallet = {
  userId: string;
  address: string;
  totalDeposited: number;
  balances: WalletBalance[];
};

export type WalletSummary = {
  totalValue: number;
  availableValue: number;
  lockedValue: number;
  depositedValue: number;
};

export type TransactionType =
  | "Deposit"
  | "Package Purchase"
  | "Referral Reward"
  | "ROI Reward"
  | "Withdrawal"
  | "Token Credit";

export type TransactionStatus = "Completed" | "Pending" | "Failed";

export type Transaction = {
  id: string;
  userId: string;
  type: TransactionType;
  asset: string;
  amount: number;
  status: TransactionStatus;
  date: string;
  description: string;
};

/** The single source of truth the whole demo reads from and writes to. */
export type Database = {
  users: User[];
  packages: Package[];
  userPackages: UserPackage[];
  wallets: Wallet[];
  transactions: Transaction[];
};

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export type ReferralNode = {
  user: PublicUser;
  children: ReferralNode[];
};

export type BinaryNode = {
  user: PublicUser;
  left?: BinaryNode;
  right?: BinaryNode;
};

export type PortfolioRange = "1D" | "1W" | "1M" | "6M" | "1Y";

export type ChartPoint = { label: string; value: number };
