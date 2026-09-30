"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { getWallet } from "@/lib/wallet";
import { formatDate } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useAppStore } from "@/store/app-store";
import { useCurrentUser, useDb } from "@/store/hooks";

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const db = useDb();
  const user = useCurrentUser();
  const resetDemo = useAppStore((s) => s.resetDemo);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!user) return <PageSkeleton />;
  const wallet = getWallet(db, user.id);

  async function reset() {
    setBusy(true);
    await resetDemo();
    setBusy(false);
    setConfirmOpen(false);
    toast.success("Demo data reset", "Sign in again with a demo account.");
    router.replace("/login");
  }

  return (
    <>
      <PageHeader title="Settings" description="Your profile and demo controls." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Profile" />
          <div className="mb-5 flex items-center gap-4">
            <Avatar name={user.name} size={56} />
            <div>
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-sm text-secondary capitalize">{user.role}</p>
            </div>
          </div>
          <dl className="divide-y divide-line/70 text-sm">
            {[
              ["Email", user.email],
              ["Phone", user.phone ?? "—"],
              ["Referral code", user.referralCode],
              ["Wallet address", wallet?.address ?? "—"],
              ["Member since", formatDate(user.joinedAt)],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-secondary">{k}</dt>
                <dd className="num max-w-[65%] text-right break-all text-fg">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <CardHeader title="Demo data" />
          <p className="text-sm text-secondary">
            All data lives in this browser only. Reset restores the seeded population, wallets and transactions, and
            signs you out — handy before a fresh walkthrough of the register → purchase → admin flow.
          </p>
          <Button variant="danger" className="mt-5" onClick={() => setConfirmOpen(true)}>
            <RotateCcw className="size-4" aria-hidden /> Reset demo data
          </Button>
        </Card>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Reset demo data?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={reset} loading={busy}>
              Reset everything
            </Button>
          </>
        }
      >
        <p className="text-sm text-secondary">
          Accounts, purchases and transactions you created will be removed and the original demo data restored.
        </p>
      </Modal>
    </>
  );
}
