"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import posthog from "posthog-js";

export function CTAButtons() {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <Link
        href="/login"
        className="flex items-center gap-2 rounded-md bg-text-darker px-4 py-2 text-sm font-medium text-accent-foreground"
        onClick={() => posthog.capture("cta_clicked", { button_label: "Get Started" })}
      >
        Get Started
        <Play className="h-3.5 w-3.5 fill-current" />
      </Link>
      <Link
        href="/login"
        className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary"
        onClick={() => posthog.capture("cta_clicked", { button_label: "Find Your First Match" })}
      >
        Find Your First Match
      </Link>
    </div>
  );
}
