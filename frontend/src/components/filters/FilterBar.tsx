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
  const { sido } = useSido();
  const { sigungu } = useSigungu(filters.sido_code ?? "");

  return (
    <div className="flex flex-wrap gap-2 items-end">
      {/* 시도 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-[var(--muted)]">시도</label>
        <select
          value={filters.sido_code ?? ""}
          onChange={(e) => onChange({ sido_code: e.target.value, sigungu_code: "", page: 1 })}
          className="select-field"
        >
          <option value="">전체</option>
          {sido.map((s) => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* 시군구 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-[var(--muted)]">시군구</label>
        <select
          value={filters.sigungu_code ?? ""}
          onChange={(e) => onChange({ sigungu_code: e.target.value, page: 1 })}
          disabled={!filters.sido_code}
          className="select-field disabled:opacity-40"
        >
          <option value="">전체</option>
          {sigungu.map((s) => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* 상태 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-[var(--muted)]">상태</label>
        <select
          value={filters.state ?? "protect"}
          onChange={(e) => onChange({ state: e.target.value as AnimalFilters["state"], page: 1 })}
          className="select-field"
        >
          {STATE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* 초기화 */}
      <button
        onClick={onReset}
        className="text-sm font-semibold px-4 py-2 rounded-lg bg-white border border-[var(--border)] text-[var(--muted)] hover:border-brand-200 hover:text-brand-500 transition-colors"
      >
        초기화
      </button>
    </div>
  );
}
