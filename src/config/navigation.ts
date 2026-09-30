import {
  ArrowLeftRight,
  GitBranch,
  LayoutDashboard,
  Network,
  Package,
  Settings,
  Share2,
  Shield,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };

export const userNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/packages", label: "Packages", icon: Package },
  { href: "/dashboard/referrals", label: "Referrals", icon: Share2 },
  { href: "/dashboard/binary-tree", label: "Binary Tree", icon: GitBranch },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight },
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/packages", label: "Packages", icon: Package },
  { href: "/admin/tree", label: "Binary Tree", icon: Network },
  { href: "/admin/transactions", label: "Transactions", icon: ArrowLeftRight },
];

export const adminEntry: NavItem = { href: "/admin", label: "Admin", icon: Shield };
export const settingsEntry: NavItem = { href: "/dashboard/settings", label: "Settings", icon: Settings };
