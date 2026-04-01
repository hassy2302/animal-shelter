import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Animal } from "@/types/animal";
import { getAnimalEmoji, formatDate } from "@/lib/utils";
import { BASE_URL } from "@/lib/constants";
import ShareButton from "@/components/animals/ShareButton";

async function getAnimal(noticeNo: string): Promise<Animal | null> {
  const apiBase = process.env.API_BASE_URL;
  try {
    const res = await fetch(
      `${apiBase}/api/animals/by-notice/${encodeURIComponent(noticeNo)}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const SEX_LABEL: Record<string, string> = { M: "수컷", F: "암컷", Q: "미상" };

type Props = { params: Promise<{ noticeNo: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { noticeNo } = await params;
  const decodedNoticeNo = decodeURIComponent(noticeNo);
  try {
    const animal = await getAnimal(decodedNoticeNo);
    if (!animal) return {};
    const title = `${animal.kindNm} - 유기 동물 공고`;
    const description = `${animal.careNm} 보호 중 · ${animal.orgNm}${animal.noticeEdt ? ` · 공고 마감 ${formatDate(animal.noticeEdt)}` : ""}`;
    const pageUrl = `${BASE_URL}/animal/${noticeNo}`;
    const ogImage = animal.popfile1 || animal.popfile2
      ? (animal.popfile1 || animal.popfile2)!
      : `${BASE_URL}/opengraph-image`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: pageUrl,
        images: [{ url: ogImage, width: 1200, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return {};
  }
}

export default async function AnimalDetailPage({ params }: Props) {
  const { noticeNo } = await params;
  const decodedNoticeNo = decodeURIComponent(noticeNo);

  const animal = await getAnimal(decodedNoticeNo);
  if (!animal) notFound();

  const {
    kindNm, upkind, sexCd, age, colorCd, weight,
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

  let stateBg = "bg-[#F5F4F2] text-[var(--muted)] border-[#E7E5E4]";
  let stateLabel = processState || "기타";
  if (processState.includes("보호")) {
    stateBg = "bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]";
    stateLabel = "보호중";
  } else if (processState.includes("입양") || processState.includes("종료")) {
    stateBg = "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]";
    stateLabel = "입양완료";
  }

  return (
    <main className="max-w-screen-sm mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--text)] mb-6 transition-colors"
      >
        ← 목록으로
      </Link>

      <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
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
          {/* 헤더 */}
          <div>
            <p className="text-xs text-[#B8B4AF] mb-2">📋 {decodedNoticeNo}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {source === "daejeon" && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                  대전시
                </span>
              )}
              <h1 className="text-xl font-extrabold text-[var(--text)]">{kindNm}</h1>
              <span className={`text-sm font-bold px-2 py-0.5 rounded-full border ${stateBg}`}>
                {stateLabel}
              </span>
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#F8F7F5] rounded-xl px-3 py-2">
              <div className="text-xs text-[var(--muted)] mb-0.5">성별</div>
              <div className="text-sm font-bold text-[var(--text)]">{SEX_LABEL[sexCd] ?? "미상"}</div>
            </div>
            <div className="bg-[#F8F7F5] rounded-xl px-3 py-2">
              <div className="text-xs text-[var(--muted)] mb-0.5">나이</div>
              <div className="text-sm font-bold text-[var(--text)]">{age}</div>
            </div>
            {weight && (
              <div className="bg-[#F8F7F5] rounded-xl px-3 py-2">
                <div className="text-xs text-[var(--muted)] mb-0.5">체중</div>
                <div className="text-sm font-bold text-[var(--text)]">{weight}</div>
              </div>
            )}
            {colorCd && (
              <div className="bg-[#F8F7F5] rounded-xl px-3 py-2">
                <div className="text-xs text-[var(--muted)] mb-0.5">색상</div>
                <div className="text-sm font-bold text-[var(--text)]">{colorCd}</div>
              </div>
            )}
          </div>

          <hr className="border-[var(--border)]" />

          {/* 보호소 */}
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
            <p>📍 보호 기관 위치 : {orgNm}</p>
            {happenPlace && <p>📌 발견장소: {happenPlace}</p>}
          </div>

          {/* 날짜 */}
          {(happenDt || noticeEdt) && (
            <div className="flex flex-row gap-2">
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

          {/* 버튼 */}
          <div className="flex gap-2">
            {detailUrl && (
              <a
                href={detailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-sm font-bold px-4 py-3 rounded-full bg-brand-bg text-brand-500 border border-brand-300 hover:bg-brand-200 transition-colors"
              >
                🔍 공고 보러가기
              </a>
            )}
            <div className={detailUrl ? "flex-1" : "w-full"}>
              <ShareButton
                url={`${BASE_URL}/animal/${encodeURIComponent(decodedNoticeNo)}`}
                title={kindNm}
                imageUrl={imgSrc ?? undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
