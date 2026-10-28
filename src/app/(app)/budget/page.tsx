import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BadgeIndianRupee,
  BookOpen,
  CircleDollarSign,
  Compass,
  Film,
  PiggyBank,
  Save,
  ShieldCheck,
  ShoppingBasket,
  WalletCards,
} from "lucide-react";
import { auth } from "@/auth";
import { indiaDateParts, indiaMonthKey, indiaMonthLabel } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { calculateMoneyPosition, calculateSummary, inr } from "@/lib/finance";
import { getBudgetState } from "@/lib/financial-alerts";
import { updateBudget } from "@/app/actions";

export default async function Budget({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session?.user.id) redirect("/signin");
  const [query, rows, budget, goals] = await Promise.all([
    searchParams,
    prisma.transaction.findMany({ where: { userId: session.user.id } }),
    prisma.budget.findUnique({ where: { userId: session.user.id } }),
    prisma.goal.findMany({
      where: { userId: session.user.id },
      select: { savedAmount: true },
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
    goals.reduce((sum, goal) => sum + goal.savedAmount.toNumber(), 0),
  );
  const hasBudget = summary.budget > 0;
  const practicalRoom = Math.max(
    0,
    hasBudget
      ? Math.min(summary.budgetRemaining, moneyPosition.availableToSpend)
      : moneyPosition.availableToSpend,
  );
  const safeUsed = Math.max(0, Math.min(summary.budgetUsed, 100));
  const budgetState = getBudgetState(summary.budget, summary.expense);
  const statusColor =
    budgetState === "exceeded" || budgetState === "reached"
      ? "#bd4138"
      : budgetState === "near"
        ? "#dc7b3f"
        : budgetState === "watch"
          ? "#c79a28"
          : "#207849";

  return (
    <section className="page-shell">
      <header>
        <h1 className="app-page-heading">Budget planner</h1>
        <p className="app-page-subtitle">
          Set a clear ceiling, understand your pace and balance today’s needs
          with tomorrow’s goals.
        </p>
      </header>

      {query.error === "invalid" && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-[#e7c7b2] bg-[#f9eee5] px-4 py-3 text-xs text-[#8d492b]"
        >
          Enter a valid monthly budget greater than zero.
        </p>
      )}

      <div className="app-summary-grid mt-3">
        <article className="card relative overflow-hidden !bg-[#edf2ec] p-5 sm:p-6">
          <div className="relative flex flex-wrap items-start justify-between gap-8">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[.1em] text-[#207849]">
                <WalletCards className="size-3.5" /> {indiaMonthLabel(now)}
              </p>
              <p className="mt-4 text-xs text-[#4d5d52]">
                {hasBudget ? "Monthly spending limit left" : "Monthly budget"}
              </p>
              <b className="mt-2 block text-3xl font-semibold tracking-[-.045em]">
                {hasBudget ? inr(summary.budgetRemaining) : "Set a limit"}
              </b>
              <p className="mt-3 text-xs text-[#4d5d52]">
                {hasBudget
                  ? `${inr(summary.expense)} spent from ${inr(summary.budget)}`
                  : `${inr(summary.expense)} spent this month`}
              </p>
              <p className="mt-2 text-[11px] text-[#526159]">
                {inr(moneyPosition.availableToSpend)} free after goal savings. A
                budget is a limit, not extra cash.
              </p>
            </div>
            <div
              className="relative grid size-28 place-items-center rounded-full"
              style={{
                background: `conic-gradient(${statusColor} ${safeUsed}%, #e8ece8 0)`,
              }}
            >
              <div className="grid size-[86px] place-items-center rounded-full bg-[#fbfaf5] text-center">
                <div>
                  <b className="block text-2xl font-semibold">
                    {summary.budgetUsed}%
                  </b>
                  <span className="text-[10px] text-[#526158]">
                    budget used
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="relative mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Status
              label="Monthly limit"
              value={hasBudget ? inr(summary.budget) : "Not set"}
            />
            <Status
              label="Daily pace"
              value={inr(
                summary.expense / Math.max(1, Number(indiaDateParts(now).day)),
              )}
            />
            <Status
              label={hasBudget ? "Within both limits" : "Free to spend"}
              value={inr(practicalRoom)}
            />
            <Status
              label="Status"
              value={
                !hasBudget
                  ? "Not set"
                  : budgetState === "exceeded"
                    ? "Over budget"
                    : budgetState === "reached"
                      ? "Limit reached"
                      : budgetState === "near"
                        ? "Near limit"
                        : budgetState === "watch"
                          ? "Watch spending"
                          : "Within plan"
              }
            />
          </div>
        </article>

        <article className="card overflow-hidden !bg-[#f4f0e7]">
          <div className="border-b border-[#dedbd2] p-5">
            <div className="flex items-center gap-3">
              <span className="icon-tile bg-[#d9ed70] text-[#174b35]">
                <BadgeIndianRupee className="size-[18px]" />
              </span>
              <div>
                <p className="eyebrow">BUDGET SETTINGS</p>
                <h2 className="section-title mt-1">Adjust your limit</h2>
              </div>
            </div>
          </div>
          <form action={updateBudget} className="p-5">
            <label>
              <span className="mb-2 flex items-center gap-1.5">
                <CircleDollarSign className="size-3.5 text-[#207849]" /> Monthly
                spending ceiling
              </span>
              <input
                name="monthlyLimit"
                type="number"
                min="1"
                defaultValue={hasBudget ? summary.budget : undefined}
              />
            </label>
            <button className="btn btn-primary mt-4 w-full">
              <Save className="size-4" /> Update budget
            </button>
            <div className="mt-5 rounded-lg bg-white/55 p-4">
              <p className="flex items-start gap-2 text-[10px] leading-5 text-[#627168]">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#207849]" />
                This limit guides your decisions. It does not restrict or move
                any money.
              </p>
            </div>
          </form>
        </article>
      </div>

      <div className="mt-4">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">RECOMMENDED FRAMEWORK</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-.035em]">
              The 50 / 30 / 20 rule
            </h2>
          </div>
          <span className="hidden items-center gap-2 text-[10px] font-semibold text-[#526158] sm:flex">
            <Compass className="size-4" /> A simple starting point
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Rule
            icon={ShoppingBasket}
            percent="50%"
            title="Needs"
            amount={summary.income * 0.5}
            copy="Food, travel, study materials and essentials that keep daily life moving."
            color="bg-[#e6f3ff] text-[#3475a7]"
            bar="bg-[#5b9bd0]"
          />
          <Rule
            icon={Film}
            percent="30%"
            title="Wants"
            amount={summary.income * 0.3}
            copy="Entertainment, eating out and optional purchases that make life enjoyable."
            color="bg-[#fff0e4] text-[#ae5b2c]"
            bar="bg-[#dc8a53]"
          />
          <Rule
            icon={PiggyBank}
            percent="20%"
            title="Savings"
            amount={summary.income * 0.2}
            copy="Savings goals, an emergency buffer and investments in your growth."
            color="bg-[#e6f4d3] text-[#52782c]"
            bar="bg-[#72a346]"
          />
        </div>
      </div>

      <article className="card mt-3 flex flex-wrap items-center justify-between gap-4 !bg-[#edf2ec] p-5">
        <div className="flex items-center gap-4">
          <span className="icon-tile bg-white/70 text-[#207849]">
            <BookOpen className="size-[18px]" />
          </span>
          <div>
            <b className="block text-sm">Want to make your budget stick?</b>
            <p className="mt-1 text-[11px] text-[#7f8b83]">
              Review it weekly and adjust without guilt when life changes.
            </p>
          </div>
        </div>
        <Link href="/learn" className="btn btn-secondary">
          View money guides
        </Link>
      </article>
    </section>
  );
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#dbe2dc] bg-white/60 p-3">
      <p className="text-[9px] font-medium text-[#526158]">{label}</p>
      <b className="mt-2 block text-sm">{value}</b>
    </div>
  );
}
function Rule({
  icon: Icon,
  percent,
  title,
  amount,
  copy,
  color,
  bar,
}: {
  icon: typeof ShoppingBasket;
  percent: string;
  title: string;
  amount: number;
  copy: string;
  color: string;
  bar: string;
}) {
  return (
    <article className="card card-interactive !bg-[#fbfaf5] p-5">
      <div className="flex items-center justify-between">
        <span className={`icon-tile ${color}`}>
          <Icon className="size-[18px]" />
        </span>
        <b className="text-2xl font-semibold tracking-[-.04em]">{percent}</b>
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-2 min-h-12 text-[11px] leading-5 text-[#526158]">
        {copy}
      </p>
      <div className="mt-5 h-1.5 rounded-full bg-[#edf0ed]">
        <i
          className={`block h-full rounded-full ${bar}`}
          style={{ width: percent }}
        />
      </div>
      <p className="mt-3 text-[10px] text-[#526158]">
        Suggested allocation{" "}
        <b className="float-right text-[#435349]">{inr(amount)}</b>
      </p>
    </article>
  );
}
