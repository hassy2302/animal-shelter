import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Providers from "./Providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://hamsoto.kr"),
  title: "유기 동물 입양 공고 🐾",
  description:
    "보호소의 강아지, 고양이, 햄스터, 토끼 등 유기동물 입양 공고를 확인하세요. 국가동물보호정보시스템 · 대전광역시 유기동물 데이터 기반.",
  keywords: ["유기동물", "입양", "보호소", "강아지", "고양이", "햄스터", "토끼", "유기견", "유기묘"],
  openGraph: {
    title: "유기 동물 입양 공고 🐾",
    description: "보호소의 동물들이 새 가족을 기다리고 있어요.",
    url: "https://hamsoto.kr",
    siteName: "유기 동물 입양 공고",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "유기 동물 입양 공고" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "유기 동물 입양 공고 🐾",
    description: "보호소의 동물들이 새 가족을 기다리고 있어요.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7K00PZZGYX"
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-7K00PZZGYX');`}
        </Script>
      </head>
      <body className="min-h-screen bg-[var(--bg)]"><Providers>{children}</Providers></body>
    </html>
  );
}
