import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "유기 동물 공고";
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
          backgroundColor: "#FFF8F4",
          backgroundImage: "linear-gradient(135deg, #FFF1E6 0%, #FFF8F4 50%, #EEF4FF 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 100, marginBottom: 16 }}>🐹</div>
        <div style={{ fontSize: 72, fontWeight: 900, color: "#C2410C", marginBottom: 8, letterSpacing: "-2px" }}>
          햄소토
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#1C1917", marginBottom: 16 }}>
          유기 동물 입양 공고
        </div>
        <div style={{ fontSize: 24, color: "#78716C", textAlign: "center", maxWidth: 800 }}>
          보호소의 동물들이 새 가족을 기다리고 있어요
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 20,
            fontWeight: 700,
            color: "#C2410C",
            background: "#FFF3E0",
            padding: "10px 28px",
            borderRadius: 999,
            border: "2px solid #FFE0B2",
          }}
        >
          hamsoto.kr
        </div>
      </div>
    ),
    size,
  );
}
