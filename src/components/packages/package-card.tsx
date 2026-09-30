import { Check } from "lucide-react";
import type { Package } from "@/types";
import { cn, formatUsd } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function PackageCard({
  pkg,
  owned,
  disabledReason,
  featured,
  onSelect,
}: {
  pkg: Package;
  owned: boolean;
  disabledReason?: string;
  featured?: boolean;
  onSelect: () => void;
}) {
  return (
    <article
      className={cn(
        "surface-card relative flex flex-col p-6 transition-all duration-200 ease-out hover:border-primary/40",
        featured && "border-primary/40 shadow-[0_0_40px_-16px_rgba(57,255,90,0.5)]",
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-4xl font-semibold tracking-tight text-fg">{pkg.code}</p>
          <p className="mt-1 text-sm text-secondary">{pkg.name}</p>
        </div>
        {owned ? (
          <Badge tone="success" dot>
            Active
          </Badge>
        ) : (
          featured && <Badge tone="primary">Popular</Badge>
        )}
      </div>

      <p className="num mt-6 text-[40px] leading-none font-semibold text-fg">
        {formatUsd(pkg.price, { whole: true })}
      </p>
      <p className="mt-1 text-xs text-dim">{pkg.currency} · one-time</p>

      <div className="my-6 h-px bg-line" />

      <p className="mb-3 text-xs font-medium tracking-wider text-dim uppercase">Benefits</p>
      <ul className="flex-1 space-y-2.5">
        {pkg.benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2.5 text-sm text-secondary">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            {benefit}
          </li>
        ))}
      </ul>

      <Button
        className="mt-7 w-full"
        size="lg"
        variant={owned ? "secondary" : "primary"}
        disabled={owned || !!disabledReason}
        onClick={onSelect}
      >
        {owned ? "Package active" : (disabledReason ?? "Purchase Package")}
      </Button>
    </article>
  );
}
