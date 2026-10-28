import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  CalendarClock,
  Download,
  PiggyBank,
  Plus,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import { auth } from "@/auth";
import { indiaDateInputValue } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { calculateMoneyPosition, inr } from "@/lib/finance";
import { addTransaction } from "@/app/actions";
import { TransactionSelectors } from "@/components/transaction-selectors";
import { TransactionActions } from "@/components/transaction-actions";

export default async function Transactions({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session?.user.id) redirect("/signin");
  const [query, rows, goals] = await Promise.all([
    searchParams,
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.goal.findMany({
      where: { userId: session.user.id },
      select: { savedAmount: true },
    }),
  ]);
  const moneyPosition = calculateMoneyPosition(
    rows.map((row) => ({ type: row.type, amount: row.amount.toNumber() })),
    goals.reduce((sum, goal) => sum + goal.savedAmount.toNumber(), 0),
  );

  return (
    <section className="page-shell">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="app-page-heading">Transactions</h1>
          <p className="app-page-subtitle">
            Record what comes in and what goes out. Your dashboard updates
            automatically.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/recurring" className="btn btn-secondary text-xs">
            <CalendarClock className="size-4" /> Recurring
          </Link>
          <Link
            href="/api/export/transactions"
            className="btn btn-secondary text-xs"
          >
            <Download className="size-4" /> Export CSV
          </Link>
        </div>
      </header>

      {query.error === "invalid" && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-[#e7c7b2] bg-[#f9eee5] px-4 py-3 text-xs text-[#8d492b]"
        >
          Check the transaction description, amount, type, category and date,
          then try again.
        </p>
      )}
      {query.error === "missing" && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-[#e7c7b2] bg-[#f9eee5] px-4 py-3 text-xs text-[#8d492b]"
        >
          That transaction was not found in your account. Refresh and try again.
        </p>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Summary
          icon={ArrowDownLeft}
          label="Total income"
          value={inr(moneyPosition.totalIncome)}
          tone="income"
        />
        <Summary
          icon={ArrowUpRight}
          label="Total expenses"
          value={inr(moneyPosition.totalExpenses)}
          tone="expense"
        />
        <Summary
          icon={PiggyBank}
          label="Set aside in goals"
          value={inr(moneyPosition.goalSavings)}
          tone="savings"
        />
        <Summary
          icon={WalletCards}
          label="Available to spend"
          value={inr(moneyPosition.availableToSpend)}
          tone={moneyPosition.availableToSpend < 0 ? "shortfall" : "neutral"}
        />
      </div>
      <p className="mt-2 text-[11px] leading-5 text-[#4d5d52]">
        Income − expenses − money set aside in goals = available to spend. Goal
        deposits are not expenses.
      </p>
      {moneyPosition.availableToSpend < 0 && (
        <p
          role="alert"
          className="mt-2 rounded-lg border border-[#e7c7b2] bg-[#f9eee5] px-4 py-3 text-xs text-[#8d492b]"
        >
          {moneyPosition.goalSavings > 0
            ? `Expenses and goal savings together exceed recorded income by ${inr(Math.abs(moneyPosition.availableToSpend))}. Review transactions or release goal savings.`
            : `Expenses exceed recorded income by ${inr(Math.abs(moneyPosition.availableToSpend))}. Review transactions or record missing income.`}
        </p>
      )}

      <div className="app-workspace-grid mt-3">
        <article className="card z-20 overflow-visible !bg-[#f4f0e7] lg:sticky lg:top-24">
          <div className="border-b border-[#dedbd2] p-5">
            <div className="flex items-center gap-3">
              <span className="icon-tile bg-[#d9ed70] text-[#174b35]">
                <Plus className="size-[18px]" />
              </span>
              <div>
                <p className="eyebrow">NEW ENTRY</p>
                <h2 className="section-title mt-1">Add transaction</h2>
              </div>
            </div>
          </div>
          <form action={addTransaction} className="space-y-4 p-5">
            <Field icon={ReceiptText} label="Description">
              <input
                name="description"
                required
                placeholder="e.g. Monthly pocket money"
              />
            </Field>
            <TransactionSelectors initialType="INCOME" />
            <Field icon={CalendarDays} label="Date">
              <input
                name="occurredAt"
                type="date"
                defaultValue={indiaDateInputValue(new Date())}
              />
            </Field>
            <button className="btn btn-primary w-full">
              <Plus className="size-4" /> Save transaction
            </button>
            <p className="text-center text-[10px] leading-4 text-[#8a958e]">
              Stored privately in your account and reflected in live analytics.
            </p>
          </form>
        </article>

        <article className="card overflow-hidden !bg-[#fbfaf5]">
          <div className="flex items-center justify-between border-b border-[#e8ece9] p-5">
            <div>
              <p className="eyebrow">ACTIVITY LEDGER</p>
              <h2 className="section-title mt-1">Transaction history</h2>
            </div>
            <span className="rounded-full bg-[#f0f4f1] px-3 py-1.5 text-[10px] font-bold text-[#637068]">
              {rows.length} records
            </span>
          </div>
          <div className="divide-y divide-[#edf0ed] px-4 sm:px-6">
            {rows.map((row) => (
              <div key={row.id} className="group flex items-center gap-3 py-3">
                <span
                  className={`icon-tile ${row.type === "INCOME" ? "bg-[#e4f5e9] text-[#2b7c4e]" : "bg-[#fff0e8] text-[#b65b2e]"}`}
                >
                  {row.type === "INCOME" ? (
                    <ArrowDownLeft className="size-[17px]" />
                  ) : (
                    <ArrowUpRight className="size-[17px]" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-[13px] font-semibold">
                    {row.description}
                  </b>
                  <span className="mt-1 block text-[10px] text-[#526158]">
                    {row.category} ·{" "}
                    {row.occurredAt.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <b
                  className={`text-[13px] ${row.type === "INCOME" ? "text-[#24804f]" : "text-[#23342b]"}`}
                >
                  {row.type === "INCOME" ? "+" : "−"}
                  {inr(row.amount.toNumber())}
                </b>
                <TransactionActions
                  transaction={{
                    id: row.id,
                    description: row.description,
                    amount: row.amount.toNumber(),
                    type: row.type,
                    category: row.category,
                    occurredAt: indiaDateInputValue(row.occurredAt),
                  }}
                />
              </div>
            ))}
            {!rows.length && (
              <div className="grid min-h-56 place-items-center text-center">
                <div>
                  <span className="icon-tile mx-auto bg-[#edf5ef] text-[#397654]">
                    <ReceiptText className="size-5" />
                  </span>
                  <b className="mt-4 block text-sm">Your ledger is empty</b>
                  <p className="mt-1 text-xs text-[#526158]">
                    Add your first income or expense.
                  </p>
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: typeof ArrowDownLeft;
  label: string;
  value: string;
  tone?: "income" | "expense" | "savings" | "shortfall" | "neutral";
}) {
  const income = tone === "income";
  const expense = tone === "expense";
  const savings = tone === "savings";
  const shortfall = tone === "shortfall";
  return (
    <article
      className={`card card-interactive flex items-center gap-3 p-4 ${income ? "!border-[#bad4c1] !bg-[#e7f3e9]" : expense ? "!border-[#edd1c1] !bg-[#fff0e8]" : savings ? "!border-[#d9ddca] !bg-[#f0f1e8]" : shortfall ? "!border-[#e7c7b2] !bg-[#f9eee5]" : "!bg-[#edf2ec]"}`}
    >
      <span
        className={`icon-tile size-10 ${income ? "bg-[#d3ead9] text-[#207849]" : expense || shortfall ? "bg-[#f8ddce] text-[#b65b2e]" : savings ? "bg-[#e4e9d4] text-[#55762f]" : "bg-white/65 text-[#526159]"}`}
      >
        <Icon className="size-[19px]" />
      </span>
      <div>
        <p className="text-[10px] font-semibold text-[#6f7c74]">{label}</p>
        <b className="mt-1 block text-lg tracking-[-.03em]">{value}</b>
      </div>
    </article>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof ReceiptText;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="mb-2 flex items-center gap-1.5">
        <Icon className="size-3.5 text-[#207849]" />
        {label}
      </span>
      {children}
    </div>
  );
}
