import { cn, initials } from "@/lib/utils/format";

const TINTS = [
  "from-[#1d4d2c] to-[#0d2a18]",
  "from-[#255c33] to-[#0f2f1b]",
  "from-[#1a4a3a] to-[#0b2a20]",
  "from-[#2b5a25] to-[#12290f]",
  "from-[#174d3f] to-[#0a2a24]",
];

function tintFor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return TINTS[hash % TINTS.length];
}

export function Avatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.max(size * 0.36, 10) }}
      className={cn(
        "grid shrink-0 place-items-center rounded-full border border-line-2 bg-gradient-to-br font-semibold text-soft",
        tintFor(name),
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
