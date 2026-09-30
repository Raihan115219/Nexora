import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Link href="/" aria-label="Nexora home" className="mb-8">
        <Logo />
      </Link>
      <div className="surface-card w-full max-w-[440px] animate-slide-up p-6 shadow-[0_30px_80px_-30px_rgba(57,255,90,0.15)] sm:p-8">
        {children}
      </div>
    </div>
  );
}
