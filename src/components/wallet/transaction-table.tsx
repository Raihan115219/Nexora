"use client";

import { useMemo, useState } from "react";
import type { PublicUser, Transaction, TransactionStatus, TransactionType } from "@/types";
import { cn, formatDateTime } from "@/lib/utils/format";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/badge";
import { SegmentedTabs } from "@/components/ui/tabs";
import { TableShell, Td, Th, Tr } from "@/components/ui/table";
import { formatTxAmount, TxIcon } from "./transaction-list";

const TYPES: Array<"All" | TransactionType> = [
  "All",
  "Deposit",
  "Package Purchase",
  "Referral Reward",
  "ROI Reward",
  "Withdrawal",
  "Token Credit",
];
const STATUSES: Array<"All" | TransactionStatus> = ["All", "Completed", "Pending", "Failed"];

export function TransactionTable({
  transactions,
  users,
}: {
  transactions: Transaction[];
  /** When provided, a "User" column is shown (admin view). */
  users?: PublicUser[];
}) {
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");

  const userName = useMemo(() => new Map((users ?? []).map((u) => [u.id, u.name])), [users]);
  const rows = useMemo(
    () =>
      transactions.filter((t) => (type === "All" || t.type === type) && (status === "All" || t.status === status)),
    [transactions, type, status],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <SegmentedTabs label="Filter by type" options={TYPES} value={type} onChange={setType} />
        </div>
        <SegmentedTabs label="Filter by status" options={STATUSES} value={status} onChange={setStatus} />
      </div>

      {rows.length === 0 ? (
        <div className="surface-card">
          <EmptyState title="No matching transactions" description="Try a different type or status filter." />
        </div>
      ) : (
        <TableShell>
          <thead>
            <tr>
              <Th>Type</Th>
              {users && <Th>User</Th>}
              <Th>Description</Th>
              <Th className="text-right">Amount</Th>
              <Th>Status</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((tx) => {
              const amount = formatTxAmount(tx);
              return (
                <Tr key={tx.id}>
                  <Td>
                    <span className="flex items-center gap-3 text-fg">
                      <TxIcon type={tx.type} />
                      {tx.type}
                    </span>
                  </Td>
                  {users && <Td className="text-fg">{userName.get(tx.userId) ?? "—"}</Td>}
                  <Td className="max-w-[280px] truncate">{tx.description}</Td>
                  <Td className={cn("num text-right font-semibold", amount.positive ? "text-primary" : "text-fg")}>
                    {amount.text}
                  </Td>
                  <Td>
                    <StatusBadge status={tx.status} />
                  </Td>
                  <Td>{formatDateTime(tx.date)}</Td>
                </Tr>
              );
            })}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}
