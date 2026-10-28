"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

type Option = { value: string; label: string };

export function CustomSelect({
  name,
  options,
  defaultValue,
  ariaLabel,
  tone = "neutral",
  onValueChange,
}: {
  name: string;
  options: Option[];
  defaultValue?: string;
  ariaLabel: string;
  tone?: "neutral" | "income" | "expense";
  onValueChange?: (value: string) => void;
}) {
  const initial =
    options.find((option) => option.value === defaultValue) ?? options[0];
  const [selected, setSelected] = useState(initial);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={selected.value} />
      <button
        type="button"
        aria-label={`${ariaLabel}: ${selected.label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        data-tone={tone}
        className={`custom-select-trigger ${open ? "is-open" : ""}`}
      >
        <span>{selected.label}</span>
        <ChevronDown
          className={`size-4 text-[#4d5d52] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="custom-select-menu" role="listbox">
          {options.map((option) => {
            const active = selected.value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setSelected(option);
                  setOpen(false);
                  onValueChange?.(option.value);
                }}
                className={`custom-select-option ${active ? "is-selected" : ""}`}
              >
                <span>{option.label}</span>
                {active && <Check className="size-4" strokeWidth={2.2} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
