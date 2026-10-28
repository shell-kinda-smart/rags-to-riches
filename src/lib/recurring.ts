import { indiaDateInputValue } from "./dates";

export type Frequency = "WEEKLY" | "MONTHLY";

export function dateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Invalid date");
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  )
    throw new Error("Invalid date");
  return parsed;
}

export function indiaToday(now = new Date()) {
  return dateOnly(indiaDateInputValue(now));
}

export function advanceRecurringDate(
  date: Date,
  frequency: Frequency,
  dayOfMonth?: number | null,
) {
  if (frequency === "WEEKLY") {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + 7);
    return next;
  }
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(
    Date.UTC(year, month, Math.min(dayOfMonth ?? date.getUTCDate(), lastDay)),
  );
}

export function dueOccurrences(
  nextRunOn: Date,
  through: Date,
  frequency: Frequency,
  dayOfMonth?: number | null,
  maximum = 36,
) {
  const dates: Date[] = [];
  let next = new Date(nextRunOn);
  while (next <= through && dates.length < maximum) {
    dates.push(next);
    next = advanceRecurringDate(next, frequency, dayOfMonth);
  }
  return { dates, nextRunOn: next };
}
