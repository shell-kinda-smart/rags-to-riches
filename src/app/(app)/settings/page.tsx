import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, KeyRound, Trash2, UserRound } from "lucide-react";
import { auth } from "@/auth";
import {
  changeAccountName,
  changePassword,
  deleteAccount,
} from "@/app/actions";
import { RecoveryCodeGenerator } from "@/components/recovery-code-generator";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const session = await auth();
  if (!session?.user.id) redirect("/signin");
  const [query, account] = await Promise.all([
    searchParams,
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        createdAt: true,
        recoveryCodeHash: true,
      },
    }),
  ]);
  if (!account) redirect("/signin");
  const errors: Record<string, string> = {
    name: "Use a name between 2 and 60 characters.",
    password: "Your new password must have at least 8 characters.",
    current: "That current password is not correct.",
    confirmation: "Type DELETE exactly before deleting the account.",
  };
  return (
    <section className="page-shell">
      <header>
        <h1 className="app-page-heading">Account & data</h1>
        <p className="app-page-subtitle">
          Update your account, keep a copy of your records and control recovery.
        </p>
      </header>
      {query.error && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-[#e7c7b2] bg-[#f9eee5] px-4 py-3 text-xs text-[#8d492b]"
        >
          {errors[query.error] ?? "Check the form and try again."}
        </p>
      )}
      {query.saved && (
        <p
          role="status"
          className="mt-3 rounded-lg border border-[#c5ddca] bg-[#e9f4eb] px-4 py-3 text-xs text-[#2e7048]"
        >
          Account details saved.
        </p>
      )}
      <div className="mt-4 grid items-start gap-3 lg:grid-cols-2">
        <article className="card !bg-[#fbfaf5] p-5">
          <div className="flex items-center gap-2">
            <UserRound className="size-5 text-[#207849]" />
            <h2 className="section-title">Profile</h2>
          </div>
          <p className="mt-1 text-xs text-[#4d5d52]">
            Joined{" "}
            {account.createdAt.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            .
          </p>
          <form action={changeAccountName} className="mt-5 space-y-3">
            <label className="block text-xs font-medium">
              Name
              <input
                className="mt-1.5"
                name="name"
                defaultValue={account.name}
                minLength={2}
                maxLength={60}
                required
              />
            </label>
            <label className="block text-xs font-medium">
              Email
              <input
                className="mt-1.5 !bg-[#f0f2ee]"
                value={account.email}
                readOnly
                aria-describedby="email-note"
              />
            </label>
            <p id="email-note" className="text-[10px] text-[#526158]">
              Email cannot be changed here.
            </p>
            <button className="btn btn-primary">Save name</button>
          </form>
        </article>
        <article className="card !bg-[#f4f0e7] p-5">
          <div className="flex items-center gap-2">
            <Download className="size-5 text-[#207849]" />
            <h2 className="section-title">Your data</h2>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#4d5d52]">
            Download your transaction ledger for spreadsheets, or a full JSON
            copy of your account. Exports are private and do not include your
            password.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/api/export/transactions" className="btn btn-secondary">
              Download CSV
            </Link>
            <Link href="/api/export/account" className="btn btn-secondary">
              Download account JSON
            </Link>
            <Link href="/reports" className="btn btn-secondary">
              View reports
            </Link>
          </div>
        </article>
        <article className="card !bg-[#fbfaf5] p-5">
          <div className="flex items-center gap-2">
            <KeyRound className="size-5 text-[#207849]" />
            <h2 className="section-title">Password & recovery</h2>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#4d5d52]">
            Changing your password signs out existing sessions. Keep a recovery
            code in a safe place; it is the local alternative to email reset.
          </p>
          <form action={changePassword} className="mt-4 grid gap-3">
            <label className="text-xs font-medium">
              Current password
              <input
                className="mt-1.5"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                minLength={8}
                required
              />
            </label>
            <label className="text-xs font-medium">
              New password
              <input
                className="mt-1.5"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
            <button className="btn btn-primary justify-self-start">
              Change password
            </button>
          </form>
          <div className="mt-5 border-t border-[#e5e9e5] pt-4">
            <p className="text-xs font-semibold">Recovery code</p>
            <p className="mt-1 text-[11px] leading-5 text-[#4d5d52]">
              {account.recoveryCodeHash
                ? "A code is active. Generating a new one invalidates the old code."
                : "This older account has no code yet. Generate one now."}
            </p>
            <RecoveryCodeGenerator />
          </div>
        </article>
        <article className="card !border-[#ebd0c9] !bg-[#fbf4ee] p-5">
          <div className="flex items-center gap-2">
            <Trash2 className="size-5 text-[#a44a3c]" />
            <h2 className="section-title">Delete account</h2>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#6e7169]">
            This permanently removes your transactions, goals, budget, lessons
            and recurring plans from the current database. Download a copy first
            if you need it.
          </p>
          <details className="mt-4 rounded-lg border border-[#ebd0c9] bg-white p-3">
            <summary className="text-xs font-semibold text-[#a44a3c]">
              I want to delete my account
            </summary>
            <form action={deleteAccount} className="mt-4 grid gap-3">
              <label className="text-xs font-medium">
                Type DELETE
                <input
                  className="mt-1.5"
                  name="confirmation"
                  pattern="DELETE"
                  required
                  placeholder="DELETE"
                  autoComplete="off"
                />
              </label>
              <label className="text-xs font-medium">
                Current password
                <input
                  className="mt-1.5"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </label>
              <button className="btn !bg-[#a44a3c] text-white hover:!bg-[#873629]">
                Permanently delete account
              </button>
            </form>
          </details>
        </article>
      </div>
    </section>
  );
}
