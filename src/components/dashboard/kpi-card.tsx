import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/format";

/** Compact metric card modelled on the reference's "Top Market Coins" tiles. */
export function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  highlight,
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon: LucideIcon;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("surface-card flex flex-col gap-3 p-4 sm:p-5", className)}>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full border",
            highlight ? "border-primary bg-primary text-on-primary" : "border-line-2 bg-surface-3 text-primary",
          )}
        >
          <Icon className="size-[18px]" aria-hidden />
        </span>
        <span className="text-xs font-medium leading-tight text-secondary">{label}</span>
      </div>
      <div>
        <div className="num text-xl font-semibold leading-tight text-fg sm:text-2xl">{value}</div>
        {sub && <div className="mt-1 text-xs text-secondary">{sub}</div>}
      </div>
    </div>
  );
}
