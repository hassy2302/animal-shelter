import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#FFF8F2",
          100: "#FFF3E0",
          200: "#FFE0B2",
          300: "#FDDCB5",
          400: "#FFA94D",
          500: "#C2410C",
          600: "#9A3412",
        },
      },
      fontFamily: {
        sans: ["Pretendard", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      animation: {
        marquee: "marquee 14s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
