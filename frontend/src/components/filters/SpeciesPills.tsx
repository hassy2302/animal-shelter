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
        <span key={opt} className="inline-flex items-center gap-1">
          <button
            onClick={() => onChange(opt)}
            aria-label={`${opt} 필터`}
            aria-pressed={value === opt}
            className={cn(
              "text-base font-semibold px-3 py-1.5 rounded-full border transition-colors",
              value === opt
                ? "bg-brand-bg text-brand-500 border-brand-300"
                : "bg-white text-[var(--muted)] border-[var(--border)] hover:border-brand-200 hover:text-brand-500",
            )}
          >
            {opt}
          </button>
          {opt === "기타" && (
            <span className="text-sm text-[var(--muted)]">
              — ex) 토끼임에도 토끼 메뉴에 없는 경우는 기타로 분류됩니다
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
