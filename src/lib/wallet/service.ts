import { dataSource } from "@/lib/data-source";
import type { Result, WalletSummary } from "@/types";
import { applyDeposit, getWalletBalance as summarise } from "./index";

export function getWalletBalance(userId: string): WalletSummary {
  return summarise(dataSource().getDb(), userId);
}

/** Mock deposit — a real implementation would verify an on-chain transfer. */
export async function depositFunds(userId: string, amount: number): Promise<Result<WalletSummary>> {
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Enter a valid amount." };
  const ds = dataSource();
  ds.setDb(applyDeposit(ds.getDb(), userId, amount, "Mock deposit"));
  return { ok: true, data: summarise(ds.getDb(), userId) };
}
