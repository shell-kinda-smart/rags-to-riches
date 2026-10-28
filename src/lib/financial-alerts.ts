import { inr } from "./finance";

export type AlertTone = "info" | "success" | "warning" | "danger";
export type BudgetState =
  "not-set" | "safe" | "watch" | "near" | "reached" | "exceeded";

export type FinancialAlert = {
  id: string;
  kind: "budget" | "cashflow" | "savings" | "setup";
  tone: AlertTone;
  title: string;
  message: string;
  href: "/budget" | "/transactions" | "/goals";
};

export function getBudgetState(budget: number, expense: number): BudgetState {
  if (budget <= 0) return "not-set";
  if (expense > budget) return "exceeded";
  if (expense === budget) return "reached";

  const used = (expense / budget) * 100;
  if (used >= 90) return "near";
  if (used >= 70) return "watch";
  return "safe";
}

export function getFinancialAlerts(
  summary: {
    income: number;
    expense: number;
    balance: number;
    savingsRate: number;
    budget: number;
    budgetRemaining: number;
    budgetUsed: number;
  },
  position?: { availableToSpend: number; goalSavings: number },
): FinancialAlert[] {
  const alerts: FinancialAlert[] = [];
  const budgetState = getBudgetState(summary.budget, summary.expense);

  if (budgetState === "exceeded") {
    alerts.push({
      id: "budget-exceeded",
      kind: "budget",
      tone: "danger",
      title: "Monthly budget exceeded",
      message: `You are ${inr(Math.abs(summary.budgetRemaining))} over your limit. Review recent spending now.`,
      href: "/budget",
    });
  } else if (budgetState === "reached") {
    alerts.push({
      id: "budget-reached",
      kind: "budget",
      tone: "danger",
      title: "Monthly budget reached",
      message:
        "The full spending limit has been used. New expenses will put you over budget.",
      href: "/budget",
    });
  } else if (budgetState === "near") {
    alerts.push({
      id: "budget-near",
      kind: "budget",
      tone: "warning",
      title: "Very close to your limit",
      message: `Only ${inr(summary.budgetRemaining)} remains in this month’s budget.`,
      href: "/budget",
    });
  } else if (budgetState === "watch") {
    alerts.push({
      id: "budget-watch",
      kind: "budget",
      tone: "warning",
      title: "Spending is approaching the limit",
      message: `${summary.budgetUsed}% of your monthly budget is already used.`,
      href: "/budget",
    });
  } else if (budgetState === "not-set" && summary.expense > 0) {
    alerts.push({
      id: "budget-missing",
      kind: "setup",
      tone: "info",
      title: "Set a monthly spending limit",
      message: `You have spent ${inr(summary.expense)} this month without a budget.`,
      href: "/budget",
    });
  }

  if (summary.expense > 0 && summary.balance < 0) {
    alerts.push({
      id: "negative-cashflow",
      kind: "cashflow",
      tone: "danger",
      title: "Expenses are higher than income",
      message: `Spending exceeds this month’s income by ${inr(Math.abs(summary.balance))}.`,
      href: "/transactions",
    });
  } else if (
    summary.income > 0 &&
    summary.expense > 0 &&
    summary.savingsRate < 20
  ) {
    alerts.push({
      id: "savings-rate-low",
      kind: "savings",
      tone: "warning",
      title: "Unspent rate is below target",
      message: `You have ${summary.savingsRate}% of this month’s income left after expenses; the suggested starting target is 20%.`,
      href: "/transactions",
    });
  }

  if (position && position.goalSavings > 0 && position.availableToSpend < 0) {
    alerts.push({
      id: "goal-savings-shortfall",
      kind: "savings",
      tone: "danger",
      title: "Goal savings exceed recorded money",
      message: `${inr(Math.abs(position.availableToSpend))} is set aside beyond your current recorded balance. Release goal savings or record missing income.`,
      href: "/goals",
    });
  }

  return alerts;
}
