import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { indiaMonthKey, indiaMonthLabel } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { calculateMoneyPosition, calculateSummary } from "@/lib/finance";
export async function GET() {
  const session = await auth();
  if (!session?.user.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [rows, budget, goals] = await Promise.all([
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
  const monthly = calculateSummary(
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
  return NextResponse.json({
    period: indiaMonthLabel(now),
    ...monthly,
    netBalance: position.netBalance,
    goalSavings: position.goalSavings,
    availableToSpend: position.availableToSpend,
    availableBalance: position.availableToSpend,
  });
}
