import { auth } from "@/auth";
import { indiaDateInputValue } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user.id)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      createdAt: true,
      transactions: {
        orderBy: { occurredAt: "asc" },
        select: {
          description: true,
          amount: true,
          type: true,
          category: true,
          occurredAt: true,
          isRecurring: true,
        },
      },
      goals: {
        select: {
          name: true,
          targetAmount: true,
          savedAmount: true,
          targetDate: true,
          createdAt: true,
        },
      },
      budget: { select: { monthlyLimit: true } },
      recurringRules: {
        select: {
          description: true,
          amount: true,
          type: true,
          category: true,
          frequency: true,
          nextRunOn: true,
          active: true,
        },
      },
      lessonProgress: {
        select: { lessonKey: true, currentStep: true, completed: true },
      },
    },
  });
  if (!user)
    return Response.json({ error: "Account unavailable" }, { status: 404 });
  const body = JSON.stringify(
    {
      format: "rags-to-riches-account-v1",
      exportedAt: new Date().toISOString(),
      profile: {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      transactions: user.transactions.map((row) => ({
        ...row,
        amount: row.amount.toNumber(),
      })),
      goals: user.goals.map((goal) => ({
        ...goal,
        targetAmount: goal.targetAmount.toNumber(),
        savedAmount: goal.savedAmount.toNumber(),
      })),
      budget: user.budget
        ? { monthlyLimit: user.budget.monthlyLimit.toNumber() }
        : null,
      recurringRules: user.recurringRules.map((rule) => ({
        ...rule,
        amount: rule.amount.toNumber(),
      })),
      lessonProgress: user.lessonProgress,
    },
    null,
    2,
  );
  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="rags-account-${indiaDateInputValue(new Date())}.json"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
