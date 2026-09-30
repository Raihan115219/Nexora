"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils/format";
import { EthGlyph } from "./eth-glyph";

// three.js is only downloaded on the client, after first paint.
const EthCrystal = dynamic(() => import("./eth-crystal"), {
  ssr: false,
  loading: () => <EthGlyph className="size-full animate-shimmer" />,
});

/** 3D Ethereum crystal on a soft green stage. Size it with `className`. */
export function EthHero({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[6%] left-1/2 h-[7%] w-[38%] -translate-x-1/2 rounded-[100%] bg-primary/15 blur-xl"
      />
      <EthCrystal className="relative size-full" />
    </div>
  );
}
