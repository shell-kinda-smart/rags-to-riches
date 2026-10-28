"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowRight, Copy } from "lucide-react";
import { recoverAccountAction, type RecoveryFormState } from "@/app/actions";

const initial: RecoveryFormState = { status: "idle", message: "", code: null };

export function RecoveryForm() {
  const [state, action, pending] = useActionState(
    recoverAccountAction,
    initial,
  );
  const [copied, setCopied] = useState(false);
  if (state.status === "success" && state.code)
    return (
      <div className="mt-6 rounded-xl border border-[#bad4c1] bg-[#e7f3e9] p-5">
        <p role="status" className="text-sm font-semibold text-[#174b35]">
          Password reset
        </p>
        <p className="mt-2 text-xs leading-5 text-[#526159]">
          The old code no longer works. Save this replacement code before
          leaving.
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
  return (
    <>
      {state.status === "error" && (
        <p role="alert" className="auth-feedback auth-feedback-error">
          {state.message}
        </p>
      )}
      <form action={action} className="auth-form">
        <label htmlFor="recover-email">Account email</label>
        <input
          id="recover-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
        <label htmlFor="recover-code">Recovery code</label>
        <input
          id="recover-code"
          name="recoveryCode"
          type="text"
          minLength={20}
          required
          autoComplete="off"
          placeholder="Code saved at registration"
        />
        <label htmlFor="recover-password">New password</label>
        <input
          id="recover-password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          placeholder="At least 8 characters"
        />
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary auth-submit"
        >
          {pending ? "Checking code…" : "Reset password"}{" "}
          <ArrowRight className="size-4" />
        </button>
      </form>
      <p className="auth-switch">
        <Link href="/signin">Remembered your password? Sign in</Link>
      </p>
    </>
  );
}
