"use client";

import Link from "next/link";
import posthog from "posthog-js";

export function NavbarCTA() {
  return (
    <Link
      href="/login"
      className="rounded-md bg-text-darker px-4 py-2 text-sm font-medium text-accent-foreground"
      onClick={() => posthog.capture("navbar_cta_clicked")}
    >
      Start for free
    </Link>
  );
}
