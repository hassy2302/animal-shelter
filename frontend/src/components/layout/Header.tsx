export default function Header() {
  return (
    <div className="bg-gradient-to-br from-brand-100 via-[#FFF8F4] to-[#EEF4FF] border border-brand-200 rounded-2xl px-8 py-6 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)] tracking-tight mb-1.5">
            🐾 유기 동물 입양 공고
          </h1>
          <p className="text-base text-[var(--muted)] leading-relaxed">
            보호소의 작은 동물들이에요.<br />
            공고 기간이 지나면 입양 절차가 시작돼요. (공고 및 보호소마다 상이할 수 있어요)<br />
            새 가족이 필요해요.
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
          <span className="text-xs text-[var(--muted)] font-semibold">데이터 출처</span>
          <span className="text-sm bg-white/70 border border-[#E5E0D8] text-[var(--muted)] px-2.5 py-0.5 rounded-full font-semibold">
            🏛️ 국가동물보호정보시스템
          </span>
          <span className="text-sm bg-white/70 border border-[#E5E0D8] text-[var(--muted)] px-2.5 py-0.5 rounded-full font-semibold">
            🌆 대전광역시 유기동물공고현황
          </span>
        </div>
      </div>
    </div>
  );
}
