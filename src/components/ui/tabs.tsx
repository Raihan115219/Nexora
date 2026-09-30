"use client";

import { cn } from "@/lib/utils/format";

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex w-max items-center gap-1.5">
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option)}
            className={cn(
              "h-8 min-w-11 shrink-0 rounded-full border px-3 text-xs font-medium whitespace-nowrap transition-all duration-200 ease-out",
              active
                ? "border-primary bg-primary text-on-primary"
                : "border-line-2 bg-surface/60 text-secondary hover:border-primary/40 hover:text-fg",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
