"use client";

import { useState } from "react";
import Image from "next/image";
import type { Animal } from "@/types/animal";
import { getAnimalEmoji, formatDate } from "@/lib/utils";
import { BASE_URL } from "@/lib/constants";
import AnimalDetailModal from "./AnimalDetailModal";
import ShareSheet from "./ShareSheet";
import StateBadge from "./StateBadge";

const SEX_LABEL: Record<string, string> = { M: "수컷", F: "암컷", Q: "미상" };

export default function AnimalCard({ animal }: { animal: Animal }) {
  const {
    noticeNo, kindNm, upkind, sexCd, age, colorCd, weight,
    careNm, careTel, orgNm, happenPlace, happenDt, noticeEdt,
    specialMark, popfile1, processState, source,
  } = animal;

  const imgSrc = popfile1 || animal.popfile2;
  const emoji = getAnimalEmoji(kindNm, upkind);
  const [imgError, setImgError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const shareUrl = noticeNo
    ? `${BASE_URL}/animal/${encodeURIComponent(noticeNo)}`
    : "";

  return (
    <>
      <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm card-hover flex flex-col">
        {/* 이미지 */}
        <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-brand-100 to-[#FFE8D6]">
          {imgSrc && !imgError ? (
            <Image
              src={imgSrc}
              alt={`${kindNm} - ${careNm} 보호 중`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <span className="text-6xl">{emoji}</span>
              {imgError && (
                <span className="text-xs text-[var(--muted)] text-center px-4">
                  이미지를 불러오는데 실패했어요
                </span>
              )}
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
            {careTel && <><br />📞 <a href={`tel:${careTel}`} className="text-brand-500 font-semibold">{careTel}</a></>}
            <br />📍 {orgNm}
            {happenPlace && <><br />📌 발견: {happenPlace}</>}
          </div>

          {/* 날짜 */}
          {(happenDt || noticeEdt) && (
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              {happenDt && (
                <div className="flex-1 bg-[#F8F7F5] rounded-lg px-2 py-1.5 text-center">
                  <div className="text-xs text-[var(--muted)] font-medium mb-0.5">🚑 구조일</div>
                  <div className="text-xs font-bold text-[var(--text)]">{formatDate(happenDt)}</div>
                </div>
              )}
              {noticeEdt && (
                <div className="flex-1 bg-[#FFF7ED] rounded-lg px-2 py-1.5 text-center">
                  <div className="text-xs text-[var(--muted)] font-medium mb-0.5">📅 공고 마감</div>
                  <div className="text-xs font-bold text-brand-500">{formatDate(noticeEdt)}</div>
                </div>
              )}
            </div>
          )}

          {/* 특이사항 */}
          {specialMark && (
            <p className="text-xs text-[var(--muted)] bg-[#FAFAF8] rounded-lg px-2.5 py-1.5 mt-1.5 line-clamp-3">
              💬 {specialMark}
            </p>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-1.5 px-3 pb-3 mt-auto">
          <button
            onClick={() => setShowModal(true)}
            aria-label={`${kindNm} 상세보기`}
            className="flex-1 text-center text-xs sm:text-sm font-bold px-2 sm:px-3 py-1.5 rounded-full bg-brand-bg text-brand-500 border border-brand-300 hover:bg-brand-200 transition-colors whitespace-nowrap"
          >
            🔍 상세보기
          </button>
          {shareUrl && (
            <button
              onClick={() => setShowShare(true)}
              aria-label={`${kindNm} 공유`}
              className="flex-1 text-xs sm:text-sm font-bold px-2 sm:px-3 py-1.5 rounded-full bg-[#F5F4F2] text-[#57534E] border border-[#E7E5E4] hover:bg-[#ECEAE8] transition-colors whitespace-nowrap"
            >
              🔗 공유
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <AnimalDetailModal animal={animal} onClose={() => setShowModal(false)} />
      )}
      {showShare && shareUrl && (
        <ShareSheet url={shareUrl} title={kindNm} imageUrl={imgSrc ?? undefined} onClose={() => setShowShare(false)} />
      )}
    </>
  );
}
