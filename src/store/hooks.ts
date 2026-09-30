"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { getUserSummary, type UserSummary } from "@/lib/calculations/summary";
import { toPublicUser } from "@/lib/referrals";
import type { Database, PublicUser } from "@/types";
import { useAppStore } from "./app-store";

/** Reactive snapshot of the whole mock database. */
export function useDb(): Database {
  return useAppStore(
    useShallow((s) => ({
      users: s.users,
      packages: s.packages,
      userPackages: s.userPackages,
      wallets: s.wallets,
      transactions: s.transactions,
    })),
  );
}

export function useHydrated(): boolean {
  return useAppStore((s) => s.hydrated);
}

export function useSessionUserId(): string | null {
  return useAppStore((s) => s.sessionUserId);
}

export function useCurrentUser(): PublicUser | null {
  const users = useAppStore((s) => s.users);
  const id = useAppStore((s) => s.sessionUserId);
  return useMemo(() => {
    const user = id ? users.find((u) => u.id === id) : undefined;
    return user ? toPublicUser(user) : null;
  }, [users, id]);
}

/** Headline numbers for the signed-in member, recomputed when the db changes. */
export function useUserSummary(): UserSummary | null {
  const db = useDb();
  const user = useCurrentUser();
  return useMemo(() => (user ? getUserSummary(db, user.id) : null), [db, user]);
}
