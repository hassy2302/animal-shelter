export default function StateBadge({ state }: { state: string }) {
  if (state.includes("보호"))
    return <span className="text-sm font-bold px-2 py-0.5 rounded-full bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]">보호중</span>;
  if (state.includes("입양") || state.includes("종료"))
    return <span className="text-sm font-bold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">입양완료</span>;
  return <span className="text-sm font-bold px-2 py-0.5 rounded-full bg-[#F5F4F2] text-[var(--muted)] border border-[#E7E5E4]">{state || "기타"}</span>;
}
