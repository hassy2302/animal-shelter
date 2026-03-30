export default function Header() {
  return (
    <div className="bg-gradient-to-br from-brand-100 via-[#FFF8F4] to-[#EEF4FF] border border-brand-200 rounded-2xl px-8 py-6 mb-4">
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
  );
}
