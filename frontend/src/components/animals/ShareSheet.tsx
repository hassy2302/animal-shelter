"use client";

import { useEffect, useState } from "react";

interface ShareSheetProps {
  url: string;
  title?: string;
  imageUrl?: string;
  onClose: () => void;
}

function getKakao() {
  return typeof window !== "undefined" ? (window as unknown as { Kakao?: KakaoSDK }).Kakao : undefined;
}

interface KakaoSDK {
  isInitialized: () => boolean;
  init: (key: string) => void;
  Share: {
    sendDefault: (options: object) => void;
    sendScrap: (options: object) => void;
  };
}

export default function ShareSheet({ url, title, imageUrl, onClose }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleKakao = () => {
    const Kakao = getKakao();
    const appKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

    if (!Kakao || !appKey) {
      // SDK 미로드 시 Web Share API로 폴백
      if (typeof navigator.share === "function") {
        navigator.share({ title: title ?? "유기동물 공고", url }).catch(() => {});
      } else {
        navigator.clipboard.writeText(url);
        alert("카카오 SDK를 불러오지 못했어요.\n링크가 복사됐으니 카카오톡에 붙여넣기 해주세요.");
      }
      onClose();
      return;
    }

    if (!Kakao.isInitialized()) {
      Kakao.init(appKey);
    }

    Kakao.Share.sendScrap({
      requestUrl: url,
    });
    onClose();
  };

  const handleX = () => {
    const text = title ? `${title} 유기동물 공고` : "유기동물 공고";
    window.open(
      `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
    onClose();
  };

  const handleMore = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: title ?? "유기동물 공고", text: url });
      } catch {
        // 취소 또는 오류 무시
      } finally {
        onClose();
      }
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => { setCopied(false); onClose(); }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="공유하기"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white w-full sm:max-w-xs rounded-t-3xl sm:rounded-2xl shadow-xl px-5 pt-5 pb-8 sm:pb-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 (모바일) */}
        <div className="sm:hidden w-10 h-1 bg-[#D6D3D1] rounded-full mx-auto mb-4" />

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-extrabold text-[var(--text)]">공유하기</h3>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="w-8 h-8 flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] text-xl transition-colors rounded-full hover:bg-[#F5F4F2]"
          >
            ✕
          </button>
        </div>

        {/* 공유 옵션 */}
        <div className="flex justify-around">
          {/* 카카오톡 */}
          <button onClick={handleKakao} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-[#FEE500] flex items-center justify-center text-2xl shadow-sm group-hover:brightness-95 transition-all">
              💬
            </div>
            <span className="text-xs font-semibold text-[var(--text)]">카카오톡</span>
          </button>

          {/* X (트위터) */}
          <button onClick={handleX} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-white font-black text-xl shadow-sm group-hover:bg-[#1a1a1a] transition-all">
              𝕏
            </div>
            <span className="text-xs font-semibold text-[var(--text)]">X (트위터)</span>
          </button>

          {/* 더보기 */}
          {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
            <button onClick={handleMore} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-2xl bg-[#F5F4F2] flex items-center justify-center text-2xl shadow-sm group-hover:bg-[#ECEAE8] transition-all">
                ···
              </div>
              <span className="text-xs font-semibold text-[var(--text)]">더보기</span>
            </button>
          )}

          {/* 링크 복사 */}
          <button onClick={handleCopy} className="flex flex-col items-center gap-2 group">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-all ${
                copied ? "bg-[#F0FDF4]" : "bg-[#F5F4F2] group-hover:bg-[#ECEAE8]"
              }`}
            >
              {copied ? "✅" : "🔗"}
            </div>
            <span className="text-xs font-semibold text-[var(--text)]">
              {copied ? "복사됨!" : "링크 복사"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
