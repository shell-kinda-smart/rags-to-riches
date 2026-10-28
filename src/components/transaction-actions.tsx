"use client";

import { useRef } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { deleteTransaction, updateTransaction } from "@/app/actions";
import { TransactionSelectors } from "@/components/transaction-selectors";

export function TransactionActions({
  transaction,
}: {
  transaction: {
    id: string;
    description: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    category: string;
    occurredAt: string;
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
        aria-label={`Edit ${transaction.description}`}
        className="grid size-8 place-items-center rounded-lg text-[#63766a] transition hover:bg-[#e8f1e9] hover:text-[#176944] focus-visible:outline-2 focus-visible:outline-[#207849]"
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => deleteDialog.current?.showModal()}
        aria-label={`Delete ${transaction.description}`}
        className="grid size-8 place-items-center rounded-lg text-[#877770] transition hover:bg-[#f7e7e3] hover:text-[#b9483f] focus-visible:outline-2 focus-visible:outline-[#b9483f]"
      >
        <Trash2 className="size-4" />
      </button>

      <dialog
        ref={editDialog}
        onClick={closeOnBackdrop}
        className="record-dialog"
        aria-labelledby={`edit-transaction-${transaction.id}`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#e0e6df] px-5 py-4">
          <div>
            <p className="eyebrow">TRANSACTION</p>
            <h2
              id={`edit-transaction-${transaction.id}`}
              className="section-title mt-1"
            >
              Edit entry
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
          action={updateTransaction}
          onSubmit={() => editDialog.current?.close()}
          className="space-y-4 p-5"
        >
          <input type="hidden" name="id" value={transaction.id} />
          <label className="block text-xs font-semibold text-[#526159]">
            Description
            <input
              className="mt-2"
              name="description"
              required
              minLength={2}
              maxLength={80}
              defaultValue={transaction.description}
            />
          </label>
          <TransactionSelectors
            initialType={transaction.type}
            initialAmount={transaction.amount}
            initialCategory={transaction.category}
          />
          <label className="block text-xs font-semibold text-[#526159]">
            Date
            <input
              className="mt-2"
              name="occurredAt"
              type="date"
              required
              defaultValue={transaction.occurredAt}
            />
          </label>
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
        aria-labelledby={`delete-transaction-${transaction.id}`}
      >
        <div className="p-5">
          <h2
            id={`delete-transaction-${transaction.id}`}
            className="section-title"
          >
            Delete transaction?
          </h2>
          <p className="mt-2 text-xs leading-5 text-[#647168]">
            “{transaction.description}” will be removed. Your balance, budget
            and goal availability will recalculate. This cannot be undone.
          </p>
          <form
            action={deleteTransaction}
            onSubmit={() => deleteDialog.current?.close()}
            className="mt-5 flex justify-end gap-2"
          >
            <input type="hidden" name="id" value={transaction.id} />
            <button
              type="button"
              onClick={() => deleteDialog.current?.close()}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button className="btn border border-[#b9483f] bg-[#b9483f] text-white hover:bg-[#963930]">
              Delete transaction
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
}
