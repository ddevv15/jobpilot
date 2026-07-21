"use client";

import posthog from "posthog-js";

export function SignOutButton() {
  return (
    <button
      type="submit"
      onClick={() => posthog.reset()}
      className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
    >
      Sign out
    </button>
  );
}
