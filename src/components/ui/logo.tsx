import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/format";

/** Nexora mark — two interlocking squares, echoing the reference's bracket glyph. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={cn("size-8 text-fg", className)}>
      <path d="M3 3h20l6 6v20H9l-6-6V3z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M11 21V11l10 10V11" stroke="#39ff5a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className, showName = true }: { className?: string; showName?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {showName && <span className="text-xl font-semibold tracking-tight text-fg">{siteConfig.name}</span>}
    </span>
  );
}
