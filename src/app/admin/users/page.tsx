"use client";

import { useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import { ADMIN_USER_ACTIONS } from "@/lib/calculations/admin";
import { getActivePackage, isUserActive } from "@/lib/packages";
import { countTeamMembers, getUserById } from "@/lib/referrals";
import { getWallet, getWalletBalance } from "@/lib/wallet";
import { formatDate, formatUsd } from "@/lib/utils/format";
import type { PublicUser } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { TableShell, Td, Th, Tr } from "@/components/ui/table";
import { toPublicUser } from "@/lib/referrals";
import { useDb } from "@/store/hooks";

export default function AdminUsersPage() {
  const db = useDb();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PublicUser | null>(null);

  const users = useMemo(() => {
    const q = query.trim().toLowerCase();
    return db.users
      .filter((u) => u.role === "user")
      .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
  }, [db.users, query]);

  const detail = selected ? getUserById(db.users, selected.id) : undefined;
  const wallet = selected ? getWalletBalance(db, selected.id) : undefined;
  const sponsor = detail ? getUserById(db.users, detail.referredBy) : undefined;

  return (
    <>
      <PageHeader title="Users" description={`${users.length} registered member${users.length === 1 ? "" : "s"}`} />

      <div className="field-pill mb-4 w-full max-w-sm">
        <Search className="size-4 text-dim" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          aria-label="Search users"
          
        />
      </div>

      {users.length === 0 ? (
        <div className="surface-card">
          <EmptyState title="No users found" description="Try a different search." />
        </div>
      ) : (
        <TableShell>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Email</Th>
              <Th>Package</Th>
              <Th className="text-right">Directs</Th>
              <Th className="text-right">Team</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const pkg = getActivePackage(db, u.id);
              const active = isUserActive(db, u.id);
              const suspended = u.status === "suspended";
              return (
                <Tr key={u.id}>
                  <Td>
                    <span className="flex items-center gap-3">
                      <Avatar name={u.name} size={36} />
                      <span className="font-medium text-fg">{u.name}</span>
                    </span>
                  </Td>
                  <Td>{u.email}</Td>
                  <Td className="text-fg">{pkg?.code ?? "—"}</Td>
                  <Td className="num text-right text-fg">{u.directReferralCount}</Td>
                  <Td className="num text-right text-fg">{countTeamMembers(db.users, u.id)}</Td>
                  <Td>
                    <Badge tone={suspended ? "danger" : active ? "success" : "neutral"} dot>
                      {suspended ? "Suspended" : active ? "Active" : "Inactive"}
                    </Badge>
                  </Td>
                  <Td>{formatDate(u.joinedAt)}</Td>
                  <Td className="text-right">
                    <Button size="sm" variant="secondary" onClick={() => setSelected(toPublicUser(u))}>
                      <Eye className="size-3.5" aria-hidden /> View
                    </Button>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </TableShell>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            {ADMIN_USER_ACTIONS.filter((a) => a.id !== "view").map((a) => (
              <Button key={a.id} size="sm" variant="ghost" disabled title="Available in a later phase">
                {a.label}
              </Button>
            ))}
          </div>
        }
      >
        {detail && wallet && (
          <dl className="divide-y divide-line/70 text-sm">
            {[
              ["Email", detail.email],
              ["Referral code", detail.referralCode],
              ["Sponsor", sponsor?.name ?? "—"],
              ["Binary position", detail.binarySide ? `${detail.binarySide} of ${getUserById(db.users, detail.binaryParentId)?.name ?? "—"}` : "—"],
              ["Direct referrals", String(detail.directReferralCount)],
              ["Total team", String(countTeamMembers(db.users, detail.id))],
              ["Wallet value", formatUsd(wallet.totalValue)],
              ["Wallet address", getWallet(db, detail.id)?.address ?? "—"],
              ["Joined", formatDate(detail.joinedAt)],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-secondary">{k}</dt>
                <dd className="num max-w-[60%] break-all text-right text-fg">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>
    </>
  );
}
