"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleDollarSign,
  Layers3,
} from "lucide-react";
import { CustomSelect } from "@/components/custom-select";

const incomeCategories = ["Pocket Money", "Part-time Work", "Other"];
const expenseCategories = ["Food", "Travel", "Study", "Entertainment", "Other"];

export function TransactionSelectors({
  initialType,
  initialAmount,
  initialCategory,
}: {
  initialType: "INCOME" | "EXPENSE";
  initialAmount?: number;
  initialCategory?: string;
}) {
  const [type, setType] = useState(initialType);
  const expense = type === "EXPENSE";
  const TypeIcon = expense ? ArrowUpRight : ArrowDownLeft;
  const categories = expense ? expenseCategories : incomeCategories;
  const tone = expense ? "expense" : "income";

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="mb-2 flex items-center gap-1.5">
            <CircleDollarSign className="size-3.5 text-[#207849]" />
            Amount
          </span>
          <input
            name="amount"
            type="number"
            min="1"
            required
            placeholder="₹ 0"
            defaultValue={initialAmount}
          />
        </div>
        <div>
          <span className="mb-2 flex items-center gap-1.5">
            <TypeIcon
              className={`size-3.5 ${expense ? "text-[#b65b2e]" : "text-[#207849]"}`}
            />
            Transaction type
          </span>
          <CustomSelect
            name="type"
            ariaLabel="Transaction type"
            defaultValue={type}
            tone={tone}
            onValueChange={(value) =>
              setType(value === "EXPENSE" ? "EXPENSE" : "INCOME")
            }
            options={[
              { value: "INCOME", label: "Income · money received" },
              { value: "EXPENSE", label: "Expense · money spent" },
            ]}
          />
        </div>
      </div>
      <div>
        <span className="mb-2 flex items-center gap-1.5">
          <Layers3
            className={`size-3.5 ${expense ? "text-[#b65b2e]" : "text-[#207849]"}`}
          />
          Category
        </span>
        <CustomSelect
          key={type}
          name="category"
          ariaLabel="Transaction category"
          defaultValue={
            categories.includes(initialCategory ?? "")
              ? initialCategory
              : categories[0]
          }
          tone={tone}
          options={categories.map((category) => ({
            value: category,
            label: category,
          }))}
        />
      </div>
      <p
        className={`-mt-1 rounded-md px-2.5 py-2 text-[10px] leading-4 ${expense ? "bg-[#fff0e8] text-[#94502e]" : "bg-[#e7f3e9] text-[#2f6e49]"}`}
      >
        {expense
          ? "Expense is selected. This amount will reduce your balance."
          : "Income is selected. This amount will increase your balance."}
      </p>
    </>
  );
}
