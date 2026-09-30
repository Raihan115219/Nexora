import { cn } from "@/lib/utils/format";

/**
 * Static Ethereum glyph. Shown while the 3D scene loads and as the fallback
 * when WebGL is unavailable, so the layout never jumps.
 */
export function EthGlyph({ className }: { className?: string }) {
  return (
    <div className={cn("grid place-items-center", className)} aria-hidden>
      <svg viewBox="0 0 64 104" className="h-[62%] w-auto opacity-80">
        <path d="M32 2 60 50 32 64 4 50z" fill="#0d1d15" stroke="#39ff5a" strokeOpacity="0.6" strokeWidth="1.2" />
        <path d="M32 2v62M4 50l28-12 28 12" fill="none" stroke="#39ff5a" strokeOpacity="0.3" strokeWidth="1" />
        <path d="M4 56 32 70 60 56 32 102z" fill="#0b1812" stroke="#39ff5a" strokeOpacity="0.6" strokeWidth="1.2" />
      </svg>
    </div>
  );
}
