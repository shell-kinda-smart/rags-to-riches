import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BudgetState } from "@/lib/financial-alerts";
import { inr } from "@/lib/finance";

const styles = {
  watch: {
    wrap: "border-[#dfc47c] bg-[#f8f0d8] text-[#6f5717]",
    accent: "bg-[#b88722]",
  },
  near: {
    wrap: "border-[#ddb083] bg-[#f8eadc] text-[#81471f]",
    accent: "bg-[#c46b35]",
  },
  reached: {
    wrap: "border-[#d9a29c] bg-[#f5e5e2] text-[#81332e]",
    accent: "bg-[#a7433c]",
  },
  exceeded: {
    wrap: "border-[#d0938d] bg-[#f3dfdc] text-[#7f2f2a]",
    accent: "bg-[#963a34]",
  },
} as const;

export function BudgetAlert({
  state,
  budgetUsed,
  budgetRemaining,
}: {
  state: Exclude<BudgetState, "not-set" | "safe">;
  budgetUsed: number;
  budgetRemaining: number;
}) {
  const style = styles[state];
  const content =
    state === "exceeded"
      ? {
          title: "You are over your monthly budget",
          copy: `${budgetUsed}% used · ${inr(Math.abs(budgetRemaining))} over the limit`,
        }
      : state === "reached"
        ? {
            title: "You have reached your monthly budget",
            copy: "100% used · Pause non-essential spending for the rest of the month",
          }
        : state === "near"
          ? {
              title: "You are very close to your budget limit",
              copy: `${budgetUsed}% used · ${inr(budgetRemaining)} remaining`,
            }
          : {
              title: "Your spending is approaching the limit",
              copy: `${budgetUsed}% used · ${inr(budgetRemaining)} remaining`,
            };

  return (
    <aside
      role="alert"
      className={`mt-3 w-full max-w-[36rem] rounded-lg border ${style.wrap}`}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        <i className={`h-9 w-1 shrink-0 rounded-full ${style.accent}`} />
        <div className="min-w-0 flex-1">
          <b className="block text-xs font-semibold">{content.title}</b>
          <p className="mt-0.5 text-[10px] opacity-80">{content.copy}</p>
        </div>
        <Link
          href="/budget"
          className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-colors hover:bg-black/5"
        >
          View budget <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </aside>
  );
}
