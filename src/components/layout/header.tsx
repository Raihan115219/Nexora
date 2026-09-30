"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Bell, ChevronDown, Menu, Search, Wallet as WalletIcon } from "lucide-react";
import { adminNav, userNav } from "@/config/navigation";
import { logout } from "@/lib/auth";
import { getUserTransactions, getWallet } from "@/lib/wallet";
import { cn, formatDateTime, shortAddress } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import { useDb, useCurrentUser } from "@/store/hooks";

function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return { open, setOpen, ref };
}

function Popover({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "surface-card absolute top-[calc(100%+8px)] right-0 z-40 w-72 animate-slide-up border-line-2 bg-surface-2 p-2 shadow-2xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

function GlobalSearch() {
  const router = useRouter();
  const user = useCurrentUser();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const items = useMemo(() => (user?.role === "admin" ? [...userNav, ...adminNav] : userNav), [user?.role]);
  const results = useMemo(
    () => (query.trim() ? items.filter((i) => i.label.toLowerCase().includes(query.trim().toLowerCase())) : []),
    [items, query],
  );

  function go(href: string) {
    setQuery("");
    setFocused(false);
    router.push(href);
  }

  return (
    <div className="relative hidden w-full max-w-sm md:block">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (results[0]) go(results[0].href);
        }}
        className="field-pill"
      >
        <Search className="size-4 text-dim" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          placeholder="Search pages…"
          aria-label="Search pages"
          
        />
      </form>
      {focused && query.trim() && (
        <div className="surface-card absolute top-[calc(100%+8px)] z-40 w-full animate-slide-up border-line-2 bg-surface-2 p-1.5 shadow-2xl">
          {results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-secondary">No matches</p>
          ) : (
            results.map((r) => (
              <button
                key={r.href}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(r.href)}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-secondary hover:bg-surface-3 hover:text-fg"
              >
                <r.icon className="size-4 text-primary" aria-hidden />
                {r.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function NotificationsMenu() {
  const db = useDb();
  const user = useCurrentUser();
  const { open, setOpen, ref } = usePopover();
  const recent = useMemo(() => (user ? getUserTransactions(db, user.id).slice(0, 4) : []), [db, user]);
  const pending = recent.filter((t) => t.status === "Pending").length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label={`Notifications${pending ? `, ${pending} pending` : ""}`}
        aria-expanded={open}
        className="relative grid size-11 place-items-center rounded-full border border-line-2 bg-surface/60 text-fg transition-colors hover:border-primary/50 hover:text-primary"
      >
        <Bell className="size-[18px]" aria-hidden />
        {pending > 0 && (
          <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-on-primary">
            {pending}
          </span>
        )}
      </button>
      {open && (
        <Popover>
          <p className="px-3 py-2 text-xs font-medium tracking-wider text-dim uppercase">Recent activity</p>
          {recent.length === 0 && <p className="px-3 py-3 text-sm text-secondary">Nothing yet.</p>}
          {recent.map((t) => (
            <div key={t.id} className="rounded-xl px-3 py-2 hover:bg-surface-3">
              <p className="text-sm text-fg">{t.description}</p>
              <p className="text-xs text-secondary">
                {t.status} · {formatDateTime(t.date)}
              </p>
            </div>
          ))}
          <Link
            href="/dashboard/transactions"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-xl px-3 py-2 text-center text-sm text-primary hover:bg-surface-3"
          >
            View all transactions
          </Link>
        </Popover>
      )}
    </div>
  );
}

function UserMenu() {
  const user = useCurrentUser();
  const router = useRouter();
  const { open, setOpen, ref } = usePopover();
  if (!user) return null;
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-11 items-center gap-2 rounded-full border border-line-2 bg-surface/60 pr-3 pl-1 transition-colors hover:border-primary/50"
      >
        <Avatar name={user.name} size={34} />
        <span className="hidden max-w-28 truncate text-sm font-medium lg:block">{user.name}</span>
        <ChevronDown className="hidden size-4 text-dim lg:block" aria-hidden />
      </button>
      {open && (
        <Popover className="w-56">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-secondary">{user.email}</p>
          </div>
          <Link
            href="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm text-secondary hover:bg-surface-3 hover:text-fg"
          >
            Settings
          </Link>
          <button
            onClick={async () => {
              await logout();
              router.replace("/login");
            }}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm text-secondary hover:bg-surface-3 hover:text-danger"
          >
            Log out
          </button>
        </Popover>
      )}
    </div>
  );
}

export function Header({ onMenu }: { onMenu: () => void }) {
  const db = useDb();
  const user = useCurrentUser();
  const address = user ? getWallet(db, user.id)?.address : undefined;

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={onMenu}
        aria-label="Open navigation"
        className="grid size-11 place-items-center rounded-full border border-line-2 text-fg lg:hidden"
      >
        <Menu className="size-5" aria-hidden />
      </button>
      <Link href="/dashboard" aria-label="Nexora home" className="lg:w-44 2xl:w-52">
        <Logo />
      </Link>
      <div className="flex flex-1 justify-center lg:justify-start">
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-2.5">
        {address && (
          <span className="hidden h-11 items-center gap-2 rounded-full border border-line-2 bg-surface/60 px-4 text-sm text-secondary sm:flex">
            <WalletIcon className="size-4 text-primary" aria-hidden />
            <span className="num">{shortAddress(address)}</span>
          </span>
        )}
        <NotificationsMenu />
        <UserMenu />
      </div>
    </header>
  );
}
