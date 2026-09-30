"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, UserX } from "lucide-react";
import { AUTH_ENABLED, DEMO_ACCOUNTS } from "@/config/site";
import { login } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { useCurrentUser, useHydrated } from "@/store/hooks";

/**
 * Requires a session. With auth enabled it redirects to /login; while auth is
 * hidden (AUTH_ENABLED=false) it signs in the demo member automatically.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const resetDemo = useAppStore((s) => s.resetDemo);
  const attempted = useRef(false);
  const [autoLoginFailed, setAutoLoginFailed] = useState(false);

  useEffect(() => {
    if (user) {
      attempted.current = false; // allow a fresh auto sign-in after a later sign-out/reset
      return;
    }
    if (!hydrated) return;
    if (AUTH_ENABLED) {
      router.replace("/login");
      return;
    }
    if (attempted.current) return;
    attempted.current = true;
    void login(DEMO_ACCOUNTS.user).then((result) => {
      if (!result.ok) setAutoLoginFailed(true);
    });
  }, [hydrated, user, router]);

  if (autoLoginFailed && !user) {
    return (
      <EmptyState
        icon={UserX}
        title="Demo account unavailable"
        description="The saved demo data no longer contains the demo member. Reset it to continue."
        action={
          <Button
            onClick={async () => {
              await resetDemo();
              const result = await login(DEMO_ACCOUNTS.user);
              setAutoLoginFailed(!result.ok);
            }}
          >
            Reset demo data
          </Button>
        }
      />
    );
  }

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
