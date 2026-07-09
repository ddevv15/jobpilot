import Link from "next/link";
import { LayoutGrid } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Find Jobs", href: "/find-jobs" },
  { label: "Profile", href: "/profile" },
];

export function Navbar() {
  return (
    <header className="h-16 w-full border-b border-border bg-surface">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-logo-gradient">
            <LayoutGrid className="h-5 w-5 text-accent-foreground" />
          </span>
          <span className="text-[19px] leading-7 font-bold text-text-darkest">
            JobPilot
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-text-dark transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/login"
          className="rounded-md bg-text-darker px-4 py-2 text-sm font-medium text-accent-foreground"
        >
          Start for free
        </Link>
      </div>
    </header>
  );
}
