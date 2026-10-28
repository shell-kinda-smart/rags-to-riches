import { auth } from "@/auth";
import { indiaDateInputValue } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { dateOnly } from "@/lib/recurring";
import { transactionsCsv } from "@/lib/reports";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user.id)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  try {
    if (from) dateOnly(from);
    if (to) dateOnly(to);
    if (from && to && from > to) throw new Error("Invalid range");
  } catch {
    return Response.json({ error: "Invalid date range" }, { status: 400 });
  }
  const rows = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      ...(from || to
        ? {
            occurredAt: {
              ...(from ? { gte: new Date(`${from}T00:00:00.000Z`) } : {}),
              ...(to
                ? { lt: new Date(Date.parse(`${to}T00:00:00.000Z`) + 86400000) }
                : {}),
            },
          }
        : {}),
    },
    orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
  });
  const csv = transactionsCsv(
    rows.map((row) => ({
      occurredAt: row.occurredAt,
      type: row.type,
      category: row.category,
      description: row.description,
      amount: row.amount.toNumber(),
      recurring: row.isRecurring,
    })),
  );
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rags-transactions-${indiaDateInputValue(new Date())}.csv"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
