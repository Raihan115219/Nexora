"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { adminEntry, adminNav, settingsEntry, userNav, type NavItem } from "@/config/navigation";
import { AUTH_ENABLED } from "@/config/site";
import { logout } from "@/lib/auth";
import { cn } from "@/lib/utils/format";
import { useCurrentUser } from "@/store/hooks";

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavLink({
  item,
  pathname,
  onNavigate,
  labels,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
  labels: string;
}) {
  const active = isActive(pathname, item);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={item.label}
      className={cn(
        "group flex items-center gap-3 rounded-full py-1.5 pl-1.5 text-sm font-medium transition-all duration-200 ease-out",
        labels === "" ? "pr-4" : "justify-center pr-1.5 2xl:justify-start 2xl:pr-4",
        active ? "2xl:bg-surface-3/80 text-fg" : "text-secondary hover:bg-surface-2 hover:text-fg",
        labels === "" && active && "bg-surface-3/80",
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-full border transition-all duration-200 ease-out",
          active
            ? "border-primary bg-primary text-on-primary shadow-glow"
            : "border-line-2 text-secondary group-hover:border-primary/40 group-hover:text-primary",
        )}
      >
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <span className={labels}>{item.label}</span>
    </Link>
  );
}

/**
 * Icon rail (like the reference) below 2xl, labelled sidebar above.
 * `expanded` forces labels — used by the mobile drawer.
 */
export function Sidebar({ onNavigate, expanded = false }: { onNavigate?: () => void; expanded?: boolean }) {
  const labels = expanded ? "" : "hidden 2xl:inline";
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();
  const inAdmin = pathname.startsWith("/admin");
  const items = inAdmin ? adminNav : userNav;

  async function handleLogout() {
    await logout();
    onNavigate?.();
    router.replace("/login");
  }

  return (
    <nav aria-label="Primary" className="flex h-full flex-col gap-1 overflow-y-auto p-3 2xl:p-4">
      {inAdmin && (
        <p className={cn("px-3 pb-2 text-[11px] font-medium tracking-wider text-dim uppercase", labels)}>Admin panel</p>
      )}
      {items.map((item) => (
        <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} labels={labels} />
      ))}

      <div className="mt-auto flex flex-col gap-1 pt-6">
        <div className="mx-2 mb-2 h-px bg-line 2xl:mx-3" />
        {user?.role === "admin" && (
          <NavLink
            item={inAdmin ? { href: "/dashboard", label: "User view", icon: userNav[0].icon, exact: true } : adminEntry}
            pathname={pathname}
            onNavigate={onNavigate}
            labels={labels}
          />
        )}
        <NavLink item={settingsEntry} pathname={pathname} onNavigate={onNavigate} labels={labels} />
        {AUTH_ENABLED && (
        <button
          onClick={handleLogout}
          title="Logout"
          className={cn(
            "group flex items-center gap-3 rounded-full py-1.5 pl-1.5 text-sm font-medium text-secondary transition-all duration-200 ease-out hover:bg-surface-2 hover:text-fg",
            expanded ? "pr-4" : "justify-center pr-1.5 2xl:justify-start 2xl:pr-4",
          )}
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line-2 group-hover:border-danger/50 group-hover:text-danger">
            <LogOut className="size-[18px]" aria-hidden />
          </span>
          <span className={labels}>Logout</span>
        </button>
        )}
      </div>
    </nav>
  );
}
