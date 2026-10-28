import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Download, TrendingUp } from "lucide-react";
import { auth } from "@/auth";
import { indiaMonthKey } from "@/lib/dates";
import { calculateMoneyPosition, inr } from "@/lib/finance";
import { prisma } from "@/lib/prisma";
import { monthKeys, monthlyReport } from "@/lib/reports";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ months?: string }>;
}) {
  const session = await auth();
  if (!session?.user.id) redirect("/signin");
  const query = await searchParams;
  const count = [3, 6, 12].includes(Number(query.months))
    ? Number(query.months)
    : 6;
  const months = monthKeys(count);
  const [rows, goals] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { occurredAt: "asc" },
    }),
    prisma.goal.findMany({
      where: { userId: session.user.id },
      select: { savedAmount: true },
    }),
  ]);
  const series = monthlyReport(
    rows.map((row) => ({
      type: row.type,
      amount: row.amount.toNumber(),
      occurredAt: row.occurredAt,
    })),
    months,
  );
  const selected = rows.filter((row) =>
    months.includes(indiaMonthKey(row.occurredAt)),
  );
  const income = series.reduce((sum, month) => sum + month.income, 0);
  const expenses = series.reduce((sum, month) => sum + month.expense, 0);
  const position = calculateMoneyPosition(
    rows.map((row) => ({ type: row.type, amount: row.amount.toNumber() })),
    goals.reduce((sum, goal) => sum + goal.savedAmount.toNumber(), 0),
  );
  const max = Math.max(
    1,
    ...series.flatMap((item) => [item.income, item.expense]),
  );
  const categories = [
    ...selected
      .filter((row) => row.type === "EXPENSE")
      .reduce(
        (map, row) =>
          map.set(
            row.category,
            (map.get(row.category) ?? 0) + row.amount.toNumber(),
          ),
        new Map<string, number>(),
      )
      .entries(),
  ].sort((a, b) => b[1] - a[1]);
  const from = `${months[0]}-01`;
  const last = months.at(-1)!;
  const to = new Date(
    Date.UTC(Number(last.slice(0, 4)), Number(last.slice(5)), 0),
  )
    .toISOString()
    .slice(0, 10);
  return (
    <section className="page-shell">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/dashboard"
            className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-[#207849]"
          >
            <ArrowLeft className="size-3.5" /> Overview
          </Link>
          <h1 className="app-page-heading">Money reports</h1>
          <p className="app-page-subtitle">
            See actual income and spending over time. Goal savings are separate
            from expenses.
          </p>
        </div>
        <Link
          href={`/api/export/transactions?from=${from}&to=${to}`}
          className="btn btn-secondary text-xs"
        >
          <Download className="size-4" /> Download this period
        </Link>
      </header>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex rounded-lg border border-[#d9e0da] bg-[#fbfaf5] p-1"
          aria-label="Report date range"
        >
          {[3, 6, 12].map((option) => (
            <Link
              key={option}
              href={`/reports?months=${option}`}
              aria-current={count === option ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${count === option ? "bg-[#174b35] text-white" : "text-[#4d5d52] hover:bg-[#edf2ec]"}`}
            >
              {option} months
            </Link>
          ))}
        </div>
        <span className="text-xs text-[#4d5d52]">
          {from} to {to}
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ReportMetric
          label="Income in period"
          value={inr(income)}
          tone="income"
        />
        <ReportMetric
          label="Spent in period"
          value={inr(expenses)}
          tone="expense"
        />
        <ReportMetric
          label="Net for period"
          value={inr(income - expenses)}
          tone="plain"
        />
        <ReportMetric
          label="Available to spend"
          value={inr(position.availableToSpend)}
          tone="dark"
          note="All-time, after goal savings"
        />
      </div>

      <div className="mt-3 grid items-start gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
        <article className="card min-w-0 !bg-[#fbfaf5] p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="section-title">Monthly movement</h2>
              <p className="mt-1 text-xs text-[#4d5d52]">
                Green is income; terracotta is spending.
              </p>
            </div>
            <TrendingUp className="size-5 text-[#64816b]" />
          </div>
          <div className="mt-6 overflow-x-auto pb-2">
            <div
              className="grid min-w-[32rem] gap-3"
              style={{
                gridTemplateColumns: `repeat(${series.length}, minmax(0, 1fr))`,
              }}
            >
              {series.map((month) => (
                <div key={month.month} className="min-w-0">
                  <div className="flex h-44 items-end justify-center gap-1 border-b border-[#dce3dc] px-1">
                    <div
                      title={`${month.month} income ${inr(month.income)}`}
                      className="w-5 rounded-t bg-[#207849]"
                      style={{
                        height: `${month.income ? Math.max(5, (month.income / max) * 150) : 0}px`,
                      }}
                    />
                    <div
                      title={`${month.month} expenses ${inr(month.expense)}`}
                      className="w-5 rounded-t bg-[#d48761]"
                      style={{
                        height: `${month.expense ? Math.max(5, (month.expense / max) * 150) : 0}px`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-center text-[10px] font-medium text-[#526159]">
                    {month.month.slice(5)}/{month.month.slice(2, 4)}
                  </p>
                  <p className="mt-1 text-center text-[9px] text-[#526158]">
                    Net {inr(month.net)}
                  </p>
                </div>
              ))}
            </div>
          </div>
          {!selected.length && (
            <p className="mt-4 rounded-lg bg-[#f4f0e7] px-3 py-3 text-xs text-[#4d5d52]">
              No transactions in this period yet. Add one to start the chart.
            </p>
          )}
        </article>
        <article className="card !bg-[#f4f0e7] p-5">
          <h2 className="section-title">Spending categories</h2>
          <p className="mt-1 text-xs text-[#4d5d52]">
            Only expenses in this date range.
          </p>
          <div className="mt-5 space-y-4">
            {categories.map(([name, amount]) => (
              <div key={name}>
                <div className="mb-1.5 flex justify-between gap-2 text-xs">
                  <span>{name}</span>
                  <b>{inr(amount)}</b>
                </div>
                <div className="progress h-2">
                  <i
                    style={{
                      width: `${expenses ? (amount / expenses) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {!categories.length && (
              <p className="text-xs text-[#4d5d52]">
                No expenses in this period.
              </p>
            )}
          </div>
          <p className="mt-6 border-t border-[#dedbd2] pt-4 text-[11px] leading-5 text-[#4d5d52]">
            A goal deposit moves money into your reserved savings. It does not
            appear here as spending.
          </p>
        </article>
      </div>
    </section>
  );
}

function ReportMetric({
  label,
  value,
  tone,
  note,
}: {
  label: string;
  value: string;
  tone: "income" | "expense" | "plain" | "dark";
  note?: string;
}) {
  const color = {
    income: "!bg-[#e7f3e9] !border-[#bad4c1]",
    expense: "!bg-[#fff0e8] !border-[#edd1c1]",
    plain: "!bg-[#f0f1e8] !border-[#d9ddca]",
    dark: "!bg-[#174b35] !border-[#174b35] text-white",
  }[tone];
  return (
    <article className={`card p-4 ${color}`}>
      <p
        className={`text-[10px] font-medium ${tone === "dark" ? "text-white/85" : "text-[#4d5d52]"}`}
      >
        {label}
      </p>
      <b className="mt-1.5 block text-xl font-semibold">{value}</b>
      {note && <p className="mt-2 text-[10px] text-white/85">{note}</p>}
    </article>
  );
}
