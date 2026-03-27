
interface StatsBarProps {
  total: number;
  page: number;
  totalPages: number;
  fetchedAt?: string;
}

export default function StatsBar({ total, page, totalPages, fetchedAt }: StatsBarProps) {
  const fetchedStr = fetchedAt
    ? new Date(fetchedAt).toLocaleString("ko-KR", {
        month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hour12: false,
      })
    : "";

  return (
    <div className="px-4 py-2.5 bg-white border border-[var(--border)] rounded-xl mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        <div className="flex items-center gap-3">
          <span className="font-bold text-base text-[var(--text)]">총 {total.toLocaleString()}건</span>
          <span className="w-1 h-1 bg-[#D6D3D1] rounded-full" />
          <span className="text-sm text-[var(--muted)]">{page} / {totalPages} 페이지</span>
        </div>
        {fetchedStr && (
          <span className="text-sm text-[var(--muted)] sm:ml-auto">
            🕐 {fetchedStr} 기준 (정각 자동 업데이트)
          </span>
        )}
      </div>
      <div className="text-right mt-1">
        <span className="text-xs text-[#C8C4BF]">출처: 농림축산식품부 공공동물보호시스템 · 대전광역시 유기동물</span>
      </div>
    </div>
  );
}
