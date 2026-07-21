import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createInsforgeServer } from "@/lib/insforge-server";
import { signOutUser } from "@/actions/auth";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function DashboardPage() {
  const insforge = await createInsforgeServer();

  let userEmail: string | undefined;
  try {
    const { data } = await insforge.auth.getCurrentUser();
    userEmail = data.user?.email;
  } catch (error) {
    console.error("[dashboard/page]", error);
  }

  if (!userEmail) redirect("/login");

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-center shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />

        <h1 className="mt-4 text-2xl font-bold text-text-primary">
          You&apos;re signed in
        </h1>
        <p className="mt-2 text-sm text-text-secondary">{userEmail}</p>

        <p className="mt-6 text-xs text-text-muted">
          The full dashboard (stats, recent activity, charts) is Phase 5 and
          hasn&apos;t been built yet — this placeholder just confirms the
          sign-in round trip works end to end.
        </p>

        <form action={signOutUser} className="mt-6">
          <SignOutButton />
        </form>
      </div>
    </main>
  );
}
