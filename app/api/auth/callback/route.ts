import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createAuthActions } from "@insforge/sdk/ssr";
import { getPostHogClient } from "@/lib/posthog-server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("insforge_code");
  const oauthError = request.nextUrl.searchParams.get("error");

  if (oauthError || !code) {
    console.error("[api/auth/callback]", oauthError ?? "missing insforge_code");
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: "anonymous",
      event: "sign_in_failed",
      properties: { reason: "oauth_failed", oauth_error: oauthError },
    });
    await posthog.flush();
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get("insforge_code_verifier")?.value;
  if (!codeVerifier) {
    console.error("[api/auth/callback]", "missing code verifier cookie");
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: "anonymous",
      event: "sign_in_failed",
      properties: { reason: "missing_verifier" },
    });
    await posthog.flush();
    return NextResponse.redirect(new URL("/login?error=missing_verifier", request.url));
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  const auth = createAuthActions({
    requestCookies: request.cookies,
    responseCookies: response.cookies,
  });

  // createAuthActions() strips accessToken/refreshToken from the returned data
  // (they're written straight to cookies) — check data.user for success instead.
  const { data, error } = await auth.exchangeOAuthCode(code, codeVerifier);
  if (error || !data?.user) {
    console.error("[api/auth/callback]", error);
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: "anonymous",
      event: "sign_in_failed",
      properties: { reason: "exchange_failed" },
    });
    if (error) posthog.captureException(error, "anonymous", { reason: "exchange_failed" });
    await posthog.flush();
    return NextResponse.redirect(new URL("/login?error=exchange_failed", request.url));
  }

  response.cookies.delete("insforge_code_verifier");

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: data.user.id,
    event: "user_signed_in",
  });
  posthog.identify({
    distinctId: data.user.id,
    properties: {
      email: data.user.email,
    },
  });
  await posthog.flush();

  return response;
}
