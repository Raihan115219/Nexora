import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/format";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary font-semibold hover:bg-primary-2 hover:shadow-glow active:scale-[0.98]",
  secondary: "bg-surface-3 text-fg border border-line-2 hover:border-primary/50 hover:text-primary",
  ghost: "text-secondary hover:text-fg hover:bg-surface-3",
  danger: "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-5 text-sm gap-2",
  lg: "h-12 px-7 text-[15px] gap-2",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, disabled, className, children, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-full whitespace-nowrap transition-all duration-200 ease-out",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
      )}
      {children}
    </button>
  );
});

/** Circular icon-only button (header actions, rail icons). */
export const IconButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean }
>(function IconButton({ label, active, className, children, type = "button", ...props }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "relative grid size-11 shrink-0 place-items-center rounded-full border transition-all duration-200 ease-out",
        active
          ? "border-primary bg-primary text-on-primary shadow-glow"
          : "border-line-2 bg-surface/60 text-fg hover:border-primary/50 hover:text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
