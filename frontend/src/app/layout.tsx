import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "유기 동물 입양 공고",
  description:
    "보호소의 강아지, 고양이, 햄스터, 토끼 등 유기동물 입양 공고를 확인하세요.",
  openGraph: {
    title: "유기 동물 입양 공고",
    description: "보호소의 동물들이 새 가족을 기다리고 있어요.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3Y4321MKJF"
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-3Y4321MKJF');`}
        </Script>
      </head>
      <body className="min-h-screen bg-[var(--bg)]">{children}</body>
    </html>
  );
}
