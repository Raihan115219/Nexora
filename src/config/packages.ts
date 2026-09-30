import type { Package } from "@/types";

/**
 * Package catalogue — the ONLY place package prices live.
 * Components and services must read from the database (seeded from here),
 * never hard-code a price. Limit-plan packages can be appended with
 * `category: "limit"` without any UI changes.
 */
export const PACKAGE_CATALOG: Package[] = [
  {
    id: "pkg_f3",
    code: "F3",
    name: "Founder Tier",
    tagline: "Entry founder membership",
    price: 3000,
    currency: "USD",
    category: "founder",
    active: true,
    createdAt: "2025-09-01T00:00:00.000Z",
    benefits: [
      "Founder membership",
      "Pre-ICO eligibility",
      "Direct referral qualification",
      "Business participation",
    ],
  },
  {
    id: "pkg_f2",
    code: "F2",
    name: "Founder Tier",
    tagline: "Mid founder membership",
    price: 6000,
    currency: "USD",
    category: "founder",
    active: true,
    createdAt: "2025-09-01T00:00:00.000Z",
    benefits: [
      "Founder membership",
      "Pre-ICO eligibility",
      "Direct referral qualification",
      "Business participation",
    ],
  },
  {
    id: "pkg_f1",
    code: "F1",
    name: "Founder Tier",
    tagline: "Top founder membership",
    price: 9000,
    currency: "USD",
    category: "founder",
    active: true,
    createdAt: "2025-09-01T00:00:00.000Z",
    benefits: [
      "Founder membership",
      "Pre-ICO eligibility",
      "Direct referral qualification",
      "Business participation",
    ],
  },
];
