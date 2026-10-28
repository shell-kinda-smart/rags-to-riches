import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { indiaToday } from "@/lib/recurring";
import { materializeDueRecurring } from "@/lib/recurring-engine";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret ?? ""}`);
  if (
    !secret ||
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  )
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const accounts = await prisma.recurringTransaction.findMany({
    where: { active: true, nextRunOn: { lte: indiaToday(now) } },
    select: { userId: true },
    distinct: ["userId"],
  });
  let posted = 0;
  for (const account of accounts)
    posted += await materializeDueRecurring(account.userId, now);
  return Response.json(
    { checkedAccounts: accounts.length, posted },
    { headers: { "Cache-Control": "no-store" } },
  );
}
