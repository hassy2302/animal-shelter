export default function Header() {
  return (
    <div className="bg-gradient-to-br from-brand-100 via-[#FFF8F4] to-[#EEF4FF] border border-brand-200 rounded-2xl px-8 py-6 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* 왼쪽: 제목 + 설명 */}
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)] tracking-tight mb-1.5">
            🐾 유기 동물 입양 공고
          </h1>
          <p className="text-base text-[var(--muted)] leading-relaxed">
            보호소의 작은 동물들이에요.<br />
            공고 기간이 지나면 입양 절차가 시작돼요.<br />
            <span className="text-sm">(공고 및 보호소마다 상이할 수 있어요)</span><br />
            새 가족이 필요해요.
          </p>
        </div>

        {/* 오른쪽: PC에서만 표시 */}
        <div className="hidden sm:flex flex-col items-end gap-3 shrink-0">
          {/* 신고 안내 */}
          <div className="bg-white/70 border border-brand-200 rounded-2xl px-5 py-3 text-center">
            <p className="text-sm font-bold text-[#9A3412] mb-2">🐾 유기동물을 발견하셨나요?</p>
            <div className="flex items-center gap-2">
              <a
                href="tel:1577-0954"
                className="text-sm font-bold text-brand-500 hover:text-brand-600 bg-white border border-brand-200 px-3 py-1 rounded-full transition-colors shadow-sm whitespace-nowrap"
              >
                📞 1577-0954
              </a>
              <a
                href="https://www.animal.go.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-brand-500 hover:text-brand-600 bg-white border border-brand-200 px-3 py-1 rounded-full transition-colors shadow-sm whitespace-nowrap"
              >
                🌐 홈페이지 신고
              </a>
            </div>
          </div>
          {/* 데이터 출처 */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-[var(--muted)] font-semibold">데이터 출처</span>
            <div className="flex gap-1.5">
              <span className="text-xs bg-white/70 border border-[#E5E0D8] text-[var(--muted)] px-2 py-0.5 rounded-full font-semibold">
                🏛️ 국가동물보호정보시스템
              </span>
              <span className="text-xs bg-white/70 border border-[#E5E0D8] text-[var(--muted)] px-2 py-0.5 rounded-full font-semibold">
                🌆 대전광역시 유기동물공고현황
              </span>
            </div>
          </div>
        </div>

        {/* 모바일: 데이터 출처만 */}
        <div className="flex sm:hidden flex-col items-start gap-1.5 shrink-0">
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
