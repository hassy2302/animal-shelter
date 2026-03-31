"use client";

import { useSido, useSigungu } from "@/hooks/useRegions";
import { STATE_OPTIONS } from "@/lib/constants";
import type { AnimalFilters } from "@/types/animal";

interface FilterBarProps {
  filters: AnimalFilters;
  onChange: (patch: Partial<AnimalFilters>) => void;
  onReset: () => void;
}

export default function FilterBar({ filters, onChange, onReset }: FilterBarProps) {
  const { sido, isLoading: sidoLoading } = useSido();
  const { sigungu, isLoading: sigunguLoading } = useSigungu(filters.sido_code ?? "");

  return (
    <div className="flex gap-2 items-center">
      <select
        id="filter-sido"
        aria-label="시도"
        value={filters.sido_code ?? ""}
        onChange={(e) => onChange({ sido_code: e.target.value, sigungu_code: "", page: 1 })}
        disabled={sidoLoading}
        className="select-field flex-1 min-w-0 disabled:opacity-40"
      >
        <option value="">{sidoLoading ? "로딩 중..." : "시도"}</option>
        {sido.map((s) => (
          <option key={s.code} value={s.code}>{s.name}</option>
        ))}
      </select>

      <select
        id="filter-sigungu"
        aria-label="시군구"
        value={filters.sigungu_code ?? ""}
        onChange={(e) => onChange({ sigungu_code: e.target.value, page: 1 })}
        disabled={!filters.sido_code || sigunguLoading}
        className="select-field flex-1 min-w-0 disabled:opacity-40"
      >
        <option value="">{sigunguLoading ? "로딩 중..." : "시군구"}</option>
        {sigungu.map((s) => (
          <option key={s.code} value={s.code}>{s.name}</option>
        ))}
      </select>

      <select
        id="filter-state"
        aria-label="상태"
        value={filters.state ?? "protect"}
        onChange={(e) => onChange({ state: e.target.value as AnimalFilters["state"], page: 1 })}
        className="select-field w-24 shrink-0"
      >
        {STATE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <button
        onClick={onReset}
        aria-label="필터 초기화"
        className="shrink-0 text-sm font-semibold px-3 py-2 rounded-lg bg-white dark:bg-[#292524] border border-[var(--border)] text-[var(--muted)] hover:border-brand-200 hover:text-brand-500 transition-colors"
      >
        초기화
      </button>
    </div>
  );
}
