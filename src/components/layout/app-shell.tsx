"use client";

import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <div className="min-h-dvh">
      <Header onMenu={() => setDrawerOpen(true)} />
      <div className="flex">
        <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-[80px] shrink-0 2xl:w-[264px] border-r border-line lg:block">
          <Sidebar />
        </aside>
        <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1500px] animate-fade-in">{children}</div>
        </main>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-black/70" onClick={() => setDrawerOpen(false)} aria-hidden />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] animate-slide-up flex-col border-r border-line bg-bg-2"
          >
            <div className="flex h-[72px] items-center justify-between px-5">
              <Logo />
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
                className="grid size-9 place-items-center rounded-full border border-line-2 text-secondary"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <Sidebar expanded onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
