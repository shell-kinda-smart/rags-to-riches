import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/sidebar";
import { indiaMonthKey } from "@/lib/dates";
import { calculateMoneyPosition, calculateSummary } from "@/lib/finance";
import { getFinancialAlerts } from "@/lib/financial-alerts";
import { prisma } from "@/lib/prisma";
import { materializeDueRecurring } from "@/lib/recurring-engine";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  const now = new Date();
  await materializeDueRecurring(session.user.id, now);
  const monthKey = indiaMonthKey(now);
  const [rows, budget, goals] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      select: { type: true, amount: true, occurredAt: true },
    }),
    prisma.budget.findUnique({ where: { userId: session.user.id } }),
    prisma.goal.findMany({
      where: { userId: session.user.id },
      select: { savedAmount: true },
    }),
  ]);
  const monthRows = rows.filter(
    (row) => indiaMonthKey(row.occurredAt) === monthKey,
  );
  const summary = calculateSummary(
    monthRows.map((row) => ({
      type: row.type,
      amount: row.amount.toNumber(),
    })),
    budget?.monthlyLimit.toNumber() || 0,
  );
  const position = calculateMoneyPosition(
    rows.map((row) => ({ type: row.type, amount: row.amount.toNumber() })),
    goals.reduce((sum, goal) => sum + goal.savedAmount.toNumber(), 0),
  );
  const alerts = getFinancialAlerts(summary, position);
  return (
    <>
      <Sidebar
        name={session.user.name}
        email={session.user.email}
        alerts={alerts}
        alertPeriod={monthKey}
      />
      <main className="app-main min-h-screen pb-20 lg:ml-[232px] lg:pb-0">
        {children}
      </main>
    </>
  );
}
