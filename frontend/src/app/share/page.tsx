"use client";

import { useEffect, Suspense } from "react";
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

  useEffect(() => {
    if (!url) return;
    const appKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    if (!appKey) return;

    const tryShare = () => {
      const Kakao = getKakao();
      if (!Kakao) return false;
      if (!Kakao.isInitialized()) Kakao.init(appKey);

      // window.open → window.location.href 로 교체 (Safari 팝업 차단 우회)
      const origOpen = window.open.bind(window);
      (window as any).open = (openUrl: string) => {
        window.location.href = openUrl;
        return null;
      };

      Kakao.Share.sendScrap({ requestUrl: url });

      setTimeout(() => { (window as any).open = origOpen; }, 500);
      return true;
    };

    if (!tryShare()) {
      const interval = setInterval(() => {
        if (tryShare()) clearInterval(interval);
      }, 200);
      setTimeout(() => clearInterval(interval), 5000);
    }
  }, [url]);

  if (!url) return (
    <div className="flex items-center justify-center min-h-screen text-gray-500">
      잘못된 접근입니다.
    </div>
  );

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
