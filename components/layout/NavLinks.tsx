"use client";

import { type JSX } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Find Jobs", href: "/find-jobs" },
  { label: "Profile", href: "/profile" },
];

export function NavLinks(): JSX.Element {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-8 md:flex">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              isActive
                ? "border-b-2 border-accent pb-0.5 text-sm font-medium text-accent"
                : "text-sm font-medium text-text-dark transition-colors hover:text-accent"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
