import { prisma } from "@/lib/prisma";
import { dueOccurrences, indiaToday } from "@/lib/recurring";

// Reconcile due rules when an account opens the workspace. The conditional
// update and unique occurrence key make retries safe for one-off transactions.
export async function materializeDueRecurring(
  userId: string,
  now = new Date(),
) {
  const today = indiaToday(now);
  const rules = await prisma.recurringTransaction.findMany({
    where: { userId, active: true, nextRunOn: { lte: today } },
    orderBy: { nextRunOn: "asc" },
  });
  let created = 0;
  for (const rule of rules) {
    const due = dueOccurrences(
      rule.nextRunOn,
      today,
      rule.frequency,
      rule.dayOfMonth,
    );
    if (!due.dates.length) continue;
    const count = await prisma.$transaction(async (db) => {
      const claim = await db.recurringTransaction.updateMany({
        where: {
          id: rule.id,
          userId,
          active: true,
          nextRunOn: rule.nextRunOn,
        },
        data: { nextRunOn: due.nextRunOn },
      });
      if (!claim.count) return 0;
      for (const date of due.dates) {
        await db.transaction.create({
          data: {
            userId,
            description: rule.description,
            amount: rule.amount,
            type: rule.type,
            category: rule.category,
            occurredAt: date,
            recurringRuleId: rule.id,
            recurrenceDate: date,
            isRecurring: true,
          },
        });
      }
      return due.dates.length;
    });
    created += count;
  }
  return created;
}
