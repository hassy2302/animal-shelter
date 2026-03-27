import { formatAgo } from "@/lib/utils";

interface StatsBarProps {
  total: number;
  page: number;
  totalPages: number;
  fetchedAt?: string;
}

export default function StatsBar({ total, page, totalPages, fetchedAt }: StatsBarProps) {
  const fetchedStr = fetchedAt
    ? new Date(fetchedAt).toLocaleString("ko-KR", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hour12: false,
      })
    : "";

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-[var(--border)] rounded-xl mb-4">
      <span className="font-bold text-base text-[var(--text)]">총 {total.toLocaleString()}건</span>
      <span className="w-1 h-1 bg-[#D6D3D1] rounded-full" />
      <span className="text-sm text-[var(--muted)]">{page} / {totalPages} 페이지</span>
      {fetchedStr && (
        <span className="text-sm text-[var(--muted)] ml-auto">
          🕐 {fetchedStr} 기준 ({formatAgo(fetchedAt!)})
        </span>
      )}
    </div>
  );
}
