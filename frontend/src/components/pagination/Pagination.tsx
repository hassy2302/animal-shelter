"use client";

import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}

function getVisiblePages(current: number, total: number, span = 10): (number | null)[] {
  if (total <= span + 2) return Array.from({ length: total }, (_, i) => i + 1);
  const half = Math.floor(span / 2);
  let start = Math.max(2, current - half);
  let end = Math.min(total - 1, start + span - 1);
  if (end === total - 1) start = Math.max(2, end - span + 1);
  const pages = [...new Set([1, total, ...Array.from({ length: end - start + 1 }, (_, i) => start + i)])].sort((a, b) => a - b);
  const result: (number | null)[] = [];
  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i] - pages[i - 1] > 1) result.push(null);
    result.push(pages[i]);
  }
  return result;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const visible = getVisiblePages(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-1 flex-wrap py-4">
      <PageBtn label="←" disabled={page <= 1} onClick={() => onChange(page - 1)} />
      {visible.map((p, i) =>
        p === null ? (
          <span key={`e-${i}`} className="px-2 text-[var(--muted)]">…</span>
        ) : (
          <PageBtn
            key={p}
            label={String(p)}
            active={p === page}
            onClick={() => onChange(p)}
          />
        ),
      )}
      <PageBtn label="→" disabled={page >= totalPages} onClick={() => onChange(page + 1)} />
    </div>
  );
}

function PageBtn({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "min-w-[40px] h-10 px-2 rounded-lg text-base font-semibold border transition-colors",
        active
          ? "bg-brand-bg text-brand-500 border-brand-300"
          : "bg-white text-[var(--muted)] border-[var(--border)] hover:border-brand-200 hover:text-brand-500",
        disabled && "opacity-30 cursor-not-allowed hover:border-[var(--border)] hover:text-[var(--muted)]",
      )}
    >
      {label}
    </button>
  );
}
