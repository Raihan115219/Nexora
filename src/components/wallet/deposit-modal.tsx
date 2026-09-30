"use client";

import { useState } from "react";
import { depositFunds } from "@/lib/wallet/service";
import { formatUsd } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

const PRESETS = [500, 1000, 5000];

export function DepositModal({ open, onClose, userId }: { open: boolean; onClose: () => void; userId: string }) {
  const toast = useToast();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  function close() {
    setAmount("");
    setError(undefined);
    onClose();
  }

  async function submit() {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    setBusy(true);
    const result = await depositFunds(userId, value);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success("Deposit received", `${formatUsd(value)} USDT credited (demo).`);
    close();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Deposit USDT"
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button onClick={submit} loading={busy}>
            Confirm deposit
          </Button>
        </>
      }
    >
      <p className="mb-4 text-sm text-secondary">
        Demo only — no funds move. A live build would verify an on-chain transfer before crediting.
      </p>
      <Input
        label="Amount (USDT)"
        inputMode="decimal"
        placeholder="0.00"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
          setError(undefined);
        }}
        error={error}
      />
      <div className="mt-3 flex gap-2">
        {PRESETS.map((p) => (
          <Button key={p} size="sm" variant="secondary" onClick={() => setAmount(String(p))}>
            {formatUsd(p, { whole: true })}
          </Button>
        ))}
      </div>
    </Modal>
  );
}
