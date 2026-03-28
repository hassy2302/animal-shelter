
interface StatsBarProps {
  total: number;
  page: number;
  totalPages: number;
  fetchedAt?: string;
}

export default function StatsBar({ total, page, totalPages, fetchedAt }: StatsBarProps) {
  const fetchedStr = (() => {
    if (!fetchedAt) return "";
    const d = new Date(fetchedAt);
    d.setMinutes(0, 0, 0);
    return d.toLocaleString("ko-KR", {
      month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false,
    });
  })();

  return (
    <div className="px-4 py-2.5 bg-white border border-[var(--border)] rounded-xl">
      <div className="flex items-center gap-3">
        <span className="font-bold text-base text-[var(--text)] shrink-0">총 {total.toLocaleString()}건</span>
        <span className="w-1 h-1 bg-[#D6D3D1] rounded-full shrink-0" />
        <span className="text-sm text-[var(--muted)] shrink-0">{page} / {totalPages} 페이지</span>
        {fetchedStr && (
          <span className="text-xs text-[var(--muted)] ml-auto text-right leading-tight">
            🕐 {fetchedStr}<br className="sm:hidden" /><span className="hidden sm:inline"> </span>기준
          </span>
        )}
      </div>
    </div>
  );
}
