"use client";

import { useActionState, useState } from "react";
import { Copy } from "lucide-react";
import { createNewRecoveryCode, type RecoveryFormState } from "@/app/actions";

const initial: RecoveryFormState = { status: "idle", message: "", code: null };

export function RecoveryCodeGenerator() {
  const [state, action, pending] = useActionState(
    createNewRecoveryCode,
    initial,
  );
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <form action={action} className="mt-4 flex flex-wrap items-end gap-2">
        <label className="min-w-[12rem] flex-1 text-xs font-medium">
          Current password
          <input
            className="mt-1.5"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Confirm it is you"
          />
        </label>
        <button className="btn btn-secondary" disabled={pending}>
          {pending ? "Creating…" : "Generate new code"}
        </button>
      </form>
      {state.status === "error" && (
        <p role="alert" className="mt-3 text-xs text-[#a44a3c]">
          {state.message}
        </p>
      )}
      {state.code && (
        <div className="mt-3 rounded-lg border border-[#bad4c1] bg-[#e7f3e9] p-3">
          <p role="status" className="text-xs text-[#2e7048]">
            {state.message}
          </p>
          <code className="mt-2 block break-all rounded-md bg-white px-3 py-2 text-sm font-semibold text-[#174b35]">
            {state.code}
          </code>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(state.code!);
              setCopied(true);
            }}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#207849]"
          >
            <Copy className="size-3.5" /> {copied ? "Copied" : "Copy code"}
          </button>
        </div>
      )}
    </div>
  );
}
