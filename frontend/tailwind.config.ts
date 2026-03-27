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
    },
  },
  plugins: [],
};

export default config;
