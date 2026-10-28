const indiaTimeZone = "Asia/Kolkata";

export function indiaDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: indiaTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: Number(value("hour")),
  };
}

export function indiaDateInputValue(date: Date) {
  const { year, month, day } = indiaDateParts(date);
  return `${year}-${month}-${day}`;
}

export function indiaMonthKey(date: Date) {
  const { year, month } = indiaDateParts(date);
  return `${year}-${month}`;
}

export function indiaMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: indiaTimeZone,
    month: "long",
    year: "numeric",
  }).format(date);
}

export function indiaGreeting(date: Date) {
  const hour = indiaDateParts(date).hour;
  return hour < 12
    ? "Good morning"
    : hour < 17
      ? "Good afternoon"
      : "Good evening";
}
