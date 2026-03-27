import Image from "next/image";
import type { Animal } from "@/types/animal";
import { getAnimalEmoji, formatDate } from "@/lib/utils";
import { UPKIND_DOG, UPKIND_CAT } from "@/lib/constants";

const SEX_LABEL: Record<string, string> = { M: "수컷", F: "암컷", Q: "미상" };

function StateBadge({ state }: { state: string }) {
  if (state.includes("보호"))
    return <span className="text-sm font-bold px-2 py-0.5 rounded-full bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]">보호중</span>;
  if (state.includes("입양") || state.includes("종료"))
    return <span className="text-sm font-bold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">입양완료</span>;
  return <span className="text-sm font-bold px-2 py-0.5 rounded-full bg-[#F5F4F2] text-[var(--muted)] border border-[#E7E5E4]">{state || "기타"}</span>;
}

export default function AnimalCard({ animal }: { animal: Animal }) {
  const {
    noticeNo, kindNm, upkind, sexCd, age, colorCd, weight,
    careNm, careTel, orgNm, happenPlace, happenDt, noticeEdt,
    specialMark, popfile1, processState, source, animalSeq, desertionNo,
  } = animal;

  const imgSrc = popfile1 || animal.popfile2;
  const emoji = getAnimalEmoji(kindNm, upkind);

  const detailUrl = source === "daejeon" && animalSeq
    ? `https://www.daejeon.go.kr/ani/AniStrayAnimalView.do?animalSeq=${animalSeq}`
    : desertionNo
    ? `https://www.animal.go.kr/front/awtis/public/publicDtl.do?desertionNo=${desertionNo}`
    : "";

  return (
    <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm card-hover flex flex-col">
      {/* 이미지 */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-brand-100 to-[#FFE8D6]">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={kindNm}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {emoji}
          </div>
        )}
      </div>

      {/* 본문 */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-[#B8B4AF] mb-1">📋 {noticeNo}</p>

        {/* 제목 */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          {source === "daejeon" && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
              대전시
            </span>
          )}
          <span className="text-base font-extrabold text-[var(--text)]">{kindNm}</span>
          <StateBadge state={processState} />
        </div>

        {/* 칩 */}
        <div className="flex flex-wrap gap-1 mb-2">
          <span className="chip">⚥ {SEX_LABEL[sexCd] ?? "미상"}</span>
          <span className="chip">🎂 {age}</span>
          {weight && <span className="chip">⚖️ {weight}</span>}
          {colorCd && <span className="chip chip-color">🎨 {colorCd}</span>}
        </div>

        <hr className="border-t border-[#F5F0EB] my-1.5" />

        {/* 위치 */}
        <div className="text-sm text-[#57534E] leading-relaxed">
          🏠 <b className="text-[var(--text)]">{careNm}</b>
          {careTel && <><br />📞 {careTel}</>}
          <br />📍 {orgNm}
          {happenPlace && <><br />📌 발견: {happenPlace}</>}
        </div>

        {/* 날짜 */}
        {(happenDt || noticeEdt) && (
          <>
            <hr className="border-t border-[#F5F0EB] my-1.5" />
            <div className="text-xs text-[var(--muted)] leading-relaxed">
              {happenDt && <>🚑 구조일: <b>{formatDate(happenDt)}</b><br /></>}
              {noticeEdt && <>📅 공고 기간: <b>{formatDate(noticeEdt)}</b></>}
            </div>
          </>
        )}

        {/* 특이사항 */}
        {specialMark && (
          <p className="text-xs text-[var(--muted)] bg-[#FAFAF8] rounded-lg px-2.5 py-1.5 mt-1.5 line-clamp-3">
            💬 {specialMark}
          </p>
        )}
      </div>

      {/* 버튼 */}
      {detailUrl && (
        <div className="flex gap-1.5 px-3 pb-3 mt-auto">
          <a
            href={detailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-sm font-bold px-3 py-1.5 rounded-full bg-brand-bg text-brand-500 border border-brand-300 hover:bg-brand-200 transition-colors"
          >
            🔍 상세보기
          </a>
          <CopyButton url={detailUrl} />
        </div>
      )}
    </div>
  );
}

function CopyButton({ url }: { url: string }) {
  return (
    <button
      onClick={async (e) => {
        const btn = e.currentTarget;
        await navigator.clipboard.writeText(url);
        btn.textContent = "✅ 복사됨";
        setTimeout(() => { btn.textContent = "🔗 링크 복사"; }, 2000);
      }}
      className="flex-1 text-sm font-bold px-3 py-1.5 rounded-full bg-[#F5F4F2] text-[#57534E] border border-[#E7E5E4] hover:bg-[#ECEAE8] transition-colors"
    >
      🔗 링크 복사
    </button>
  );
}
