"use client";

import { useMemo } from "react";
import { getUserTransactions } from "@/lib/wallet";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { TransactionTable } from "@/components/wallet/transaction-table";
import { useCurrentUser, useDb } from "@/store/hooks";

export default function TransactionsPage() {
  const db = useDb();
  const user = useCurrentUser();
  const transactions = useMemo(() => (user ? getUserTransactions(db, user.id) : []), [db, user]);
  if (!user) return <PageSkeleton />;

  return (
    <>
      <PageHeader title="Transactions" description="Every deposit, purchase, reward and withdrawal on your account." />
      <TransactionTable transactions={transactions} />
    </>
  );
}
