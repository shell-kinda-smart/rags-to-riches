import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Pause,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import { auth } from "@/auth";
import {
  createRecurring,
  deleteRecurring,
  toggleRecurring,
  updateRecurring,
} from "@/app/actions";
import { CustomSelect } from "@/components/custom-select";
import { TransactionSelectors } from "@/components/transaction-selectors";
import { indiaDateInputValue } from "@/lib/dates";
import { inr } from "@/lib/finance";
import { prisma } from "@/lib/prisma";

export default async function RecurringPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const session = await auth();
  if (!session?.user.id) redirect("/signin");
  const [query, rules] = await Promise.all([
    searchParams,
    prisma.recurringTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: [{ active: "desc" }, { nextRunOn: "asc" }],
    }),
  ]);
  const today = indiaDateInputValue(new Date());
  return (
    <section className="page-shell">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/transactions"
            className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-[#207849]"
          >
            <ArrowLeft className="size-3.5" /> Transactions
          </Link>
          <h1 className="app-page-heading">Recurring entries</h1>
          <p className="app-page-subtitle">
            Set regular pocket money or bills once. Due entries are added when
            you open the app.
          </p>
        </div>
        <span className="rounded-full border border-[#d9e0da] bg-[#fbfaf5] px-3 py-1.5 text-xs text-[#526159]">
          {rules.filter((rule) => rule.active).length} active
        </span>
      </header>

      {query.error && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-[#e7c7b2] bg-[#f9eee5] px-4 py-3 text-xs text-[#8d492b]"
        >
          {query.error === "date"
            ? "Choose today or a date within the next year."
            : query.error === "missing"
              ? "That recurring plan is no longer in your account."
              : "Check the plan details and try again."}
        </p>
      )}
      {query.saved && (
        <p
          role="status"
          className="mt-3 rounded-lg border border-[#c5ddca] bg-[#e9f4eb] px-4 py-3 text-xs text-[#2e7048]"
        >
          Plan saved. A due entry will appear in your transaction history.
        </p>
      )}

      <div className="app-workspace-grid mt-4">
        <article className="card overflow-visible !bg-[#f4f0e7]">
          <div className="border-b border-[#dedbd2] p-5">
            <span className="icon-tile bg-[#d9ed70] text-[#174b35]">
              <CalendarClock className="size-[18px]" />
            </span>
            <h2 className="section-title mt-3">New recurring plan</h2>
            <p className="mt-1 text-xs leading-5 text-[#4d5d52]">
              For money that normally arrives or leaves on a schedule.
            </p>
          </div>
          <form action={createRecurring} className="space-y-4 p-5">
            <label className="block text-xs font-medium">
              Description
              <input
                className="mt-2"
                name="description"
                minLength={2}
                maxLength={80}
                required
                placeholder="e.g. Weekly pocket money"
              />
            </label>
            <TransactionSelectors initialType="INCOME" />
            <label className="block text-xs font-medium">
              Repeat
              <span className="mt-2 block">
                <CustomSelect
                  name="frequency"
                  ariaLabel="Repeat frequency"
                  defaultValue="WEEKLY"
                  options={[
                    { value: "WEEKLY", label: "Every week" },
                    { value: "MONTHLY", label: "Every month" },
                  ]}
                />
              </span>
            </label>
            <label className="block text-xs font-medium">
              First date
              <input
                className="mt-2"
                name="startDate"
                type="date"
                min={today}
                defaultValue={today}
                required
              />
            </label>
            <button className="btn btn-primary w-full">
              <Plus className="size-4" /> Create plan
            </button>
            <p className="text-[10px] leading-4 text-[#526158]">
              A plan creates normal ledger entries. You can edit or delete each
              generated entry separately.
            </p>
          </form>
        </article>

        <div className="grid content-start gap-3">
          {rules.map((rule) => (
            <article key={rule.id} className="card !bg-[#fbfaf5] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold">
                      {rule.description}
                    </h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${rule.active ? "bg-[#e3f0e7] text-[#207849]" : "bg-[#eeeae1] text-[#7a756b]"}`}
                    >
                      {rule.active ? "Active" : "Paused"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#4d5d52]">
                    {rule.frequency === "WEEKLY" ? "Weekly" : "Monthly"} ·{" "}
                    {rule.category} · Next {indiaDateInputValue(rule.nextRunOn)}
                  </p>
                </div>
                <b
                  className={`text-base ${rule.type === "INCOME" ? "text-[#207849]" : "text-[#b65b2e]"}`}
                >
                  {rule.type === "INCOME" ? "+" : "−"}
                  {inr(rule.amount.toNumber())}
                </b>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#e5e9e5] pt-4">
                <form action={toggleRecurring}>
                  <input type="hidden" name="id" value={rule.id} />
                  <input
                    type="hidden"
                    name="state"
                    value={rule.active ? "pause" : "resume"}
                  />
                  <button className="btn btn-secondary !min-h-9 text-xs">
                    {rule.active ? (
                      <Pause className="size-3.5" />
                    ) : (
                      <Play className="size-3.5" />
                    )}
                    {rule.active ? "Pause" : "Resume"}
                  </button>
                </form>
                <details className="relative">
                  <summary className="btn btn-secondary !min-h-9 text-xs">
                    Edit plan
                  </summary>
                  <div className="mt-3 w-full rounded-lg border border-[#d9e0da] bg-[#f4f0e7] p-4 sm:min-w-[24rem]">
                    <form action={updateRecurring} className="space-y-3">
                      <input type="hidden" name="id" value={rule.id} />
                      <label className="block text-xs font-medium">
                        Description
                        <input
                          className="mt-1.5"
                          name="description"
                          defaultValue={rule.description}
                          required
                        />
                      </label>
                      <TransactionSelectors
                        initialType={rule.type}
                        initialAmount={rule.amount.toNumber()}
                        initialCategory={rule.category}
                      />
                      <label className="block text-xs font-medium">
                        Repeat
                        <span className="mt-1.5 block">
                          <CustomSelect
                            name="frequency"
                            ariaLabel="Repeat frequency"
                            defaultValue={rule.frequency}
                            options={[
                              { value: "WEEKLY", label: "Every week" },
                              { value: "MONTHLY", label: "Every month" },
                            ]}
                          />
                        </span>
                      </label>
                      <label className="block text-xs font-medium">
                        Next date
                        <input
                          className="mt-1.5"
                          name="startDate"
                          type="date"
                          min={today}
                          defaultValue={
                            rule.nextRunOn < new Date(`${today}T00:00:00Z`)
                              ? today
                              : indiaDateInputValue(rule.nextRunOn)
                          }
                          required
                        />
                      </label>
                      <p className="text-[10px] leading-4 text-[#4d5d52]">
                        Changing a plan only affects future entries. Past
                        transactions stay in your ledger.
                      </p>
                      <button className="btn btn-primary w-full">
                        Save changes
                      </button>
                    </form>
                  </div>
                </details>
                <details className="ml-auto">
                  <summary className="text-xs font-medium text-[#a44a3c]">
                    Delete plan
                  </summary>
                  <form
                    action={deleteRecurring}
                    className="mt-2 flex items-center gap-2"
                  >
                    <input type="hidden" name="id" value={rule.id} />
                    <span className="text-[10px] text-[#4d5d52]">
                      Keep past entries?
                    </span>
                    <button className="inline-flex items-center gap-1 text-xs font-semibold text-[#a44a3c]">
                      <Trash2 className="size-3.5" /> Confirm delete
                    </button>
                  </form>
                </details>
              </div>
            </article>
          ))}
          {!rules.length && (
            <article className="card grid min-h-48 place-items-center p-6 text-center">
              <div>
                <CalendarClock className="mx-auto size-7 text-[#5b8063]" />
                <h2 className="mt-3 text-sm font-semibold">
                  No recurring plans yet
                </h2>
                <p className="mt-1 text-xs text-[#4d5d52]">
                  Create one for predictable pocket money, earnings or bills.
                </p>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
