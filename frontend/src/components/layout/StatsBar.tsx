
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
      timeZone: "Asia/Seoul",
      month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false,
    });
  })();

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="font-bold text-base text-[var(--text)]">총 {total.toLocaleString()}건</span>
        <span className="w-1 h-1 bg-[#D6D3D1] rounded-full" />
        <span className="text-sm text-[var(--muted)]">{page} / {totalPages} 페이지</span>
      </div>
      {fetchedStr && (
        <p className="text-xs text-[var(--muted)] mt-0.5">🕐 {fetchedStr} 기준</p>
      )}
    </div>
  );
}
