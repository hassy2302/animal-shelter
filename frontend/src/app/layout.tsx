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
          id="gtm-head"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KSHWZ9C');`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg)]">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KSHWZ9C"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
