"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Animal } from "@/types/animal";
import { getAnimalEmoji, formatDate } from "@/lib/utils";
import { BASE_URL } from "@/lib/constants";
import ShareSheet from "./ShareSheet";
import StateBadge from "./StateBadge";

const SEX_LABEL: Record<string, string> = { M: "수컷", F: "암컷", Q: "미상" };

interface Props {
  animal: Animal;
  onClose: () => void;
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#F8F7F5] rounded-xl px-3 py-2">
      <div className="text-xs text-[var(--muted)] mb-0.5">{label}</div>
      <div className="text-sm font-bold text-[var(--text)]">{value}</div>
    </div>
  );
}

export default function AnimalDetailModal({ animal, onClose }: Props) {
  const [showShare, setShowShare] = useState(false);
  const {
    noticeNo, kindNm, upkind, sexCd, age, colorCd, weight,
    careNm, careTel, orgNm, happenPlace, happenDt, noticeEdt,
    specialMark, popfile1, popfile2, processState, source, animalSeq, desertionNo,
  } = animal;

  const imgSrc = popfile1 || popfile2;
  const emoji = getAnimalEmoji(kindNm, upkind);

  const detailUrl = source === "daejeon" && animalSeq
    ? `https://www.daejeon.go.kr/ani/AniStrayAnimalView.do?animalSeq=${animalSeq}`
    : desertionNo
    ? `https://www.animal.go.kr/front/awtis/public/publicDtl.do?desertionNo=${desertionNo}`
    : "";
  const shareUrl = noticeNo
    ? `${BASE_URL}/animal/${encodeURIComponent(noticeNo)}`
    : "";

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`${kindNm} 상세정보`}
    >
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 패널 */}
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[90vh] flex flex-col shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 flex-wrap">
            {source === "daejeon" && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">대전시</span>
            )}
            <h2 className="text-lg font-extrabold text-[var(--text)]">{kindNm}</h2>
            <StateBadge state={processState} />
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="w-8 h-8 flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] text-xl transition-colors rounded-full hover:bg-[#F5F4F2]"
          >
            ✕
          </button>
        </div>

        {/* 스크롤 영역 */}
        <div className="overflow-y-auto flex-1">
          {/* 이미지 */}
          <div className="relative w-full aspect-video bg-gradient-to-br from-brand-100 to-[#FFE8D6]">
            {imgSrc ? (
              <Image
                src={imgSrc}
                alt={`${kindNm} - ${careNm} 보호 중`}
                fill
                className="object-contain"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl">{emoji}</span>
              </div>
            )}
          </div>

          <div className="p-5 space-y-4">
            {/* 공고번호 */}
            <p className="text-xs text-[#B8B4AF]">📋 {noticeNo}</p>

            {/* 기본 정보 칩 */}
            <div className="grid grid-cols-2 gap-2">
              <InfoChip label="성별" value={SEX_LABEL[sexCd] ?? "미상"} />
              <InfoChip label="나이" value={age} />
              {weight && <InfoChip label="체중" value={weight} />}
              {colorCd && <InfoChip label="색상" value={colorCd} />}
            </div>

            <hr className="border-[var(--border)]" />

            {/* 보호소 정보 */}
            <div className="space-y-1.5 text-sm text-[var(--text)]">
              <p>🏠 <b>{careNm}</b></p>
              {careTel && (
                <a
                  href={`tel:${careTel}`}
                  className="flex items-center gap-2 w-fit px-3 py-1.5 rounded-full bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3] font-bold text-sm hover:bg-[#FFE4E6] transition-colors"
                >
                  📞 {careTel}
                </a>
              )}
              <p>📍 {orgNm}</p>
              {happenPlace && <p>📌 발견장소: {happenPlace}</p>}
            </div>

            {/* 날짜 */}
            {(happenDt || noticeEdt) && (
              <div className="flex flex-col sm:flex-row gap-2">
                {happenDt && (
                  <div className="flex-1 bg-[#F8F7F5] rounded-xl px-3 py-2.5 text-center">
                    <div className="text-xs text-[var(--muted)] mb-0.5">🚑 구조일</div>
                    <div className="text-sm font-bold text-[var(--text)]">{formatDate(happenDt)}</div>
                  </div>
                )}
                {noticeEdt && (
                  <div className="flex-1 bg-[#FFF7ED] rounded-xl px-3 py-2.5 text-center">
                    <div className="text-xs text-[var(--muted)] mb-0.5">📅 공고 마감</div>
                    <div className="text-sm font-bold text-brand-500">{formatDate(noticeEdt)}</div>
                  </div>
                )}
              </div>
            )}

            {/* 특이사항 */}
            {specialMark && (
              <div className="bg-[#FAFAF8] rounded-xl px-3 py-3">
                <p className="text-xs font-bold text-[var(--muted)] mb-1">💬 특이사항</p>
                <p className="text-sm text-[var(--text)] leading-relaxed">{specialMark}</p>
              </div>
            )}
          </div>
        </div>

        {/* 하단 버튼 */}
        {(detailUrl || shareUrl) && (
          <div className="px-5 py-4 border-t border-[var(--border)] flex gap-2">
            {detailUrl && (
              <a
                href={detailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-sm font-bold px-4 py-2.5 rounded-full bg-brand-bg text-brand-500 border border-brand-300 hover:bg-brand-200 transition-colors"
              >
                🔍 공고 보러가기
              </a>
            )}
            {shareUrl && (
              <button
                onClick={() => setShowShare(true)}
                aria-label={`${kindNm} 공유`}
                className="flex-1 text-sm font-bold px-4 py-2.5 rounded-full bg-[#F5F4F2] text-[#57534E] border border-[#E7E5E4] hover:bg-[#ECEAE8] transition-colors"
              >
                🔗 공유
              </button>
            )}
          </div>
        )}
      </div>
      {showShare && shareUrl && (
        <ShareSheet url={shareUrl} title={kindNm} imageUrl={imgSrc ?? undefined} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}
