import Image from "next/image";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  CircleDollarSign,
  Flag,
  Goal,
  PiggyBank,
  Plus,
  Target,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateGoalProgress,
  calculateMoneyPosition,
  inr,
} from "@/lib/finance";
import { addGoal, depositGoal, releaseGoalSavings } from "@/app/actions";
import { GoalActions } from "@/components/goal-actions";
import { indiaDateInputValue } from "@/lib/dates";

const depositErrors: Record<string, string> = {
  "goal-invalid": "Enter a goal name and a valid target amount.",
  "deposit-invalid": "Enter a valid deposit amount greater than zero.",
  "release-invalid": "Enter a valid amount to release.",
  target: "This deposit is larger than the amount left to fund the goal.",
  missing:
    "That savings goal could not be found. Refresh the page and try again.",
  release: "You cannot release more than you have saved in this goal.",
  "below-saved":
    "The target cannot be less than the amount already saved. Release some savings first.",
};

export default async function Goals({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session?.user.id) redirect("/signin");
  const [{ error }, goals, transactions] = await Promise.all([
    searchParams,
    prisma.goal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      select: { type: true, amount: true },
    }),
  ]);
  const totalSaved = goals.reduce(
    (sum, goal) => sum + goal.savedAmount.toNumber(),
    0,
  );
  const totalTarget = goals.reduce(
    (sum, goal) => sum + goal.targetAmount.toNumber(),
    0,
  );
  const overall = calculateGoalProgress(totalSaved, totalTarget);
  const moneyPosition = calculateMoneyPosition(
    transactions.map((row) => ({
      type: row.type,
      amount: row.amount.toNumber(),
    })),
    totalSaved,
  );
  const { availableToSpend } = moneyPosition;
  const errorMessage =
    error === "insufficient"
      ? `Only ${inr(Math.max(0, availableToSpend))} is free to set aside. A deposit adds to what is already saved in the goal; record more income, release savings, or enter a smaller amount.`
      : error
        ? depositErrors[error]
        : undefined;

  return (
    <section className="page-shell">
      <header>
        <h1 className="app-page-heading">Savings goals</h1>
        <p className="app-page-subtitle">
          Set a target and move part of your recorded money into savings.
        </p>
      </header>

      {errorMessage && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-[#e7c7b2] bg-[#f9eee5] px-4 py-3 text-xs text-[#8d492b]"
        >
          {errorMessage}
        </p>
      )}

      <div className="app-summary-grid mt-4">
        <article className="card relative overflow-hidden !border-[#174b35] !bg-[#174b35] p-5 text-white sm:p-6">
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[.1em] text-[#d9ed70]">
                All savings goals
              </p>
              <b className="mt-3 block text-3xl font-semibold tracking-[-.045em]">
                {inr(totalSaved)}
              </b>
              <p className="mt-2 text-xs text-white/85">
                set aside across {goals.length}{" "}
                {goals.length === 1 ? "goal" : "goals"}
              </p>
              <p className="mt-3 text-xs text-white/85">
                Available to set aside: <b>{inr(availableToSpend)}</b>
              </p>
            </div>
            <div className="min-w-48">
              <div className="flex items-center justify-between text-[10px] font-semibold">
                <span className="text-white/85">Overall completion</span>
                <span>{overall.label}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                <i
                  className="block h-full rounded-full bg-[#d9ed70]"
                  style={{ width: `${overall.barWidth}%` }}
                />
              </div>
              <p className="mt-3 text-[10px] text-white/85">
                {inr(Math.max(0, totalTarget - totalSaved))} left to fund
              </p>
            </div>
          </div>
        </article>
        <article className="card relative min-h-40 overflow-hidden">
          <Image
            src="/images/savings-goal.jpg"
            alt="Piggy bank beside a savings target"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 30vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#102b20]/85 via-[#102b20]/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <p className="text-[9px] font-medium uppercase tracking-[.1em] text-[#d9ed70]">
              Current target
            </p>
            <b className="mt-1 block text-base">
              {goals[0]?.name || "Create your first goal"}
            </b>
          </div>
        </article>
      </div>

      <p className="mt-2 text-[11px] text-[#4d5d52]">
        Income {inr(moneyPosition.totalIncome)} − expenses{" "}
        {inr(moneyPosition.totalExpenses)} − goal savings {inr(totalSaved)} ={" "}
        {inr(availableToSpend)} free to spend. A deposit is not an expense.
      </p>
      {availableToSpend < 0 && (
        <p
          role="alert"
          className="mt-2 rounded-lg border border-[#e7c7b2] bg-[#f9eee5] px-4 py-3 text-xs text-[#8d492b]"
        >
          {totalSaved > 0
            ? `Expenses and goal savings together exceed recorded income by ${inr(Math.abs(availableToSpend))}. Review transactions or release savings before depositing more.`
            : `Expenses exceed recorded income by ${inr(Math.abs(availableToSpend))}. Review transactions or record missing income before depositing.`}
        </p>
      )}

      <div className="app-workspace-grid mt-3">
        <article className="card overflow-hidden !bg-[#f4f0e7] lg:sticky lg:top-24">
          <div className="border-b border-[#dedbd2] p-5">
            <div className="flex items-center gap-3">
              <span className="icon-tile bg-[#d9ed70] text-[#174b35]">
                <Target className="size-[18px]" />
              </span>
              <div>
                <p className="eyebrow">NEW MILESTONE</p>
                <h2 className="section-title mt-1">Create a savings goal</h2>
              </div>
            </div>
          </div>
          <form action={addGoal} className="space-y-4 p-5">
            <FormField icon={Flag} label="Goal name">
              <input name="name" required placeholder="e.g. New laptop" />
            </FormField>
            <FormField icon={CircleDollarSign} label="Target amount">
              <input
                name="targetAmount"
                type="number"
                min="1"
                required
                placeholder="₹ 30,000"
              />
            </FormField>
            <FormField icon={CalendarDays} label="Target date">
              <input name="targetDate" type="date" />
            </FormField>
            <button className="btn btn-primary w-full">
              <Plus className="size-4" /> Create goal
            </button>
          </form>
        </article>

        <div className="grid gap-3 sm:grid-cols-2">
          {goals.map((goal) => {
            const saved = goal.savedAmount.toNumber();
            const target = goal.targetAmount.toNumber();
            const progress = calculateGoalProgress(saved, target);
            const depositLimit = Math.max(
              0,
              Math.min(availableToSpend, target - saved),
            );
            const canDeposit = depositLimit >= 1;
            const canRelease = saved >= 1;
            return (
              <article
                key={goal.id}
                className="card card-interactive overflow-hidden !bg-[#edf2ec] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="icon-tile bg-white/70 text-[#207849]">
                    <PiggyBank className="size-[18px]" />
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="rounded-md bg-white/70 px-2.5 py-1 text-[9px] font-bold text-[#526159]">
                      {progress.label} funded
                    </span>
                    <GoalActions
                      goal={{
                        id: goal.id,
                        name: goal.name,
                        targetAmount: target,
                        savedAmount: saved,
                        targetDate: goal.targetDate
                          ? indiaDateInputValue(goal.targetDate)
                          : "",
                      }}
                    />
                  </div>
                </div>
                <h2 className="mt-4 text-lg font-semibold tracking-[-.03em]">
                  {goal.name}
                </h2>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] text-[#869189]">Saved</p>
                    <b className="mt-1 block text-2xl tracking-[-.045em]">
                      {inr(saved)}
                    </b>
                  </div>
                  <p className="text-right text-[10px] text-[#929c96]">
                    of
                    <br />
                    <b className="text-xs text-[#5e6d64]">{inr(target)}</b>
                  </p>
                </div>
                <div className="progress mt-4">
                  <i style={{ width: `${progress.barWidth}%` }} />
                </div>
                {goal.targetDate && (
                  <p className="mt-3 flex items-center gap-1.5 text-[10px] text-[#7d8982]">
                    <CalendarDays className="size-3.5" /> Target{" "}
                    {goal.targetDate.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
                <form
                  action={depositGoal}
                  className="mt-4 flex flex-wrap gap-2 border-t border-[#dce6dd] pt-4"
                >
                  <input type="hidden" name="goalId" value={goal.id} />
                  <input
                    name="amount"
                    type="number"
                    min="1"
                    placeholder="Amount in ₹"
                    disabled={!canDeposit && !canRelease}
                    required
                    className="w-full sm:min-w-28 sm:flex-1"
                  />
                  <button
                    className="btn btn-primary flex-1 px-3 sm:flex-none"
                    disabled={!canDeposit}
                  >
                    <Plus className="size-4" />
                    <span>Deposit</span>
                  </button>
                  <button
                    formAction={releaseGoalSavings}
                    className="btn btn-secondary flex-1 px-3 sm:flex-none"
                    disabled={!canRelease}
                  >
                    Release
                  </button>
                </form>
                <p className="mt-2 text-[10px] text-[#4d5d52]">
                  Deposit up to {inr(depositLimit)} · Release up to {inr(saved)}
                </p>
                {!canDeposit && (
                  <p className="mt-2 text-[10px] text-[#4d5d52]">
                    {saved >= target
                      ? "Goal fully funded."
                      : "Record more income or release another goal before depositing."}
                  </p>
                )}
              </article>
            );
          })}
          {!goals.length && (
            <div className="card grid min-h-48 place-items-center !bg-[#edf2ec] p-6 text-center sm:col-span-2">
              <div>
                <span className="icon-tile mx-auto bg-[#e8f4cf] text-[#55762f]">
                  <Goal className="size-5" />
                </span>
                <b className="mt-4 block text-sm">
                  Your first milestone starts here
                </b>
                <p className="mt-1 text-xs text-[#526158]">
                  Create a goal using the form.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FormField({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Flag;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="mb-2 flex items-center gap-1.5">
        <Icon className="size-3.5 text-[#207849]" />
        {label}
      </span>
      {children}
    </label>
  );
}
