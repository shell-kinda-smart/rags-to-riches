export function calculateSummary(
  rows: { type: "INCOME" | "EXPENSE"; amount: number }[],
  budget = 0,
) {
  const income = rows
    .filter((x) => x.type === "INCOME")
    .reduce((s, x) => s + x.amount, 0);
  const expense = rows
    .filter((x) => x.type === "EXPENSE")
    .reduce((s, x) => s + x.amount, 0);
  const balance = income - expense;
  const hasBudget = budget > 0;
  return {
    income,
    expense,
    balance,
    savingsRate: income > 0 ? Math.round((balance / income) * 100) : 0,
    budget,
    budgetRemaining: hasBudget ? budget - expense : 0,
    budgetUsed: hasBudget
      ? expense < budget
        ? Math.floor((expense / budget) * 100)
        : Math.round((expense / budget) * 100)
      : 0,
  };
}

// Goal deposits reserve recorded money; they are not a second expense.
export function calculateMoneyPosition(
  rows: { type: "INCOME" | "EXPENSE"; amount: number }[],
  goalSavings: number,
) {
  const summary = calculateSummary(rows);
  return {
    totalIncome: summary.income,
    totalExpenses: summary.expense,
    netBalance: summary.balance,
    goalSavings,
    availableToSpend: summary.balance - goalSavings,
  };
}

export function calculateGoalProgress(saved: number, target: number) {
  if (target <= 0 || saved <= 0) return { label: "0%", barWidth: 0 };
  const percentage = Math.min(100, (saved / target) * 100);
  return {
    label:
      saved > 0 && percentage < 1
        ? "<1%"
        : `${saved < target ? Math.min(99, Math.round(percentage)) : 100}%`,
    barWidth: saved > 0 ? Math.max(1, percentage) : 0,
  };
}

export const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
