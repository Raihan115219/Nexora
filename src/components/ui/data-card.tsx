import type { ReactNode } from "react";

/**
 * Mobile counterpart to TableShell: on phones each table row becomes a card.
 * Pair `<TableShell className="hidden md:block">` with `<DataCardList>`.
 */
export function DataCardList({ children }: { children: ReactNode }) {
  return <ul className="space-y-3 md:hidden">{children}</ul>;
}

export type DataCardField = { label: string; value: ReactNode };

export function DataCard({
  title,
  subtitle,
  leading,
  trailing,
  fields = [],
  footer,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  fields?: DataCardField[];
  footer?: ReactNode;
}) {
  return (
    <li className="surface-card p-4">
      <div className="flex items-start gap-3">
        {leading}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-fg">{title}</p>
          {subtitle && <p className="mt-0.5 truncate text-xs text-secondary">{subtitle}</p>}
        </div>
        {trailing && <div className="shrink-0 text-right">{trailing}</div>}
      </div>
      {fields.length > 0 && (
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-line/70 pt-3">
          {fields.map((f) => (
            <div key={f.label} className="min-w-0">
              <dt className="text-[11px] tracking-wider text-dim uppercase">{f.label}</dt>
              <dd className="num mt-0.5 truncate text-sm text-fg">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {footer && <div className="mt-3">{footer}</div>}
    </li>
  );
}
