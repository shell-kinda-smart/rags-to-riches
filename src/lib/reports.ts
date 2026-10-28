import { indiaMonthKey } from "./dates";

export function monthKeys(count: number, now = new Date()) {
  if (!Number.isInteger(count) || count < 1 || count > 24)
    throw new Error("Invalid month count");
  const current = indiaMonthKey(now);
  const [year, month] = current.split("-").map(Number);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(year, month - count + index, 1));
    return date.toISOString().slice(0, 7);
  });
}

export function monthlyReport(
  rows: { type: "INCOME" | "EXPENSE"; amount: number; occurredAt: Date }[],
  months: string[],
) {
  const summary = new Map(
    months.map((key) => [key, { month: key, income: 0, expense: 0, net: 0 }]),
  );
  for (const row of rows) {
    const entry = summary.get(indiaMonthKey(row.occurredAt));
    if (!entry) continue;
    if (row.type === "INCOME") entry.income += row.amount;
    else entry.expense += row.amount;
    entry.net = entry.income - entry.expense;
  }
  return [...summary.values()];
}

export function csvCell(value: string | number) {
  const text = String(value);
  const safe = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function transactionsCsv(
  rows: {
    occurredAt: Date;
    type: "INCOME" | "EXPENSE";
    category: string;
    description: string;
    amount: number;
    recurring: boolean;
  }[],
) {
  const header = [
    "Date",
    "Type",
    "Category",
    "Description",
    "Amount (INR)",
    "Source",
  ];
  const lines = rows.map((row) => [
    row.occurredAt.toISOString().slice(0, 10),
    row.type,
    row.category,
    row.description,
    row.amount,
    row.recurring ? "Recurring" : "Manual",
  ]);
  return `\uFEFF${[header, ...lines].map((line) => line.map(csvCell).join(",")).join("\r\n")}\r\n`;
}
