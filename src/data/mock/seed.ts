import { DEMO_ACCOUNTS } from "@/config/site";
import { PACKAGE_CATALOG } from "@/config/packages";
import { hashPassword } from "@/lib/auth/password";
import { placeUser } from "@/lib/binary";
import { createReferralRelationship } from "@/lib/referrals";
import { buildBalance, createTransaction } from "@/lib/wallet";
import type { Database, Transaction, User, UserPackage, Wallet } from "@/types";
import { ADMIN_PERSON, CURRENT_USER_ID, SEED_PEOPLE } from "./people";

const addDays = (iso: string, days: number) =>
  new Date(new Date(iso).getTime() + days * 86_400_000).toISOString();

function wallet(userId: string, address: string, deposited: number, usdt: number, plt: number, ern: number): Wallet {
  return {
    userId,
    address,
    totalDeposited: deposited,
    // Tokens are fully locked (staked) in the demo; USDT is fully available.
    balances: [buildBalance("USDT", usdt), buildBalance("PLT", plt, plt), buildBalance("ERN", ern, ern)],
  };
}

const tx = (
  userId: string,
  type: Transaction["type"],
  asset: string,
  amount: number,
  date: string,
  description: string,
  status: Transaction["status"] = "Completed",
): Transaction => ({ ...createTransaction({ userId, type, asset, amount, date, description, status }), id: `tx_${userId}_${date.slice(0, 10)}_${type.replace(/\s/g, "").toLowerCase()}_${Math.abs(amount)}` });

/** Builds the fully-populated demo database (deterministic ids and data). */
export async function createSeedDatabase(): Promise<Database> {
  const packages = PACKAGE_CATALOG.map((p) => ({ ...p }));
  const salt = "nexora-demo-salt";
  const passwordHash = await hashPassword(DEMO_ACCOUNTS.user.password, salt);

  // --- Users -------------------------------------------------------------
  let users: User[] = [
    {
      id: ADMIN_PERSON.id,
      name: ADMIN_PERSON.name,
      email: ADMIN_PERSON.email,
      role: "admin",
      status: "active",
      referralCode: ADMIN_PERSON.code,
      directReferralCount: 0,
      joinedAt: ADMIN_PERSON.joined,
      passwordHash,
      passwordSalt: salt,
    },
  ];

  for (const person of SEED_PEOPLE) {
    users.push({
      id: person.id,
      name: person.name,
      email: person.email,
      phone: person.phone,
      role: "user",
      status: "active",
      referralCode: person.code,
      directReferralCount: 0,
      joinedAt: person.joined,
      passwordHash,
      passwordSalt: salt,
    });
    const linked = createReferralRelationship(users, person.id, person.sponsor);
    if (!linked.ok) throw new Error(`Seed referral failed for ${person.id}: ${linked.error}`);
    users = linked.data;
    const placed = placeUser(users, person.id, person.sponsor);
    if (!placed.ok) throw new Error(`Seed placement failed for ${person.id}: ${placed.error}`);
    users = placed.data.users;
  }

  // --- Packages, wallets & transactions -----------------------------------
  const userPackages: UserPackage[] = [];
  const wallets: Wallet[] = [];
  const transactions: Transaction[] = [];

  wallets.push(wallet(ADMIN_PERSON.id, "0xa11ce0000000000000000000000000000000ad01", 0, 0, 0, 0));

  SEED_PEOPLE.forEach((person, index) => {
    const address = `0x${(0x7f3a9c + index * 977).toString(16).padStart(6, "0")}${person.id.replace("usr_", "").padEnd(10, "0").slice(0, 10)}${"e4b1".repeat(6)}`.slice(0, 42);
    const pkg = packages.find((p) => p.code === person.pkg);
    const purchasedAt = addDays(person.joined, 2);

    if (person.id === CURRENT_USER_ID) {
      // Hand-tuned so the headline numbers on the dashboard read nicely:
      // total 12,450.50 · available 8,240.50 · locked 4,210.00
      wallets.push(wallet(person.id, "0xf07a1c94b3d5e27a8106c9d4ef3b5a71c2d48336", 11_240.5, 8_240.5, 6_000, 2_420));
      userPackages.push({ id: `up_${person.id}`, userId: person.id, packageId: "pkg_f3", pricePaid: 3000, status: "active", purchasedAt });
      transactions.push(
        tx(person.id, "Deposit", "USDT", 7000, "2026-01-12T09:10:00.000Z", "Deposit via USDT (TRC-20)"),
        tx(person.id, "Deposit", "USDT", 4240.5, "2026-03-02T13:45:00.000Z", "Deposit via USDT (TRC-20)"),
        tx(person.id, "Package Purchase", "USDT", -3000, purchasedAt, "F3 Founder Tier purchase"),
        tx(person.id, "Token Credit", "PLT", 6000, addDays(purchasedAt, 1), "Founder token allocation"),
        tx(person.id, "Referral Reward", "USDT", 600, "2026-02-03T14:10:00.000Z", "Referral reward — Priya Nair"),
        tx(person.id, "Referral Reward", "USDT", 450, "2026-02-19T09:45:00.000Z", "Referral reward — Marcus Bell"),
        tx(person.id, "Referral Reward", "USDT", 300, "2026-03-11T17:20:00.000Z", "Referral reward — Elena Rossi"),
        tx(person.id, "Referral Reward", "USDT", 300, "2026-04-02T11:35:00.000Z", "Referral reward — Sofia Almeida"),
        tx(person.id, "Referral Reward", "USDT", 250, "2026-08-21T20:15:00.000Z", "Referral reward — Kenji Watanabe"),
        tx(person.id, "ROI Reward", "USDT", 462, "2026-05-15T00:05:00.000Z", "ROI reward — May"),
        tx(person.id, "ROI Reward", "USDT", 462, "2026-06-15T00:05:00.000Z", "ROI reward — June"),
        tx(person.id, "ROI Reward", "USDT", 462, "2026-07-15T00:05:00.000Z", "ROI reward — July"),
        tx(person.id, "ROI Reward", "USDT", 462, "2026-08-15T00:05:00.000Z", "ROI reward — August"),
        tx(person.id, "ROI Reward", "USDT", 462, "2026-09-15T00:05:00.000Z", "ROI reward — September"),
        tx(person.id, "Token Credit", "ERN", 2420, "2026-09-01T08:00:00.000Z", "Earned token credit"),
        tx(person.id, "Withdrawal", "USDT", -200, "2026-09-10T16:30:00.000Z", "Withdrawal to external wallet", "Failed"),
        tx(person.id, "Withdrawal", "USDT", -500, "2026-09-24T12:00:00.000Z", "Withdrawal to external wallet", "Pending"),
      );
      return;
    }

    if (pkg) {
      const leftover = 800 + ((index * 731) % 4200);
      wallets.push(wallet(person.id, address, pkg.price + leftover, leftover, pkg.price * 2, Math.round(pkg.price * 0.1)));
      userPackages.push({ id: `up_${person.id}`, userId: person.id, packageId: pkg.id, pricePaid: pkg.price, status: "active", purchasedAt });
      transactions.push(
        tx(person.id, "Deposit", "USDT", pkg.price + leftover, addDays(person.joined, 1), "Deposit via USDT (TRC-20)"),
        tx(person.id, "Package Purchase", "USDT", -pkg.price, purchasedAt, `${pkg.code} ${pkg.name} purchase`),
        tx(person.id, "Token Credit", "PLT", pkg.price * 2, addDays(purchasedAt, 1), "Founder token allocation"),
      );
    } else {
      const deposit = 1500 + index * 40;
      wallets.push(wallet(person.id, address, deposit, deposit, 0, 0));
      transactions.push(tx(person.id, "Deposit", "USDT", deposit, addDays(person.joined, 1), "Deposit via USDT (TRC-20)"));
    }
  });

  transactions.sort((a, b) => b.date.localeCompare(a.date));

  return { users, packages, userPackages, wallets, transactions };
}
