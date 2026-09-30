"use client";

import { create } from "zustand";
import { STORAGE_KEYS } from "@/config/site";
import { createSeedDatabase } from "@/data/mock/seed";
import { bindDataSource } from "@/lib/data-source";
import { storage } from "@/lib/storage";
import type { Database } from "@/types";

const EMPTY_DB: Database = { users: [], packages: [], userPackages: [], wallets: [], transactions: [] };

type AppState = Database & {
  /** False until the client has loaded (or seeded) persisted state. */
  hydrated: boolean;
  sessionUserId: string | null;
  hydrate: () => Promise<void>;
  resetDemo: () => Promise<void>;
};

function isDatabase(value: unknown): value is Database {
  const db = value as Database | null;
  return !!db && Array.isArray(db.users) && db.users.length > 0 && Array.isArray(db.packages);
}

function persist(db: Database) {
  storage.write(STORAGE_KEYS.database, db);
}

export const useAppStore = create<AppState>((set, get) => ({
  ...EMPTY_DB,
  hydrated: false,
  sessionUserId: null,

  async hydrate() {
    if (get().hydrated) return;
    const saved = storage.read<Database>(STORAGE_KEYS.database);
    const db = isDatabase(saved) ? saved : await createSeedDatabase();
    if (!isDatabase(saved)) persist(db);
    const session = storage.read<{ userId: string }>(STORAGE_KEYS.session);
    const valid = session && db.users.some((u) => u.id === session.userId);
    set({ ...db, sessionUserId: valid ? session.userId : null, hydrated: true });
  },

  async resetDemo() {
    const db = await createSeedDatabase();
    persist(db);
    storage.remove(STORAGE_KEYS.session);
    set({ ...db, sessionUserId: null });
  },
}));

/** Plug the store into the domain services' data-source seam. */
bindDataSource({
  getDb() {
    const { users, packages, userPackages, wallets, transactions } = useAppStore.getState();
    return { users, packages, userPackages, wallets, transactions };
  },
  setDb(db) {
    persist(db);
    useAppStore.setState({ ...db });
  },
  getSessionUserId: () => useAppStore.getState().sessionUserId,
  setSessionUserId(id) {
    if (id) storage.write(STORAGE_KEYS.session, { userId: id });
    else storage.remove(STORAGE_KEYS.session);
    useAppStore.setState({ sessionUserId: id });
  },
});
