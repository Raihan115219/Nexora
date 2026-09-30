"use client";

import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Plus } from "lucide-react";
import type { WalletSummary } from "@/types";
import { formatFixed, formatNumber } from "@/lib/utils/format";
import { Amount, Delta } from "@/components/ui/amount";
import { DepositModal } from "@/components/wallet/deposit-modal";
import { useToast } from "@/components/ui/toast";
import { EthHero } from "@/components/three/eth-hero";

export function WalletHero({ userId, wallet, earnings }: { userId: string; wallet: WalletSummary; earnings: number }) {
  const [depositOpen, setDepositOpen] = useState(false);
  const toast = useToast();
  const earningsPercent = wallet.totalValue ? (earnings / wallet.totalValue) * 100 : 0;

  return (
    <div className="flex flex-col items-center text-center">
      <EthHero className="mx-auto -mt-2 h-48 w-full max-w-[280px] sm:h-52" />
      <p className="text-xs font-medium tracking-wider text-secondary uppercase">Total portfolio value</p>
      <Amount value={formatFixed(wallet.totalValue)} unit="USD" size="hero" className="mt-2" />
      <Delta value={earnings} suffix={`$${formatNumber(earnings)} (${earningsPercent.toFixed(1)}%) earned`} className="mt-3 text-[13px]" />

      <div className="mt-6 grid w-full grid-cols-[1fr_auto_1fr] items-center rounded-full border border-line-2 bg-surface/60 p-1.5">
        <button
          onClick={() => setDepositOpen(true)}
          className="flex h-11 items-center justify-center gap-2 rounded-full text-sm text-fg transition-colors hover:text-primary"
        >
          <ArrowDownToLine className="size-4" aria-hidden /> Deposit
        </button>
        <button
          onClick={() => setDepositOpen(true)}
          aria-label="Add funds"
          className="grid size-12 place-items-center rounded-full bg-primary text-on-primary shadow-glow transition-transform duration-200 hover:scale-105"
        >
          <Plus className="size-6" aria-hidden />
        </button>
        <button
          onClick={() => toast.info("Withdrawals arrive in a later phase", "Real payouts need wallet and approval infrastructure.")}
          className="flex h-11 items-center justify-center gap-2 rounded-full text-sm text-fg transition-colors hover:text-primary"
        >
          Withdraw <ArrowUpFromLine className="size-4" aria-hidden />
        </button>
      </div>

      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} userId={userId} />
    </div>
  );
}
