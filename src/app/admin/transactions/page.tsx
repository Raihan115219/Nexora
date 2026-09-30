"use client";

import { useMemo } from "react";
import { toPublicUser } from "@/lib/referrals";
import { PageHeader } from "@/components/ui/page-header";
import { TransactionTable } from "@/components/wallet/transaction-table";
import { useDb } from "@/store/hooks";

export default function AdminTransactionsPage() {
  const db = useDb();
  const users = useMemo(() => db.users.map(toPublicUser), [db.users]);
  const transactions = useMemo(
    () => [...db.transactions].sort((a, b) => b.date.localeCompare(a.date)),
    [db.transactions],
  );

  return (
    <>
      <PageHeader title="Transactions" description="Every transaction across the platform." />
      <TransactionTable transactions={transactions} users={users} />
    </>
  );
}
