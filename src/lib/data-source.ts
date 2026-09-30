import type { Database } from "@/types";

/**
 * The seam between domain services and wherever data actually lives.
 * Phase 1 binds this to the in-browser Zustand store; a later phase can bind
 * it to REST/GraphQL/DB clients without changing any service signature.
 */
export interface DataSource {
  getDb(): Database;
  setDb(db: Database): void;
  getSessionUserId(): string | null;
  setSessionUserId(id: string | null): void;
}

let source: DataSource | null = null;

export function bindDataSource(next: DataSource): void {
  source = next;
}

export function dataSource(): DataSource {
  if (!source) throw new Error("Data source has not been bound yet.");
  return source;
}
