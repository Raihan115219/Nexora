import { cn } from "@/lib/utils/format";

/** Big financial figure with a dimmed unit, as in the reference ("1.2938 ETH"). */
export function Amount({
  value,
  unit,
  size = "lg",
  className,
}: {
  value: string;
  unit?: string;
  size?: "md" | "lg" | "xl" | "hero";
  className?: string;
}) {
  const sizes = {
    md: "text-2xl",
    lg: "text-[28px] leading-9",
    xl: "text-4xl",
    hero: "text-[40px] leading-none",
  } as const;
  return (
    <span className={cn("num font-semibold text-fg", sizes[size], className)}>
      {value}
      {unit && <span className={cn("ml-2 text-secondary/80", size === "hero" && "text-[26px]")}>{unit}</span>}
    </span>
  );
}

/** Green ▲ / red ▼ delta line. */
export function Delta({ value, suffix, className }: { value: number; suffix?: string; className?: string }) {
  const positive = value >= 0;
  return (
    <span className={cn("num inline-flex items-center gap-1 text-xs font-medium", positive ? "text-primary" : "text-danger", className)}>
      <span aria-hidden className="text-[8px]">
        {positive ? "▲" : "▼"}
      </span>
      {suffix}
    </span>
  );
}
