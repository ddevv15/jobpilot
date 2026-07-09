import Link from "next/link";
import { LayoutGrid } from "lucide-react";

const footerLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Condition", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-surface">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-logo-gradient">
            <LayoutGrid className="h-5 w-5 text-accent-foreground" />
          </span>
          <span className="text-[19px] leading-7 font-bold text-text-darkest">
            JobPilot
          </span>
        </Link>

        <nav className="flex items-center gap-8">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
