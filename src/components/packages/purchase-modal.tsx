"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { PurchaseQuote } from "@/lib/packages";
import { purchasePackage } from "@/lib/packages/service";
import { formatUsd } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

type Step = "review" | "confirm" | "success";

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-sm text-secondary">{label}</dt>
      <dd className={strong ? "num text-base font-semibold text-fg" : "num text-sm text-fg"}>{value}</dd>
    </div>
  );
}

/** Select → Review → Confirm → Success. All maths comes from the quote. Mount with a `key` to reset the flow. */
export function PurchaseModal({
  open,
  onClose,
  userId,
  quote,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  quote: PurchaseQuote | undefined;
}) {
  const toast = useToast();
  const [step, setStep] = useState<Step>("review");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [finalBalance, setFinalBalance] = useState<number>();

  if (!quote) return null;
  const { package: pkg } = quote;

  async function confirm() {
    setBusy(true);
    setError(undefined);
    const result = await purchasePackage(userId, pkg.id);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      toast.error("Purchase failed", result.error);
      return;
    }
    setFinalBalance(quote!.remainingBalance);
    setStep("success");
    toast.success(`${pkg.code} package activated`);
  }

  if (step === "success") {
    return (
      <Modal open={open} onClose={onClose} title="Purchase complete">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <span className="grid size-16 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary shadow-glow">
            <CheckCircle2 className="size-8" aria-hidden />
          </span>
          <p className="text-lg font-semibold">{pkg.code} Founder package is now active</p>
          <p className="text-sm text-secondary">
            {formatUsd(pkg.price, { whole: true })} was deducted from your USDT wallet. Remaining balance:{" "}
            <span className="num text-fg">{formatUsd(finalBalance ?? 0)}</span>
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/dashboard" onClick={onClose}>
            <Button className="w-full">Go to dashboard</Button>
          </Link>
          <Link href="/dashboard/transactions" onClick={onClose}>
            <Button variant="secondary" className="w-full">
              View transaction
            </Button>
          </Link>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={step === "review" ? `Purchase ${pkg.code}` : "Confirm purchase"}
      footer={
        step === "review" ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => setStep("confirm")} disabled={!quote.canAfford}>
              Continue
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => setStep("review")} disabled={busy}>
              Back
            </Button>
            <Button onClick={confirm} loading={busy}>
              Confirm Purchase
            </Button>
          </>
        )
      }
    >
      {step === "review" ? (
        <dl className="divide-y divide-line/70">
          <Row label="Package" value={`${pkg.code} ${pkg.name}`} />
          <Row label="Price" value={formatUsd(pkg.price, { whole: true })} strong />
          <Row label="Payment asset" value={quote.paymentAsset} />
          <Row label="Available balance" value={formatUsd(quote.availableBalance)} />
          <Row label="Remaining balance" value={formatUsd(Math.max(quote.remainingBalance, 0))} />
        </dl>
      ) : (
        <p className="text-sm leading-relaxed text-secondary">
          You are about to buy <span className="font-medium text-fg">{pkg.code} {pkg.name}</span> for{" "}
          <span className="num font-medium text-fg">{formatUsd(pkg.price, { whole: true })}</span>. This amount is
          deducted immediately from your available {quote.paymentAsset} balance.
        </p>
      )}
      {!quote.canAfford && step === "review" && (
        <p role="alert" className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          Insufficient balance — deposit more USDT from the Wallet page to continue.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}
    </Modal>
  );
}
