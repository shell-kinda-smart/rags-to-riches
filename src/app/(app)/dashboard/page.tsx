import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Bus,
  CalendarDays,
  Film,
  Plus,
  ReceiptText,
  Settings2,
  ShoppingBag,
  Target,
  Utensils,
  WalletCards,
} from "lucide-react";
import { auth } from "@/auth";
import { BudgetAlert } from "@/components/budget-alert";
import { indiaGreeting, indiaMonthKey, indiaMonthLabel } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import {
  calculateGoalProgress,
  calculateMoneyPosition,
  calculateSummary,
  inr,
} from "@/lib/finance";
import { getBudgetState } from "@/lib/financial-alerts";

const categoryIcons = {
  Food: Utensils,
  Travel: Bus,
  Study: BookOpen,
  Entertainment: Film,
  "Part-time Work": BriefcaseBusiness,
  "Pocket Money": WalletCards,
  Other: ShoppingBag,
} as const;

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user.id) redirect("/signin");

  const [rows, budget, goals] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
    }),
    prisma.budget.findUnique({ where: { userId: session.user.id } }),
    prisma.goal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const now = new Date();
  const monthKey = indiaMonthKey(now);
  const monthRows = rows.filter(
    (row) => indiaMonthKey(row.occurredAt) === monthKey,
  );
  const summary = calculateSummary(
    monthRows.map((row) => ({ type: row.type, amount: row.amount.toNumber() })),
    budget?.monthlyLimit.toNumber() || 0,
  );
  const moneyPosition = calculateMoneyPosition(
    rows.map((row) => ({ type: row.type, amount: row.amount.toNumber() })),
    goals.reduce((sum, item) => sum + item.savedAmount.toNumber(), 0),
  );

  const grouped = new Map<string, number>();
  monthRows
    .filter((row) => row.type === "EXPENSE")
    .forEach((row) =>
      grouped.set(
        row.category,
        (grouped.get(row.category) || 0) + row.amount.toNumber(),
      ),
    );
  const categories = [...grouped.entries()].sort((a, b) => b[1] - a[1]);

  const goal = goals[0];
  const goalSaved = goal?.savedAmount.toNumber() ?? 0;
  const goalTarget = goal?.targetAmount.toNumber() ?? 1;
  const goalProgress = calculateGoalProgress(goalSaved, goalTarget);
  const spendShare = summary.income
    ? Math.round((summary.expense / summary.income) * 100)
    : 0;
  const hasIncome = summary.income > 0;
  const hasBudget = summary.budget > 0;
  const budgetState = getBudgetState(summary.budget, summary.expense);
  const maxCashflow = Math.max(
    moneyPosition.totalIncome,
    moneyPosition.totalExpenses,
    moneyPosition.goalSavings,
    Math.max(0, moneyPosition.availableToSpend),
    1,
  );
  const firstName = session.user.name?.split(" ")[0] || "Saver";

  const cashflow = [
    {
      label: "Received",
      value: moneyPosition.totalIncome,
      color: "bg-[#207849]",
    },
    {
      label: "Spent",
      value: moneyPosition.totalExpenses,
      color: "bg-[#d48761]",
    },
    {
      label: "In goals",
      value: moneyPosition.goalSavings,
      color: "bg-[#8cae54]",
    },
    {
      label: "Free to spend",
      value: moneyPosition.availableToSpend,
      color: "bg-[#174b35]",
    },
  ];

  return (
    <section className="page-shell">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="app-page-heading">
            {indiaGreeting(now)}, {firstName}
          </h1>
          <p className="app-page-subtitle">
            Overall money available and this month’s activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-md border border-[#d9e0da] bg-white px-3 py-2 text-[11px] text-[#4d5d52] sm:flex">
            <CalendarDays className="size-4 text-[#207849]" />
            {indiaMonthLabel(now)}
          </span>
          <Link href="/transactions" className="btn btn-primary">
            <Plus className="size-4" /> Add transaction
          </Link>
        </div>
      </header>

      {budgetState !== "not-set" && budgetState !== "safe" && (
        <BudgetAlert
          state={budgetState}
          budgetUsed={summary.budgetUsed}
          budgetRemaining={summary.budgetRemaining}
        />
      )}

      {moneyPosition.availableToSpend < 0 && (
        <div
          role="alert"
          className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#e7c7b2] bg-[#f9eee5] px-4 py-3 text-xs text-[#8d492b]"
        >
          <span>
            {moneyPosition.goalSavings > 0
              ? `Expenses and goal savings together exceed recorded income by ${inr(Math.abs(moneyPosition.availableToSpend))}.`
              : `Expenses exceed recorded income by ${inr(Math.abs(moneyPosition.availableToSpend))}.`}
          </span>
          <Link
            href={moneyPosition.goalSavings > 0 ? "/goals" : "/transactions"}
            className="font-semibold underline underline-offset-2"
          >
            {moneyPosition.goalSavings > 0
              ? "Review goal savings"
              : "Review transactions"}
          </Link>
        </div>
      )}

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Available to spend"
          value={inr(moneyPosition.availableToSpend)}
          note="All-time income − expenses − goal savings"
          tone={moneyPosition.availableToSpend < 0 ? "shortfall" : "primary"}
        />
        <MetricCard
          label="Income this month"
          value={inr(summary.income)}
          note="Pocket money and earnings"
          tone="income"
        />
        <MetricCard
          label="Expenses this month"
          value={inr(summary.expense)}
          note={
            hasIncome
              ? `${spendShare}% of monthly income`
              : summary.expense > 0
                ? "No income recorded this month"
                : "No spending recorded this month"
          }
          tone="expense"
        />
        <MetricCard
          label="Set aside in goals"
          value={inr(moneyPosition.goalSavings)}
          note="Reserved money, not an expense"
          tone="savings"
        />
      </div>

      <div
        data-testid="dashboard-columns"
        className="mt-3 grid items-start gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(17rem,1fr)]"
      >
        <div className="grid min-w-0 content-start gap-3">
          <article className="card !bg-[#fbfaf5] p-5">
            <PanelHeader
              title="Where your money stands"
              subtitle="All recorded income, spending and goal savings"
            />
            <div className="cashflow-grid mt-5">
              <div>
                <div className="grid h-44 grid-cols-4 items-end gap-3 border-b border-[#dfe5e0] px-3">
                  {cashflow.map((item) => {
                    const height =
                      item.value > 0
                        ? Math.max(
                            8,
                            Math.round((item.value / maxCashflow) * 124),
                          )
                        : 0;
                    return (
                      <div
                        key={item.label}
                        className="flex h-full flex-col items-center justify-end gap-2"
                      >
                        <span className="text-[10px] font-medium text-[#4d5d52]">
                          {inr(item.value)}
                        </span>
                        <div
                          className={`w-full max-w-20 shrink-0 rounded-t-md ${item.color}`}
                          style={{ height: `${height}px` }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 grid grid-cols-4 gap-3 px-3 text-center text-[10px] font-medium text-[#4d5d52]">
                  {cashflow.map((item) => (
                    <span key={item.label}>{item.label}</span>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {cashflow.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-4 text-xs"
                  >
                    <span className="flex items-center gap-2 text-[#4d5d52]">
                      <i className={`size-2 rounded-full ${item.color}`} />
                      {item.label}
                    </span>
                    <b className="font-medium text-[#26372e]">
                      {inr(item.value)}
                    </b>
                  </div>
                ))}
                <div className="border-t border-[#e5e9e5] pt-3">
                  <p className="text-[10px] leading-4 text-[#526158]">
                    {moneyPosition.availableToSpend < 0
                      ? moneyPosition.goalSavings > 0
                        ? `Expenses and goal savings exceed income by ${inr(Math.abs(moneyPosition.availableToSpend))}. Review transactions or release savings.`
                        : `Expenses exceed income by ${inr(Math.abs(moneyPosition.availableToSpend))}. Review transactions or record missing income.`
                      : "Goal savings reduce free money, not your expense total."}
                  </p>
                </div>
              </div>
            </div>
          </article>

          <article className="card !bg-[#fbfaf5] p-5">
            <PanelHeader
              title="Recent transactions"
              subtitle="Latest activity in your account"
              href="/transactions"
            />
            <div className="mt-2 divide-y divide-[#edf0ed]">
              {rows.slice(0, 5).map((row) => {
                const Icon =
                  categoryIcons[row.category as keyof typeof categoryIcons] ??
                  ReceiptText;
                return (
                  <div
                    key={row.id}
                    className="grid grid-cols-[36px_1fr_auto_auto] items-center gap-3 py-2.5"
                  >
                    <span className="grid size-8 place-items-center rounded-lg bg-[#f1f4f1] text-[#5f6e65]">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-[#34453b]">
                        {row.description}
                      </p>
                      <p className="mt-0.5 text-[9px] text-[#526158]">
                        {row.category}
                      </p>
                    </div>
                    <span className="hidden text-[10px] text-[#526158] sm:block">
                      {row.occurredAt.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <b
                      className={`min-w-20 text-right text-xs font-medium ${row.type === "INCOME" ? "text-[#207849]" : "text-[#34453b]"}`}
                    >
                      {row.type === "INCOME" ? "+" : "−"}
                      {inr(row.amount.toNumber())}
                    </b>
                  </div>
                );
              })}
              {!rows.length && <EmptyState text="No transactions yet." />}
            </div>
          </article>
        </div>

        <div className="grid min-w-0 content-start gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <article className="card !bg-[#f4f0e7] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-[#edf3ee] text-[#207849]">
                  <Target className="size-[18px]" />
                </span>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[.08em] text-[#526158]">
                    Savings goal
                  </p>
                  <h2 className="mt-0.5 text-sm font-medium">
                    {goal?.name || "No goal created"}
                  </h2>
                </div>
              </div>
              <Link href="/goals" aria-label="Open savings goals">
                <ArrowRight className="size-4 text-[#207849]" />
              </Link>
            </div>
            {goal ? (
              <>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <b className="text-2xl font-semibold tracking-[-.035em]">
                    {inr(goalSaved)}
                  </b>
                  <span className="text-[10px] text-[#526158]">
                    {goalProgress.label} complete
                  </span>
                </div>
                <div className="progress mt-3">
                  <i style={{ width: `${goalProgress.barWidth}%` }} />
                </div>
                <p className="mt-2 text-[10px] text-[#526158]">
                  {inr(Math.max(0, goalTarget - goalSaved))} remaining of{" "}
                  {inr(goalTarget)}
                </p>
              </>
            ) : (
              <Link
                href="/goals"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#207849]"
              >
                <Plus className="size-3.5" /> Create a goal
              </Link>
            )}
          </article>

          <article className="card !bg-[#edf2ec] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-[#edf3ee] text-[#207849]">
                  <Settings2 className="size-[18px]" />
                </span>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[.08em] text-[#526158]">
                    Monthly budget
                  </p>
                  <h2 className="mt-0.5 text-sm font-medium">
                    {hasBudget
                      ? `${inr(summary.budget)} limit`
                      : "No budget set"}
                  </h2>
                </div>
              </div>
              <Link href="/budget" aria-label="Open budget planner">
                <ArrowRight className="size-4 text-[#207849]" />
              </Link>
            </div>
            {hasBudget ? (
              <>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] text-[#526158]">Remaining</p>
                    <b className="mt-1 block text-2xl font-semibold tracking-[-.035em]">
                      {inr(summary.budgetRemaining)}
                    </b>
                  </div>
                  <span
                    className={`rounded-md px-2 py-1 text-[10px] font-medium ${budgetState === "exceeded" || budgetState === "reached" ? "bg-[#f5d5d1] text-[#963b34]" : budgetState === "near" || budgetState === "watch" ? "bg-[#f7e6b7] text-[#765b16]" : "bg-[#e1eee4] text-[#356b4c]"}`}
                  >
                    {summary.budgetUsed}% used
                  </span>
                </div>
                <div className="progress mt-3">
                  <i
                    className={
                      budgetState === "exceeded" || budgetState === "reached"
                        ? "!bg-[#bd4138]"
                        : budgetState === "near"
                          ? "!bg-[#dc7b3f]"
                          : budgetState === "watch"
                            ? "!bg-[#c79a28]"
                            : undefined
                    }
                    style={{ width: `${Math.min(summary.budgetUsed, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-[10px] text-[#526158]">
                  Spending limit, not cash.{" "}
                  {inr(moneyPosition.availableToSpend)} free after goals.
                </p>
              </>
            ) : (
              <p className="mt-5 text-[11px] leading-5 text-[#4d5d52]">
                Set a monthly limit to measure spending and remaining budget.
              </p>
            )}
          </article>

          <article className="card !bg-[#edf2ec] p-5">
            <PanelHeader
              title="Spending by category"
              subtitle="Where your money went"
              href="/reports"
            />
            <div className="mt-4 space-y-3">
              {categories.slice(0, 4).map(([name, value]) => {
                const Icon =
                  categoryIcons[name as keyof typeof categoryIcons] ??
                  ShoppingBag;
                const width = summary.expense
                  ? (value / summary.expense) * 100
                  : 0;
                return (
                  <div key={name}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-[10px]">
                      <span className="flex items-center gap-2 text-[#526159]">
                        <Icon className="size-3.5" /> {name}
                      </span>
                      <b className="font-medium text-[#34453b]">{inr(value)}</b>
                    </div>
                    <div className="progress h-1.5">
                      <i style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
              {!categories.length && (
                <EmptyState text="No spending recorded this month." />
              )}
            </div>
          </article>

          <article className="card !bg-[#f4f0e7] p-4">
            <p className="text-[10px] font-medium uppercase tracking-[.08em] text-[#526158]">
              Quick actions
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <QuickAction href="/transactions" icon={Plus} label="Add entry" />
              <QuickAction href="/goals" icon={Target} label="Add savings" />
              <QuickAction
                href="/budget"
                icon={Settings2}
                label="Edit budget"
              />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone: "primary" | "income" | "expense" | "savings" | "shortfall";
}) {
  const primary = tone === "primary";
  const surface = {
    primary: "!border-[#174b35] !bg-[#174b35]",
    income: "!border-[#d1ddd4] !bg-[#eaf1eb]",
    expense: "!border-[#e5d5c8] !bg-[#f5ede6]",
    savings: "!border-[#d9ddca] !bg-[#f0f1e8]",
    shortfall: "!border-[#e7c7b2] !bg-[#f9eee5]",
  }[tone];

  return (
    <article className={`card p-4 ${surface}`}>
      <p
        className={`text-[10px] font-medium ${primary ? "text-white/85" : "text-[#4d5d52]"}`}
      >
        {label}
      </p>
      <b
        className={`mt-1.5 block text-2xl font-semibold tracking-[-.04em] ${primary ? "text-white" : "text-[#16271f]"}`}
      >
        {value}
      </b>
      <p
        className={`mt-2 text-[9px] ${primary ? "text-white/85" : "text-[#526158]"}`}
      >
        {note}
      </p>
    </article>
  );
}

function PanelHeader({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle?: string;
  href?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-sm font-medium text-[#16271f]">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-[9px] text-[#526158]">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-[10px] font-medium text-[#207849]"
        >
          View all <ArrowRight className="size-3" />
        </Link>
      )}
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Plus;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-0 flex-col items-center gap-1.5 rounded-lg border border-[#e2e7e3] bg-[#f8f9f7] px-2 py-2.5 text-center text-[9px] font-medium text-[#526159] transition-colors hover:border-[#c9d5cc] hover:bg-[#f1f5f1]"
    >
      <Icon className="size-4 text-[#207849]" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="flex h-20 items-center justify-center text-[11px] text-[#526158]">
      {text}
    </p>
  );
}
