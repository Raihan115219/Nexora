"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useCurrentUser, useHydrated } from "@/store/hooks";

/** Redirects to /login when there is no session. */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const user = useCurrentUser();

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, user, router]);

  if (!hydrated || !user) {
    return (
      <div className="p-6">
        <PageSkeleton />
      </div>
    );
  }
  return <>{children}</>;
}

/** Mock role protection for /admin/*. A real backend must enforce this server-side. */
export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useCurrentUser();
  if (user?.role !== "admin") {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Admin access required"
        description="Your account does not have permission to view this area."
        action={<Button onClick={() => router.replace("/dashboard")}>Back to dashboard</Button>}
      />
    );
  }
  return <>{children}</>;
}
