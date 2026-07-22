"use client";

import { useState, useTransition } from "react";
import { Check, Globe, GitFork, Loader2 } from "lucide-react";
import {
  initiateOAuth,
  signUpWithPassword,
  verifyEmailCode,
  resendVerificationCode,
  signInWithPassword,
  requestPasswordReset,
  confirmPasswordReset,
  type AuthResult,
} from "@/actions/auth";

type Mode = "signin" | "signup" | "verify" | "forgot" | "reset";

type Props = {
  initialError?: string;
};

const PASSWORD_RULES: { label: string; test: (p: string) => boolean }[] = [
  { label: "At least 12 characters", test: (p) => p.length >= 12 },
  { label: "An uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "A lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "A number", test: (p) => /[0-9]/.test(p) },
  { label: "A special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const passwordIsStrong = (p: string): boolean =>
  PASSWORD_RULES.every((rule) => rule.test(p));

const HEADINGS: Record<Mode, { title: string; subtitle: string }> = {
  signin: { title: "Welcome back", subtitle: "Sign in to continue to JobPilot." },
  signup: { title: "Create your account", subtitle: "Start finding jobs matched to your profile." },
  verify: { title: "Verify your email", subtitle: "Enter the 6-digit code we sent you." },
  forgot: { title: "Reset your password", subtitle: "We'll email you a 6-digit code." },
  reset: { title: "Set a new password", subtitle: "Enter the code and choose a new password." },
};

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

const labelClass = "mb-1.5 block text-xs font-medium text-text-secondary";

export function AuthPanel({ initialError }: Props) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | undefined>(initialError);
  const [notice, setNotice] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const switchMode = (next: Mode): void => {
    setMode(next);
    setError(undefined);
    setNotice(undefined);
    setPassword("");
    setConfirmPassword("");
    setCode("");
  };

  const apply = (result: AuthResult | undefined, onOk?: () => void): void => {
    // Redirecting actions never resolve here on success — a result means the
    // action stayed on the page, so surface its error or advance the mode.
    if (!result) return;
    if (!result.ok) {
      setError(result.error);
      if (result.next) switchMode(result.next);
      if (result.next === "verify" && result.email) setEmail(result.email);
      return;
    }
    setError(undefined);
    if (result.next) switchMode(result.next);
    onOk?.();
  };

  const handleSignIn = (e: React.FormEvent): void => {
    e.preventDefault();
    setError(undefined);
    startTransition(async () => {
      apply(await signInWithPassword(email, password));
    });
  };

  const handleSignUp = (e: React.FormEvent): void => {
    e.preventDefault();
    setError(undefined);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!passwordIsStrong(password)) {
      setError("Your password doesn't meet all the requirements below.");
      return;
    }
    startTransition(async () => {
      apply(await signUpWithPassword(email, password, name), () =>
        setNotice(`We sent a 6-digit code to ${email}.`),
      );
    });
  };

  const handleVerify = (e: React.FormEvent): void => {
    e.preventDefault();
    setError(undefined);
    startTransition(async () => {
      apply(await verifyEmailCode(email, code));
    });
  };

  const handleResend = (): void => {
    setError(undefined);
    setNotice(undefined);
    startTransition(async () => {
      const result = await resendVerificationCode(email);
      if (result.ok) setNotice(`A new code is on its way to ${email}.`);
      else setError(result.error);
    });
  };

  const handleForgot = (e: React.FormEvent): void => {
    e.preventDefault();
    setError(undefined);
    startTransition(async () => {
      apply(await requestPasswordReset(email), () =>
        setNotice(`If an account exists for ${email}, a code is on its way.`),
      );
    });
  };

  const handleReset = (e: React.FormEvent): void => {
    e.preventDefault();
    setError(undefined);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!passwordIsStrong(password)) {
      setError("Your password doesn't meet all the requirements below.");
      return;
    }
    startTransition(async () => {
      apply(await confirmPasswordReset(email, code, password), () =>
        setNotice("Password updated. Sign in with your new password."),
      );
    });
  };

  const heading = HEADINGS[mode];

  return (
    <div className="w-full max-w-sm">
      <p className="text-sm text-text-secondary">Welcome to</p>
      <h2 className="mt-1 text-3xl font-bold text-text-primary">JobPilot</h2>
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-text-primary">{heading.title}</h3>
        <p className="mt-1 text-sm text-text-secondary">{heading.subtitle}</p>
      </div>

      {error ? (
        <p className="mt-5 rounded-md border border-border bg-surface-secondary px-3 py-2 text-xs text-error">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="mt-5 rounded-md bg-success-lightest px-3 py-2 text-xs text-success-foreground">
          {notice}
        </p>
      ) : null}

      {mode === "signin" ? (
        <form onSubmit={handleSignIn} className="mt-6 flex flex-col gap-3">
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••••••"
            />
          </div>
          <button
            type="button"
            onClick={() => switchMode("forgot")}
            className="-mt-1 self-end text-xs font-medium text-accent hover:underline"
          >
            Forgot password?
          </button>
          <SubmitButton isPending={isPending} label="Sign in" />
        </form>
      ) : null}

      {mode === "signup" ? (
        <form onSubmit={handleSignUp} className="mt-6 flex flex-col gap-3">
          <div>
            <label htmlFor="name" className={labelClass}>
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Ada Lovelace"
            />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Create a strong password"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className={labelClass}>
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              placeholder="Re-enter your password"
            />
          </div>
          <PasswordChecklist password={password} />
          <SubmitButton isPending={isPending} label="Create account" />
        </form>
      ) : null}

      {mode === "verify" ? (
        <form onSubmit={handleVerify} className="mt-6 flex flex-col gap-3">
          <div>
            <label htmlFor="code" className={labelClass}>
              6-digit code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className={`${inputClass} tracking-[0.5em]`}
              placeholder="000000"
            />
          </div>
          <SubmitButton isPending={isPending} label="Verify and continue" />
          <button
            type="button"
            onClick={handleResend}
            disabled={isPending}
            className="text-xs font-medium text-accent hover:underline disabled:opacity-50"
          >
            Resend code
          </button>
        </form>
      ) : null}

      {mode === "forgot" ? (
        <form onSubmit={handleForgot} className="mt-6 flex flex-col gap-3">
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>
          <SubmitButton isPending={isPending} label="Send reset code" />
        </form>
      ) : null}

      {mode === "reset" ? (
        <form onSubmit={handleReset} className="mt-6 flex flex-col gap-3">
          <div>
            <label htmlFor="code" className={labelClass}>
              6-digit code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className={`${inputClass} tracking-[0.5em]`}
              placeholder="000000"
            />
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Create a strong password"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className={labelClass}>
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              placeholder="Re-enter your password"
            />
          </div>
          <PasswordChecklist password={password} />
          <SubmitButton isPending={isPending} label="Update password" />
        </form>
      ) : null}

      {mode === "signin" || mode === "signup" ? (
        <>
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-text-muted">or continue with</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="flex flex-col gap-3">
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
        </>
      ) : null}

      <ModeFooter mode={mode} switchMode={switchMode} />
    </div>
  );
}

function SubmitButton({ isPending, label }: { isPending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="mt-1 flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-60"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {label}
    </button>
  );
}

function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="flex flex-col gap-1">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-2 text-xs ${
              met ? "text-success-foreground" : "text-text-muted"
            }`}
          >
            <Check className={`h-3.5 w-3.5 ${met ? "opacity-100" : "opacity-30"}`} />
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

function ModeFooter({
  mode,
  switchMode,
}: {
  mode: Mode;
  switchMode: (next: Mode) => void;
}) {
  if (mode === "signin") {
    return (
      <p className="mt-6 text-center text-xs text-text-secondary">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className="font-medium text-accent hover:underline"
        >
          Create one
        </button>
      </p>
    );
  }
  if (mode === "signup") {
    return (
      <p className="mt-6 text-center text-xs text-text-secondary">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => switchMode("signin")}
          className="font-medium text-accent hover:underline"
        >
          Sign in
        </button>
      </p>
    );
  }
  return (
    <p className="mt-6 text-center text-xs text-text-secondary">
      <button
        type="button"
        onClick={() => switchMode("signin")}
        className="font-medium text-accent hover:underline"
      >
        Back to sign in
      </button>
    </p>
  );
}
