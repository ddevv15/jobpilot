"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@insforge/sdk";
import { createAuthActions, createServerClient } from "@insforge/sdk/ssr";
import { getPostHogClient } from "@/lib/posthog-server";

type OAuthProvider = "google" | "github";

// Structured result for the on-page email/password flows. Terminal-success
// actions (verify, sign-in) redirect server-side and never resolve to this;
// mid-flow actions return it so the client can advance its mode and show copy.
export type AuthResult = {
  ok: boolean;
  error?: string;
  next?: "verify" | "reset" | "signin";
  email?: string;
};

const GENERIC_ERROR = "Something went wrong. Please try again.";

// Verification-resend and password-reset are stateless email/token operations
// that never establish a session, so they use the base public client rather than
// createAuthActions() (the SSR cookie writer, which doesn't expose them anyway).
function getPublicAuthClient() {
  return createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
  });
}

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

// Sign up creates the account; email verification is required by config, so this
// returns { next: "verify" } rather than establishing a session. No redirect.
export async function signUpWithPassword(
  email: string,
  password: string,
  name: string,
): Promise<AuthResult> {
  const cookieStore = await cookies();
  const auth = createAuthActions({ cookies: cookieStore });
  const posthog = getPostHogClient();

  posthog.capture({ distinctId: "anonymous", event: "sign_up_started" });

  try {
    const { data, error } = await auth.signUp({ email, password, name });

    // Verification is required by config, so a successful signup returns
    // requireEmailVerification with NO user/session — only an error means failure.
    if (error || !data) {
      const emailTaken = error?.statusCode === 409;
      posthog.capture({
        distinctId: "anonymous",
        event: "sign_up_failed",
        properties: { reason: emailTaken ? "email_taken" : "signup_failed" },
      });
      await posthog.flush();
      return {
        ok: false,
        error: emailTaken
          ? "That email is already registered. Try signing in instead."
          : "Could not create your account. Check your details and try again.",
      };
    }

    if (data.requireEmailVerification) {
      posthog.capture({
        distinctId: "anonymous",
        event: "email_verification_sent",
        properties: { context: "sign_up" },
      });
      await posthog.flush();
      return { ok: true, next: "verify", email };
    }

    // Fallback: verification disabled — session established at signup.
    if (data.user) {
      posthog.capture({
        distinctId: data.user.id,
        event: "user_signed_in",
        properties: { method: "password" },
      });
      posthog.identify({
        distinctId: data.user.id,
        properties: { email: data.user.email },
      });
      await posthog.flush();
    } else {
      await posthog.flush();
      return { ok: false, error: GENERIC_ERROR };
    }
  } catch (err) {
    console.error("[actions/auth]", err);
    posthog.captureException(err, "anonymous");
    await posthog.flush();
    return { ok: false, error: GENERIC_ERROR };
  }

  redirect("/dashboard");
}

// verifyEmail() saves the session on success, so this signs the user in and
// redirects — email_verified is the account-activation + first-session signal.
export async function verifyEmailCode(
  email: string,
  otp: string,
): Promise<AuthResult> {
  const cookieStore = await cookies();
  const auth = createAuthActions({ cookies: cookieStore });
  const posthog = getPostHogClient();

  try {
    const { data, error } = await auth.verifyEmail({ email, otp });

    if (error || !data?.user) {
      await posthog.flush();
      return { ok: false, error: "That code is invalid or has expired." };
    }

    posthog.capture({ distinctId: data.user.id, event: "email_verified" });
    posthog.identify({
      distinctId: data.user.id,
      properties: { email: data.user.email },
    });
    await posthog.flush();
  } catch (err) {
    console.error("[actions/auth]", err);
    posthog.captureException(err, "anonymous");
    await posthog.flush();
    return { ok: false, error: GENERIC_ERROR };
  }

  redirect("/dashboard");
}

export async function resendVerificationCode(email: string): Promise<AuthResult> {
  const insforge = getPublicAuthClient();
  const posthog = getPostHogClient();

  try {
    const { error } = await insforge.auth.resendVerificationEmail({ email });

    if (error) {
      // Backend rate-limits resends (min_interval_seconds); 429 is expected.
      await posthog.flush();
      return {
        ok: false,
        error:
          error.statusCode === 429
            ? "Please wait a moment before requesting another code."
            : "Could not resend the code. Please try again.",
      };
    }

    posthog.capture({
      distinctId: "anonymous",
      event: "email_verification_sent",
      properties: { context: "resend" },
    });
    await posthog.flush();
    return { ok: true };
  } catch (err) {
    console.error("[actions/auth]", err);
    posthog.captureException(err, "anonymous");
    await posthog.flush();
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthResult> {
  const cookieStore = await cookies();
  const auth = createAuthActions({ cookies: cookieStore });
  const posthog = getPostHogClient();

  try {
    const { data, error } = await auth.signInWithPassword({ email, password });

    if (error || !data?.user) {
      const notVerified = error?.statusCode === 403;
      posthog.capture({
        distinctId: "anonymous",
        event: "sign_in_failed",
        properties: {
          method: "password",
          reason: notVerified ? "email_not_verified" : "invalid_credentials",
        },
      });
      await posthog.flush();
      return notVerified
        ? {
            ok: false,
            error: "Verify your email to finish signing in.",
            next: "verify",
            email,
          }
        : { ok: false, error: "Incorrect email or password." };
    }

    posthog.capture({
      distinctId: data.user.id,
      event: "user_signed_in",
      properties: { method: "password" },
    });
    posthog.identify({
      distinctId: data.user.id,
      properties: { email: data.user.email },
    });
    await posthog.flush();
  } catch (err) {
    console.error("[actions/auth]", err);
    posthog.captureException(err, "anonymous", { method: "password" });
    await posthog.flush();
    return { ok: false, error: GENERIC_ERROR };
  }

  redirect("/dashboard");
}

// Always reports success to the client to avoid revealing whether an email is
// registered. reset_password_method is "code", so no redirectTo is needed.
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const insforge = getPublicAuthClient();
  const posthog = getPostHogClient();

  posthog.capture({ distinctId: "anonymous", event: "password_reset_requested" });

  try {
    await insforge.auth.sendResetPasswordEmail({ email });
  } catch (err) {
    console.error("[actions/auth]", err);
    posthog.captureException(err, "anonymous");
  }

  await posthog.flush();
  return { ok: true, next: "reset", email };
}

export async function confirmPasswordReset(
  email: string,
  code: string,
  newPassword: string,
): Promise<AuthResult> {
  const insforge = getPublicAuthClient();
  const posthog = getPostHogClient();

  try {
    const { data, error } = await insforge.auth.exchangeResetPasswordToken({
      email,
      code,
    });
    if (error || !data?.token) {
      await posthog.flush();
      return { ok: false, error: "That code is invalid or has expired." };
    }

    const { error: resetError } = await insforge.auth.resetPassword({
      newPassword,
      otp: data.token,
    });
    if (resetError) {
      await posthog.flush();
      return {
        ok: false,
        error: "Could not update your password. Please try again.",
      };
    }

    posthog.capture({ distinctId: "anonymous", event: "password_reset_completed" });
    await posthog.flush();
    return { ok: true, next: "signin" };
  } catch (err) {
    console.error("[actions/auth]", err);
    posthog.captureException(err, "anonymous");
    await posthog.flush();
    return { ok: false, error: GENERIC_ERROR };
  }
}
