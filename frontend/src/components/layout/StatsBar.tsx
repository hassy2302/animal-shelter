"use client";

import { formatAgo } from "@/lib/utils";

interface StatsBarProps {
  total: number;
  page: number;
  totalPages: number;
  fetchedAt?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function StatsBar({
  total,
  page,
  totalPages,
  fetchedAt,
  onRefresh,
  isRefreshing,
}: StatsBarProps) {
  const ageMin = fetchedAt
    ? Math.floor((Date.now() - new Date(fetchedAt).getTime()) / 60000)
    : 0;

  const showRefresh = ageMin >= 10;
  const fetchedStr = fetchedAt
    ? new Date(fetchedAt).toLocaleString("ko-KR", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hour12: false,
      })
    : "";

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-[var(--border)] rounded-xl mb-4">
      <span className="font-bold text-sm text-[var(--text)]">총 {total.toLocaleString()}건</span>
      <span className="w-1 h-1 bg-[#D6D3D1] rounded-full" />
      <span className="text-xs text-[var(--muted)]">{page} / {totalPages} 페이지</span>
      {fetchedStr && (
        <>
          <span className="text-xs text-[var(--muted)] ml-auto">
            🕐 {fetchedStr} 기준 ({formatAgo(fetchedAt!)})
          </span>
          {showRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="text-xs font-semibold px-3 py-1 bg-brand-100 text-brand-500 border border-brand-300 rounded-full hover:bg-brand-200 transition-colors disabled:opacity-50"
            >
              {isRefreshing ? "갱신 중..." : "🔄 갱신"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
