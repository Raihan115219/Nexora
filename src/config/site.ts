export const siteConfig = {
  name: "Nexora",
  tagline: "A next-generation Web3 compensation ecosystem.",
  /** Base URL used to build referral links in the demo. */
  baseUrl: "https://demo.nexora.io",
} as const;

/** Mock-only pricing for the non-USD assets. Replace with a price feed later. */
export const ASSET_PRICES_USD: Record<string, number> = {
  USDT: 1,
  PLT: 0.5,
  ERN: 0.5,
};

export const ASSET_META: Record<string, { name: string; symbol: string }> = {
  USDT: { name: "Tether", symbol: "USDT" },
  PLT: { name: "Platform Token", symbol: "PLT" },
  ERN: { name: "Earned Token", symbol: "ERN" },
};

/** Demo-only: every newly registered user receives this mock deposit. */
export const DEMO_STARTING_DEPOSIT_USDT = 10_000;

/** Demo credentials surfaced on the login screen. */
export const DEMO_ACCOUNTS = {
  user: { email: "alex.morgan@nexora.io", password: "Demo@1234" },
  admin: { email: "admin@nexora.io", password: "Demo@1234" },
} as const;

/**
 * Login / register / forgot-password are hidden while this is false: those
 * routes redirect to the dashboard and the app signs in the demo member
 * automatically. Set NEXT_PUBLIC_AUTH_ENABLED=true to bring them back.
 */
export const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";

export const PASSWORD_MIN_LENGTH = 8;

export const STORAGE_KEYS = {
  database: "nexora.db.v1",
  session: "nexora.session.v1",
} as const;
