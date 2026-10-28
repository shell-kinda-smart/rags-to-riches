"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowRight, Copy } from "lucide-react";
import { registerAction, type RecoveryFormState } from "@/app/actions";

const initial: RecoveryFormState = { status: "idle", message: "", code: null };

export function RegistrationForm() {
  const [state, action, pending] = useActionState(registerAction, initial);
  const [copied, setCopied] = useState(false);
  if (state.status === "success" && state.code) {
    return (
      <div className="mt-6 rounded-xl border border-[#bad4c1] bg-[#e7f3e9] p-5">
        <p role="status" className="text-sm font-semibold text-[#174b35]">
          Account created
        </p>
        <p className="mt-2 text-xs leading-5 text-[#526159]">
          Your recovery code is shown only once. Save it somewhere private; it
          can reset your password without email access.
        </p>
        <code className="mt-4 block break-all rounded-lg border border-[#c4d9c9] bg-white px-3 py-3 text-sm font-semibold tracking-wide text-[#174b35]">
          {state.code}
        </code>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(state.code!);
            setCopied(true);
          }}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#207849]"
        >
          <Copy className="size-3.5" /> {copied ? "Copied" : "Copy code"}
        </button>
        <Link href="/signin" className="btn btn-primary mt-5 w-full">
          I saved it — sign in <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }
  return (
    <>
      {state.status === "error" && (
        <p role="alert" className="auth-feedback auth-feedback-error">
          {state.message}
        </p>
      )}
      <form action={action} className="auth-form">
        <label htmlFor="register-name">Full name</label>
        <input
          id="register-name"
          name="name"
          type="text"
          autoComplete="name"
          minLength={2}
          required
          placeholder="Your name"
        />
        <label htmlFor="register-email">Email address</label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
        <label htmlFor="register-password">Create password</label>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          placeholder="At least 8 characters"
          aria-describedby="password-hint"
        />
        <p id="password-hint" className="auth-field-hint">
          Use 8 or more characters. You will receive a private recovery code
          after registration.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary auth-submit"
        >
          {pending ? "Creating account…" : "Create account"}{" "}
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link href="/signin">Sign in</Link>
      </p>
    </>
  );
}
