"use client";

import { useEffect, type ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { useAppStore } from "@/store/app-store";

export function Providers({ children }: { children: ReactNode }) {
  const hydrate = useAppStore((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  return <ToastProvider>{children}</ToastProvider>;
}
