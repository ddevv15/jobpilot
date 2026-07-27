import { type JSX } from "react";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { NavLinks } from "@/components/layout/NavLinks";
import { NavbarCTA } from "@/components/layout/NavbarCTA";

type Props = {
  variant?: "marketing" | "app";
};

export function Navbar({ variant = "marketing" }: Props): JSX.Element {
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

        <NavLinks />

        {variant === "marketing" && <NavbarCTA />}
      </div>
    </header>
  );
}
