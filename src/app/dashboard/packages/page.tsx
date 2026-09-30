"use client";

import { useMemo, useState } from "react";
import { getPackages, getPurchaseQuote, getUserPackages } from "@/lib/packages";
import { formatUsd } from "@/lib/utils/format";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { PackageCard } from "@/components/packages/package-card";
import { PurchaseModal } from "@/components/packages/purchase-modal";
import { getWalletBalance } from "@/lib/wallet";
import { useCurrentUser, useDb } from "@/store/hooks";

export default function PackagesPage() {
  const db = useDb();
  const user = useCurrentUser();
  const [selected, setSelected] = useState<string | null>(null);

  const packages = useMemo(() => getPackages(db, { onlyActive: true }), [db]);
  const owned = useMemo(
    () => new Set(user ? getUserPackages(db, user.id).map((up) => up.packageId) : []),
    [db, user],
  );
  const quote = useMemo(
    () => (user && selected ? getPurchaseQuote(db, user.id, selected) : undefined),
    [db, user, selected],
  );

  if (!user) return <PageSkeleton />;
  const founders = packages.filter((p) => p.category === "founder");
  const balance = getWalletBalance(db, user.id);

  return (
    <>
      <PageHeader
        title="Founder Packages"
        description={`Choose your founder tier. Available balance: ${formatUsd(balance.availableValue)}`}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {founders.map((pkg, i) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            owned={owned.has(pkg.id)}
            featured={i === 1}
            onSelect={() => setSelected(pkg.id)}
          />
        ))}
      </div>
      <PurchaseModal
        key={selected ?? "closed"}
        open={!!selected}
        onClose={() => setSelected(null)}
        userId={user.id}
        quote={quote}
      />
    </>
  );
}
