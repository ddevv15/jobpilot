"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthActions, createServerClient } from "@insforge/sdk/ssr";
import { getPostHogClient } from "@/lib/posthog-server";

type OAuthProvider = "google" | "github";

// redirect() throws internally (Next.js control flow) — never wrap it in try/catch,
// so this deliberately skips the { success, error } Server Action convention.
export async function initiateOAuth(provider: OAuthProvider) {
  const cookieStore = await cookies();
  const auth = createAuthActions({ cookies: cookieStore });

  const { data, error } = await auth.signInWithOAuth(provider, {
    redirectTo: new URL(
      "/api/auth/callback",
      process.env.NEXT_PUBLIC_APP_URL,
    ).toString(),
    skipBrowserRedirect: true,
  });

  if (error || !data?.url || !data.codeVerifier) {
    console.error("[actions/auth]", error);
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: "anonymous",
      event: "oauth_init_failed",
      properties: { provider },
    });
    if (error) posthog.captureException(error, "anonymous", { provider });
    await posthog.flush();
    redirect("/login?error=oauth_init_failed");
  }

  cookieStore.set("insforge_code_verifier", data.codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: "anonymous",
    event: "oauth_initiated",
    properties: { provider },
  });
  await posthog.flush();

  redirect(data.url);
}

// redirect() throws internally — see comment on initiateOAuth above.
export async function signOutUser() {
  const cookieStore = await cookies();
  const auth = createAuthActions({ cookies: cookieStore });
  const insforge = createServerClient({ cookies: cookieStore });
  const { data } = await insforge.auth.getCurrentUser();

  const { error } = await auth.signOut();
  const posthog = getPostHogClient();

  if (error) {
    console.error("[actions/auth]", error);
    posthog.captureException(error, data.user?.id ?? "anonymous");
    await posthog.flush();
    redirect("/login?error=sign_out_failed");
  }

  posthog.capture({
    distinctId: data.user?.id ?? "anonymous",
    event: "user_signed_out",
  });
  await posthog.flush();

  redirect("/login");
}
