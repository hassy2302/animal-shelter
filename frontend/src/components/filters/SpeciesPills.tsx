"use client";

import { SPECIES_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SpeciesPillsProps {
  value: string;
  onChange: (v: string) => void;
}

export default function SpeciesPills({ value, onChange }: SpeciesPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {SPECIES_OPTIONS.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "text-sm font-semibold px-3 py-1 rounded-full border transition-colors",
            value === opt
              ? "bg-brand-bg text-brand-500 border-brand-300"
              : "bg-white text-[var(--muted)] border-[var(--border)] hover:border-brand-200 hover:text-brand-500",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
