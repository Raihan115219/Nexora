import Link from "next/link";
import { ArrowRight, GitBranch, ShieldCheck, Wallet } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/ui/logo";
import { EthHero } from "@/components/three/eth-hero";

const SHOWCASE_ASSETS = [
  { symbol: "USDT", label: "Stable" },
  { symbol: "PLT", label: "Platform" },
  { symbol: "ERN", label: "Earned" },
];

const FEATURES = [
  { icon: Wallet, title: "Unified wallet", text: "Deposits, tokens and locked balances in one clear view." },
  { icon: GitBranch, title: "Live binary network", text: "Referrals and left/right placement, always in sync." },
  { icon: ShieldCheck, title: "Founder packages", text: "F1, F2 and F3 tiers configured as data, not code." },
];

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-200px] left-1/2 size-[720px] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-[120px]"
      />
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6">
        <Logo />
        <nav className="flex items-center gap-2" aria-label="Account">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-secondary transition-colors hover:text-fg"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-on-primary transition-all duration-200 hover:bg-primary-2 hover:shadow-glow"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 pb-16">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_420px] xl:gap-16">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface/60 px-3.5 py-1.5 text-xs text-secondary">
              <span className="size-1.5 rounded-full bg-primary shadow-glow" aria-hidden /> Phase 1 demo
            </p>
            <h1 className="text-[56px] leading-[1.02] font-semibold tracking-tight sm:text-[80px] xl:text-[88px]">
              Build.
              <br />
              Connect.
              <br />
              <span className="text-primary">Earn.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-secondary">{siteConfig.tagline}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-[15px] font-semibold text-on-primary transition-all duration-200 hover:bg-primary-2 hover:shadow-glow"
              >
                Get Started <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center rounded-full border border-line-2 bg-surface-3 px-7 text-[15px] font-medium text-fg transition-colors hover:border-primary/50 hover:text-primary"
              >
                Sign In
              </Link>
            </div>
          </div>

          <aside
            aria-label="Wallet preview"
            className="surface-card relative mx-auto w-full max-w-[420px] overflow-hidden p-6 shadow-[0_40px_120px_-40px_rgba(57,255,90,0.25)]"
          >
            <div className="flex items-center justify-between text-xs text-secondary">
              <span className="rounded-full border border-line-2 bg-surface/60 px-3 py-1.5">0xf07a…8336</span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden /> Live network
              </span>
            </div>
            <EthHero className="mx-auto mt-2 h-64 w-full sm:h-72" />
            <p className="text-center text-xs font-medium tracking-wider text-secondary uppercase">
              One wallet, every asset
            </p>
            <p className="mt-2 text-center text-[32px] leading-none font-semibold tracking-tight">
              Multi-asset <span className="text-secondary/80">vault</span>
            </p>
            <ul className="mt-6 grid grid-cols-3 gap-2">
              {SHOWCASE_ASSETS.map((a) => (
                <li key={a.symbol} className="surface-tile px-3 py-2.5 text-center">
                  <p className="text-sm font-semibold text-fg">{a.symbol}</p>
                  <p className="text-[11px] text-dim">{a.label}</p>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <ul className="mt-16 grid gap-4 sm:grid-cols-3 lg:mt-20">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="surface-card p-5">
              <span className="mb-4 grid size-10 place-items-center rounded-full border border-line-2 bg-surface-3 text-primary">
                <Icon className="size-[18px]" aria-hidden />
              </span>
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-secondary">{text}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
