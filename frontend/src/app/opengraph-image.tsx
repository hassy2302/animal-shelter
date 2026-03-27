import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "유기 동물 입양 공고";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FFF1E6 0%, #FFF8F4 50%, #EEF4FF 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 120, marginBottom: 24 }}>🐾</div>
        <div style={{ fontSize: 56, fontWeight: 900, color: "#1C1917", marginBottom: 16 }}>
          유기 동물 입양 공고
        </div>
        <div style={{ fontSize: 28, color: "#78716C", textAlign: "center", maxWidth: 800 }}>
          보호소의 동물들이 새 가족을 기다리고 있어요
        </div>
        <div
          style={{
            marginTop: 40,
            display: "flex",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 20,
              color: "#A8A29E",
              background: "rgba(255,255,255,0.7)",
              border: "1px solid #E5E0D8",
              borderRadius: 999,
              padding: "8px 20px",
            }}
          >
            🏛️ 국가동물보호정보시스템
          </div>
          <div
            style={{
              fontSize: 20,
              color: "#A8A29E",
              background: "rgba(255,255,255,0.7)",
              border: "1px solid #E5E0D8",
              borderRadius: 999,
              padding: "8px 20px",
            }}
          >
            🌆 대전광역시 유기동물공고현황
          </div>
        </div>
      </div>
    ),
    size,
  );
}
