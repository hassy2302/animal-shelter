"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

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

  useEffect(() => {
    if (!url) return;

    const appKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

    const tryShare = () => {
      const Kakao = getKakao();
      if (!Kakao || !appKey) return false;
      if (!Kakao.isInitialized()) Kakao.init(appKey);
      Kakao.Share.sendScrap({ requestUrl: url });
      return true;
    };

    // SDK가 로드될 때까지 재시도
    if (!tryShare()) {
      const interval = setInterval(() => {
        if (tryShare()) clearInterval(interval);
      }, 200);
      setTimeout(() => clearInterval(interval), 5000);
    }
  }, [url]);

  if (!url) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        잘못된 접근입니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <img
        src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png"
        alt="카카오톡"
        className="w-16 h-16 rounded-2xl"
      />
      <p className="text-gray-600">카카오톡으로 공유하는 중...</p>
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
