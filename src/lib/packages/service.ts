import { dataSource } from "@/lib/data-source";
import type { Result } from "@/types";
import { applyPackagePurchase, type PurchaseOutcome } from "./index";

/**
 * purchasePackage(userId, packageId) — validates, deducts the mock wallet,
 * activates the package and records the transaction. All arithmetic lives in
 * `applyPackagePurchase`; components only call this.
 */
export async function purchasePackage(
  userId: string,
  packageId: string,
): Promise<Result<Omit<PurchaseOutcome, "db">>> {
  const ds = dataSource();
  const result = applyPackagePurchase(ds.getDb(), userId, packageId);
  if (!result.ok) return result;
  ds.setDb(result.data.db);
  return {
    ok: true,
    data: { userPackage: result.data.userPackage, transaction: result.data.transaction },
  };
}
