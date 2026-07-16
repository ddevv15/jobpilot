import { redirect } from "next/navigation";
import { ShieldCheck, Globe, GitFork } from "lucide-react";
import { createInsforgeServer } from "@/lib/insforge-server";
import { initiateOAuth } from "@/actions/auth";

const ERROR_MESSAGES: Record<string, string> = {
  oauth_init_failed: "Could not start sign in. Please try again.",
  oauth_failed: "Sign in was cancelled or failed. Please try again.",
  missing_verifier: "Your sign in session expired. Please try again.",
  exchange_failed: "Could not complete sign in. Please try again.",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();
  if (data.user) redirect("/dashboard");

  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 lg:p-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-2xl border border-border bg-surface shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] lg:grid-cols-2">
        <div className="relative hidden flex-col justify-center bg-hero-gradient px-16 py-16 lg:flex">
          <span className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            OAuth secured by InsForge
          </span>

          <h1 className="max-w-lg text-4xl font-bold text-text-primary md:text-5xl">
            Sign in and let the agent prep your next application.
          </h1>

          <p className="mt-6 max-w-md text-base text-text-secondary">
            Connect with Google or GitHub to start building your profile,
            matching jobs, and creating tailored application materials.
          </p>

          <p className="mt-10 text-xs text-text-muted">
            New users are routed to profile setup after sign-in.
          </p>
        </div>

        <div className="flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-sm">
            <p className="text-sm text-text-secondary">Welcome to</p>
            <h2 className="mt-1 text-3xl font-bold text-text-primary">
              JobPilot
            </h2>
            <p className="mt-3 text-sm text-text-secondary">
              Choose your preferred provider to continue.
            </p>

            {errorMessage ? (
              <p className="mt-6 rounded-md bg-accent-muted px-3 py-2 text-xs text-text-secondary">
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-8 flex flex-col gap-3">
              <form action={initiateOAuth.bind(null, "google")}>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
                >
                  <Globe className="h-4 w-4 text-accent" />
                  Continue with Google
                </button>
              </form>
              <form action={initiateOAuth.bind(null, "github")}>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
                >
                  <GitFork className="h-4 w-4 text-accent" />
                  Continue with GitHub
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
