"use client";

import { useRef } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { deleteGoal, updateGoal } from "@/app/actions";

export function GoalActions({
  goal,
}: {
  goal: {
    id: string;
    name: string;
    targetAmount: number;
    savedAmount: number;
    targetDate: string;
  };
}) {
  const editDialog = useRef<HTMLDialogElement>(null);
  const deleteDialog = useRef<HTMLDialogElement>(null);
  const closeOnBackdrop = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  };

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        onClick={() => editDialog.current?.showModal()}
        aria-label={`Edit ${goal.name}`}
        className="grid size-8 place-items-center rounded-lg text-[#526b5b] transition hover:bg-white/70 hover:text-[#176944] focus-visible:outline-2 focus-visible:outline-[#207849]"
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => deleteDialog.current?.showModal()}
        aria-label={`Delete ${goal.name}`}
        className="grid size-8 place-items-center rounded-lg text-[#806f67] transition hover:bg-[#f7e7e3] hover:text-[#b9483f] focus-visible:outline-2 focus-visible:outline-[#b9483f]"
      >
        <Trash2 className="size-4" />
      </button>

      <dialog
        ref={editDialog}
        onClick={closeOnBackdrop}
        className="record-dialog"
        aria-labelledby={`edit-goal-${goal.id}`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#e0e6df] px-5 py-4">
          <div>
            <p className="eyebrow">SAVINGS GOAL</p>
            <h2 id={`edit-goal-${goal.id}`} className="section-title mt-1">
              Edit goal
            </h2>
          </div>
          <button
            type="button"
            onClick={() => editDialog.current?.close()}
            aria-label="Close edit dialog"
            className="record-dialog-close"
          >
            <X className="size-4" />
          </button>
        </div>
        <form
          action={updateGoal}
          onSubmit={() => editDialog.current?.close()}
          className="space-y-4 p-5"
        >
          <input type="hidden" name="id" value={goal.id} />
          <label className="block text-xs font-semibold text-[#526159]">
            Goal name
            <input
              className="mt-2"
              name="name"
              required
              minLength={2}
              maxLength={60}
              defaultValue={goal.name}
            />
          </label>
          <label className="block text-xs font-semibold text-[#526159]">
            Target amount (₹)
            <input
              className="mt-2"
              name="targetAmount"
              type="number"
              min={Math.max(1, goal.savedAmount)}
              max="100000000"
              required
              defaultValue={goal.targetAmount}
            />
          </label>
          <label className="block text-xs font-semibold text-[#526159]">
            Target date (optional)
            <input
              className="mt-2"
              name="targetDate"
              type="date"
              defaultValue={goal.targetDate}
            />
          </label>
          <p className="text-[11px] leading-5 text-[#647168]">
            ₹{goal.savedAmount.toLocaleString("en-IN")} is already set aside.
            Use Deposit or Release to change that amount.
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => editDialog.current?.close()}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button className="btn btn-primary">Save changes</button>
          </div>
        </form>
      </dialog>

      <dialog
        ref={deleteDialog}
        onClick={closeOnBackdrop}
        className="record-dialog"
        aria-labelledby={`delete-goal-${goal.id}`}
      >
        <div className="p-5">
          <h2 id={`delete-goal-${goal.id}`} className="section-title">
            Delete savings goal?
          </h2>
          <p className="mt-2 text-xs leading-5 text-[#647168]">
            “{goal.name}” will be removed. ₹
            {goal.savedAmount.toLocaleString("en-IN")} set aside for it will
            become available to spend again. No income or expense record is
            created. This cannot be undone.
          </p>
          <form
            action={deleteGoal}
            onSubmit={() => deleteDialog.current?.close()}
            className="mt-5 flex justify-end gap-2"
          >
            <input type="hidden" name="id" value={goal.id} />
            <button
              type="button"
              onClick={() => deleteDialog.current?.close()}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button className="btn border border-[#b9483f] bg-[#b9483f] text-white hover:bg-[#963930]">
              Delete goal
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
}
