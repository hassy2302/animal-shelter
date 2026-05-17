"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface KakaoSDK {
  isInitialized: () => boolean;
  init: (key: string) => void;
  Share: { sendScrap: (options: object) => void };
}

function getKakao(): KakaoSDK | undefined {
  return typeof window !== "undefined"
    ? (window as unknown as { Kakao?: KakaoSDK }).Kakao
    : undefined;
}

function ShareHandler() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const [ready, setReady] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!url) return;
    const appKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    if (!appKey) return;

    intervalRef.current = setInterval(() => {
      const Kakao = getKakao();
      if (Kakao) {
        if (!Kakao.isInitialized()) Kakao.init(appKey);
        clearInterval(intervalRef.current!);
        setReady(true);
      }
    }, 100);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [url]);

  const handleShare = () => {
    if (!url) return;
    const Kakao = getKakao();
    if (!Kakao) return;
    Kakao.Share.sendScrap({ requestUrl: url });
  };

  if (!url) return (
    <div className="flex items-center justify-center min-h-screen text-gray-500">
      잘못된 접근입니다.
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6">
      <img
        src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png"
        alt="카카오톡"
        className="w-20 h-20 rounded-2xl shadow"
      />
      <p className="text-lg font-bold text-gray-800">카카오톡으로 공유하기</p>
      <button
        onClick={handleShare}
        disabled={!ready}
        className="w-full max-w-xs py-4 rounded-2xl bg-[#FEE500] text-[#3C1E1E] font-bold text-base disabled:opacity-40"
      >
        {ready ? "카카오톡으로 공유" : "로딩 중..."}
      </button>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense>
      <ShareHandler />
    </Suspense>
  );
}
