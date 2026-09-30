import { AppShell } from "@/components/layout/app-shell";
import { AdminGuard, AuthGuard } from "@/components/layout/guards";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>
        <AdminGuard>{children}</AdminGuard>
      </AppShell>
    </AuthGuard>
  );
}
