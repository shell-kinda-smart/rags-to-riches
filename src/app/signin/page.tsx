import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { loginAction } from "@/app/actions";
import { AuthVisual } from "@/components/auth-visual";

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    registered?: string;
    passwordChanged?: string;
  }>;
}) {
  const query = await searchParams;
  return (
    <main className="auth-page">
      <AuthVisual mode="signin" />
      <section className="auth-panel">
        <div className="auth-panel-top">
          <Link href="/" className="auth-mobile-brand">
            <span className="brand-mark">₹</span>
            <span>
              Rags to <strong>Riches</strong>
            </span>
          </Link>
          <Link href="/" className="auth-back">
            <ArrowLeft size={15} aria-hidden="true" /> Back to home
          </Link>
        </div>
        <div className="auth-form-wrap">
          <p className="auth-form-eyebrow">YOUR WORKSPACE</p>
          <h1>Welcome back.</h1>
          <p className="auth-form-copy">Pick up right where you left off.</p>
          {query.error && (
            <p role="alert" className="auth-feedback auth-feedback-error">
              Incorrect email or password. Please try again.
            </p>
          )}
          {query.registered && (
            <p role="status" className="auth-feedback auth-feedback-success">
              Account created. Sign in to open your workspace.
            </p>
          )}
          {query.passwordChanged && (
            <p role="status" className="auth-feedback auth-feedback-success">
              Password changed. Sign in with your new password.
            </p>
          )}
          <form action={loginAction} className="auth-form">
            <label htmlFor="signin-email">Email address</label>
            <input
              id="signin-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
            <label htmlFor="signin-password">Password</label>
            <input
              id="signin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              minLength={8}
              required
              placeholder="Enter your password"
            />
            <button type="submit" className="btn btn-primary auth-submit">
              Sign in <ArrowRight size={16} aria-hidden="true" />
            </button>
          </form>
          <p className="mt-3 text-center text-xs">
            <Link
              href="/recover"
              className="font-semibold text-[#207849] hover:underline"
            >
              Forgot password? Use your recovery code
            </Link>
          </p>
          <p className="auth-switch">
            New here? <Link href="/register">Create an account</Link>
          </p>
        </div>
        <p className="auth-panel-foot">
          A private place for your everyday money.
        </p>
      </section>
    </main>
  );
}
