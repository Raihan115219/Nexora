import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/format";

type Tone = "success" | "warn" | "danger" | "neutral" | "primary";

const tones: Record<Tone, string> = {
  success: "bg-primary/10 text-primary border-primary/25",
  primary: "bg-primary text-on-primary border-transparent font-semibold",
  warn: "bg-warn/10 text-warn border-warn/25",
  danger: "bg-danger/10 text-danger border-danger/25",
  neutral: "bg-surface-3 text-secondary border-line-2",
};

export function Badge({
  tone = "neutral",
  dot,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone; dot?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: "Completed" | "Pending" | "Failed" }) {
  const tone: Tone = status === "Completed" ? "success" : status === "Pending" ? "warn" : "danger";
  return (
    <Badge tone={tone} dot>
      {status}
    </Badge>
  );
}
